import { store } from '../store'
import { rpcHandler, getBackend } from '../lib/rpc'
import { clearMessages, setPeersCount } from '../store/chatSlice'
import {
  API_PING,
  API_REVERSE,
  API_CREATE_ROOM,
  API_JOIN_ROOM,
  API_SEND_MESSAGE,
  API_RECEIVE_MESSAGE,
  API_UPDATE_CONNECTIONS,
} from '../../worklet/api'

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Encode a plain string into a Uint8Array the same way b4a.toString reverses. */
function toUint8Array(str: string): Uint8Array {
  return Buffer.from(str, 'utf8')
}

/** Build a fake RPC request object. */
function makeReq(command: string, body: string) {
  return { command, data: toUint8Array(body) }
}

/** Create a mock RpcInstance where every request returns the supplied reply. */
function makeMockRpc(replyValue: string) {
  const send = jest.fn()
  const reply = jest.fn().mockResolvedValue(replyValue)
  const request = jest.fn().mockReturnValue({ send, reply })
  return { rpc: { request }, mocks: { send, reply, request } }
}

// ─── rpcHandler ──────────────────────────────────────────────────────────────

describe('rpcHandler', () => {
  let dispatchSpy: jest.SpyInstance

  beforeEach(() => {
    dispatchSpy = jest.spyOn(store, 'dispatch')
    // Reset chat state
    store.dispatch(clearMessages())
    store.dispatch(setPeersCount(0))
    // Clear setup calls so each test only sees its own dispatches
    dispatchSpy.mockClear()
  })

  afterEach(() => {
    dispatchSpy.mockRestore()
  })

  describe(API_RECEIVE_MESSAGE, () => {
    function buildMessageReq(message: string, memberId: string) {
      const workletMsg = { message, timestamp: 1_700_000_000_000, type: 'text', local: true }
      const body = JSON.stringify({ event: JSON.stringify(workletMsg), memberId })
      return makeReq(API_RECEIVE_MESSAGE, body)
    }

    it('dispatches addMessage with the message text', async () => {
      await rpcHandler(buildMessageReq('hello world', 'peer_abc'))

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'chat/addMessage',
          payload: expect.objectContaining({ message: 'hello world' }),
        }),
      )
    })

    it('sets local: false on received messages', async () => {
      await rpcHandler(buildMessageReq('remote msg', 'peer_xyz'))

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ local: false }),
        }),
      )
    })

    it('preserves the memberId from the worklet data', async () => {
      await rpcHandler(buildMessageReq('hi', 'peer_42'))

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ memberId: 'peer_42' }),
        }),
      )
    })

    it('passes undefined memberId when absent in worklet data', async () => {
      // Build request without memberId field
      const workletMsg = { message: 'anon', timestamp: 0, type: 'text', local: true }
      const body = JSON.stringify({ event: JSON.stringify(workletMsg) })
      await rpcHandler(makeReq(API_RECEIVE_MESSAGE, body))

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ memberId: undefined }),
        }),
      )
    })

    it('sets type: "text"', async () => {
      await rpcHandler(buildMessageReq('typed', 'peer_1'))

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ type: 'text' }),
        }),
      )
    })

    it('adds a timestamp field', async () => {
      await rpcHandler(buildMessageReq('ts check', 'peer_1'))

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ timestamp: expect.any(Number) }),
        }),
      )
    })
  })

  describe(API_UPDATE_CONNECTIONS, () => {
    it('dispatches setPeersCount with the parsed integer', async () => {
      await rpcHandler(makeReq(API_UPDATE_CONNECTIONS, '5'))

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'chat/setPeersCount', payload: 5 }),
      )
    })

    it('handles string "0" (all peers gone)', async () => {
      await rpcHandler(makeReq(API_UPDATE_CONNECTIONS, '0'))

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'chat/setPeersCount', payload: 0 }),
      )
    })

    it('defaults to 0 when value is not a valid number', async () => {
      await rpcHandler(makeReq(API_UPDATE_CONNECTIONS, 'not-a-number'))

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'chat/setPeersCount', payload: 0 }),
      )
    })

    it('handles a large peer count', async () => {
      await rpcHandler(makeReq(API_UPDATE_CONNECTIONS, '999'))

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'chat/setPeersCount', payload: 999 }),
      )
    })
  })

  describe('unknown command', () => {
    it('does not dispatch anything for an unknown command', async () => {
      await rpcHandler(makeReq('unknown_command', '{}'))

      // dispatch may have been called to reset state in beforeEach, but NOT
      // for the unknown command — verify the last call is not from rpcHandler
      const callTypes = dispatchSpy.mock.calls.map((c) => c[0].type)
      expect(callTypes).not.toContain('chat/addMessage')
      expect(callTypes).not.toContain('chat/setPeersCount')
    })
  })
})

