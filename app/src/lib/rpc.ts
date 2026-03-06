import b4a from 'b4a'

import { store } from '../store'
import { addMessage, setPeersCount } from '../store/chatSlice'
import {
  API_PING,
  API_REVERSE,
  API_CREATE_ROOM,
  API_JOIN_ROOM,
  API_SEND_MESSAGE,
  API_RECEIVE_MESSAGE,
  API_UPDATE_CONNECTIONS,
} from '../../worklet/api'

export interface RpcRequest {
  command: string
  data: Uint8Array
}

interface RpcInstance {
  request: (command: string) => RpcRequestBuilder
}

interface RpcRequestBuilder {
  send: (data: string) => void
  reply: (encoding: string) => Promise<string>
}

/** Handles inbound RPC calls pushed from the worklet to the UI thread. */
export const rpcHandler = async (req: RpcRequest): Promise<void> => {
  console.log('from worklet:', req.command)

  switch (req.command) {
    case API_RECEIVE_MESSAGE: {
      try {
        if (!req.data) {
          console.warn('[rpc] RECEIVE_MESSAGE: req.data is empty')
          break
        }
        const raw = b4a.toString(req.data, 'utf8')
        const data = JSON.parse(raw) as { event: string; memberId?: string }
        const workletMsg = JSON.parse(data.event) as {
          message: string
          timestamp: number
          type: 'text'
        }
        console.log('got message:', workletMsg)
        store.dispatch(
          addMessage({
            timestamp: Date.now(),
            message: workletMsg.message,
            local: false,
            memberId: data.memberId,
            type: 'text',
          }),
        )
      } catch (err) {
        console.error('[rpc] Failed to parse RECEIVE_MESSAGE:', err)
      }
      break
    }
    case API_UPDATE_CONNECTIONS: {
      try {
        const count = parseInt(b4a.toString(req.data, 'utf8'), 10)
        console.log('current peer cnt:', count)
        store.dispatch(setPeersCount(isNaN(count) ? 0 : count))
      } catch (err) {
        console.error('[rpc] Failed to parse UPDATE_CONNECTIONS:', err)
      }
      break
    }
    default:
      break
  }
}

export type Backend = ReturnType<typeof getBackend>

/** Factory returning typed wrappers around worklet RPC calls. */
export const getBackend = (rpc: RpcInstance) => ({
  ping: (callback: (res: string) => void): void => {
    const req = rpc.request(API_PING)
    req.send('Hello from RN UI!')
    req.reply('utf8').then(callback)
  },

  reverse: (callback: (res: string) => void): void => {
    const req = rpc.request(API_REVERSE)
    req.send('Reverse RN UI!')
    req.reply('utf8').then(callback)
  },

  createRoom: (callback: (topic: string) => void): void => {
    const req = rpc.request(API_CREATE_ROOM)
    req.send('Create Room!')
    req.reply('utf8').then((res) => {
      const { done, topic } = JSON.parse(res) as { done: boolean; topic: string }
      console.log(done ? `[info] Created new chat room: ${topic}` : '[info] Create fail')
      if (done) callback(topic)
    })
  },

  joinRoom: (topic: string, callback: (topic: string) => void): void => {
    const req = rpc.request(API_JOIN_ROOM)
    req.send(topic)
    req.reply('utf8').then((res) => {
      const { done, topic: confirmedTopic } = JSON.parse(res) as {
        done: boolean
        topic: string
      }
      console.log(done ? '[info] Joined chat room' : '[info] Joined fail')
      if (done) callback(confirmedTopic)
    })
  },

  sendMessage: (message: string): void => {
    const req = rpc.request(API_SEND_MESSAGE)
    req.send(message)
    req.reply('utf8').catch(() => {/* fire-and-forget */})
  },
})
