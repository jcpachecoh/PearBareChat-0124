import chatReducer, {
  addMessage,
  setRoomTopic,
  setPeersCount,
  clearMessages,
} from '../store/chatSlice'
import { ChatState } from '../types'

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Run the reducer against an optional current state (defaults to initial). */
function reduce(
  state: ChatState | undefined,
  action: ReturnType<
    | typeof addMessage
    | typeof setRoomTopic
    | typeof setPeersCount
    | typeof clearMessages
  >,
): ChatState {
  return chatReducer(state, action)
}

const makePayload = (overrides: Partial<Omit<import('../types').Message, 'id'>> = {}) => ({
  timestamp: 1_700_000_000_000,
  message: 'hello world',
  local: true,
  type: 'text' as const,
  ...overrides,
})

// ─── initial state ────────────────────────────────────────────────────────────

describe('chatSlice — initial state', () => {
  it('starts with an empty messages array', () => {
    const state = chatReducer(undefined, { type: '@@INIT' })
    expect(state.messages).toEqual([])
  })

  it('starts with a null roomTopic', () => {
    const state = chatReducer(undefined, { type: '@@INIT' })
    expect(state.roomTopic).toBeNull()
  })

  it('starts with peersCount of 0', () => {
    const state = chatReducer(undefined, { type: '@@INIT' })
    expect(state.peersCount).toBe(0)
  })
})

// ─── addMessage ───────────────────────────────────────────────────────────────

describe('addMessage', () => {
  it('appends a message to the empty list', () => {
    const state = reduce(undefined, addMessage(makePayload()))
    expect(state.messages).toHaveLength(1)
  })

  it('preserves all payload fields on the stored message', () => {
    const payload = makePayload({ message: 'test msg', local: false, memberId: 'peer_abc' })
    const state = reduce(undefined, addMessage(payload))
    const msg = state.messages[0]
    expect(msg.message).toBe('test msg')
    expect(msg.local).toBe(false)
    expect(msg.memberId).toBe('peer_abc')
    expect(msg.timestamp).toBe(payload.timestamp)
    expect(msg.type).toBe('text')
  })

  it('auto-assigns a non-empty string id', () => {
    const state = reduce(undefined, addMessage(makePayload()))
    expect(typeof state.messages[0].id).toBe('string')
    expect(state.messages[0].id.length).toBeGreaterThan(0)
  })

  it('generates unique ids for every message', () => {
    let state = reduce(undefined, addMessage(makePayload({ message: 'msg1' })))
    state = reduce(state, addMessage(makePayload({ message: 'msg2' })))
    state = reduce(state, addMessage(makePayload({ message: 'msg3' })))
    const ids = state.messages.map((m) => m.id)
    expect(new Set(ids).size).toBe(3)
  })

  it('appends multiple messages in order', () => {
    let state = reduce(undefined, addMessage(makePayload({ message: 'first' })))
    state = reduce(state, addMessage(makePayload({ message: 'second' })))
    expect(state.messages[0].message).toBe('first')
    expect(state.messages[1].message).toBe('second')
  })

  it('stores a local message with local: true', () => {
    const state = reduce(undefined, addMessage(makePayload({ local: true })))
    expect(state.messages[0].local).toBe(true)
  })

  it('stores a remote message with local: false and memberId', () => {
    const state = reduce(
      undefined,
      addMessage(makePayload({ local: false, memberId: 'remote_peer' })),
    )
    expect(state.messages[0].local).toBe(false)
    expect(state.messages[0].memberId).toBe('remote_peer')
  })

  it('does not mutate existing messages when adding a new one', () => {
    const stateA = reduce(undefined, addMessage(makePayload({ message: 'original' })))
    const originalId = stateA.messages[0].id

    const stateB = reduce(stateA, addMessage(makePayload({ message: 'new' })))
    expect(stateB.messages[0].id).toBe(originalId)
    expect(stateB.messages[0].message).toBe('original')
  })

  it('allows a message without memberId (local send)', () => {
    const state = reduce(undefined, addMessage(makePayload({ memberId: undefined })))
    expect(state.messages[0].memberId).toBeUndefined()
  })
})

// ─── setRoomTopic ─────────────────────────────────────────────────────────────

describe('setRoomTopic', () => {
  it('sets the topic from null', () => {
    const state = reduce(undefined, setRoomTopic('abc123topic'))
    expect(state.roomTopic).toBe('abc123topic')
  })

  it('overwrites an existing topic', () => {
    let state = reduce(undefined, setRoomTopic('topic-one'))
    state = reduce(state, setRoomTopic('topic-two'))
    expect(state.roomTopic).toBe('topic-two')
  })

  it('accepts an empty string', () => {
    const state = reduce(undefined, setRoomTopic(''))
    expect(state.roomTopic).toBe('')
  })

  it('does not affect messages or peersCount', () => {
    let state = reduce(undefined, addMessage(makePayload()))
    state = reduce(state, setPeersCount(5))
    state = reduce(state, setRoomTopic('new-topic'))
    expect(state.messages).toHaveLength(1)
    expect(state.peersCount).toBe(5)
  })
})

// ─── setPeersCount ────────────────────────────────────────────────────────────

describe('setPeersCount', () => {
  it('sets count from 0 to a positive number', () => {
    const state = reduce(undefined, setPeersCount(3))
    expect(state.peersCount).toBe(3)
  })

  it('updates an existing count', () => {
    let state = reduce(undefined, setPeersCount(2))
    state = reduce(state, setPeersCount(7))
    expect(state.peersCount).toBe(7)
  })

  it('accepts 0 (all peers disconnect)', () => {
    let state = reduce(undefined, setPeersCount(4))
    state = reduce(state, setPeersCount(0))
    expect(state.peersCount).toBe(0)
  })

  it('does not affect messages or roomTopic', () => {
    let state = reduce(undefined, addMessage(makePayload()))
    state = reduce(state, setRoomTopic('some-topic'))
    state = reduce(state, setPeersCount(9))
    expect(state.messages).toHaveLength(1)
    expect(state.roomTopic).toBe('some-topic')
  })
})

// ─── clearMessages ────────────────────────────────────────────────────────────

describe('clearMessages', () => {
  it('empties a list that has messages', () => {
    let state = reduce(undefined, addMessage(makePayload()))
    state = reduce(state, addMessage(makePayload({ message: 'second' })))
    state = reduce(state, clearMessages())
    expect(state.messages).toHaveLength(0)
    expect(state.messages).toEqual([])
  })

  it('is a no-op on an already empty list', () => {
    const state = reduce(undefined, clearMessages())
    expect(state.messages).toEqual([])
  })

  it('does not affect roomTopic or peersCount', () => {
    let state = reduce(undefined, setRoomTopic('keep-me'))
    state = reduce(state, setPeersCount(4))
    state = reduce(state, addMessage(makePayload()))
    state = reduce(state, clearMessages())
    expect(state.roomTopic).toBe('keep-me')
    expect(state.peersCount).toBe(4)
  })
})