// ─── getBackend ───────────────────────────────────────────────────────────────

describe('getBackend', () => {
  describe('ping', () => {
    it('sends the ping message', () => {
      const { rpc, mocks } = makeMockRpc('pong')
      getBackend(rpc).ping(() => {})
      expect(mocks.request).toHaveBeenCalledWith(API_PING)
      expect(mocks.send).toHaveBeenCalledWith('Hello from RN UI!')
    })

    it('calls the callback with the reply string', async () => {
      const { rpc } = makeMockRpc('pong-response')
      const callback = jest.fn()
      getBackend(rpc).ping(callback)
      await Promise.resolve() // flush microtasks
      expect(callback).toHaveBeenCalledWith('pong-response')
    })
  })

  describe('reverse', () => {
    it('sends the reverse message', () => {
      const { rpc, mocks } = makeMockRpc('reversed')
      getBackend(rpc).reverse(() => {})
      expect(mocks.request).toHaveBeenCalledWith(API_REVERSE)
      expect(mocks.send).toHaveBeenCalledWith('Reverse RN UI!')
    })

    it('calls the callback with the reply', async () => {
      const { rpc } = makeMockRpc('!IU NR esreveR')
      const callback = jest.fn()
      getBackend(rpc).reverse(callback)
      await Promise.resolve()
      expect(callback).toHaveBeenCalledWith('!IU NR esreveR')
    })
  })

  describe('createRoom', () => {
    it('sends a create-room request', () => {
      const reply = JSON.stringify({ done: true, topic: 'abc123' })
      const { rpc, mocks } = makeMockRpc(reply)
      getBackend(rpc).createRoom(() => {})
      expect(mocks.request).toHaveBeenCalledWith(API_CREATE_ROOM)
      expect(mocks.send).toHaveBeenCalledWith('Create Room!')
    })

    it('calls callback with the topic when done: true', async () => {
      const reply = JSON.stringify({ done: true, topic: 'my_topic_hash' })
      const { rpc } = makeMockRpc(reply)
      const callback = jest.fn()
      getBackend(rpc).createRoom(callback)
      await Promise.resolve()
      expect(callback).toHaveBeenCalledWith('my_topic_hash')
    })

    it('does NOT call callback when done: false', async () => {
      const reply = JSON.stringify({ done: false, topic: '' })
      const { rpc } = makeMockRpc(reply)
      const callback = jest.fn()
      getBackend(rpc).createRoom(callback)
      await Promise.resolve()
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('joinRoom', () => {
    it('sends the topic as the request body', () => {
      const reply = JSON.stringify({ done: true, topic: 'join_topic' })
      const { rpc, mocks } = makeMockRpc(reply)
      getBackend(rpc).joinRoom('join_topic', () => {})
      expect(mocks.request).toHaveBeenCalledWith(API_JOIN_ROOM)
      expect(mocks.send).toHaveBeenCalledWith('join_topic')
    })

    it('calls callback with confirmed topic when done: true', async () => {
      const reply = JSON.stringify({ done: true, topic: 'confirmed_topic' })
      const { rpc } = makeMockRpc(reply)
      const callback = jest.fn()
      getBackend(rpc).joinRoom('confirmed_topic', callback)
      await Promise.resolve()
      expect(callback).toHaveBeenCalledWith('confirmed_topic')
    })

    it('does NOT call callback when done: false', async () => {
      const reply = JSON.stringify({ done: false, topic: '' })
      const { rpc } = makeMockRpc(reply)
      const callback = jest.fn()
      getBackend(rpc).joinRoom('bad_topic', callback)
      await Promise.resolve()
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('sendMessage', () => {
    it('sends the message text via the RPC request', () => {
      const { rpc, mocks } = makeMockRpc('ok')
      getBackend(rpc).sendMessage('hello peers')
      expect(mocks.request).toHaveBeenCalledWith(API_SEND_MESSAGE)
      expect(mocks.send).toHaveBeenCalledWith('hello peers')
    })

    it('is fire-and-forget — does not throw when reply rejects', async () => {
      const send = jest.fn()
      const reply = jest.fn().mockRejectedValue(new Error('network error'))
      const request = jest.fn().mockReturnValue({ send, reply })
      expect(() => getBackend({ request }).sendMessage('msg')).not.toThrow()
      // Give the rejected promise a chance to settle without uncaught error
      await new Promise((r) => setTimeout(r, 10))
    })
  })
})
