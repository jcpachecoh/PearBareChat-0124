import test from 'brittle'
import {
  API_REVERSE,
  API_CREATE_ROOM,
  API_JOIN_ROOM,
  API_SEND_MESSAGE,
  API_RECEIVE_MESSAGE,
  API_UPDATE_CONNECTIONS,
  createMessage,
} from '../api.js'

// ─── Constants ────────────────────────────────────────────────────────────────

test('API_REVERSE equals "reverse"', (t) => {
  t.is(API_REVERSE, 'reverse')
})

test('API_CREATE_ROOM equals "create_room"', (t) => {
  t.is(API_CREATE_ROOM, 'create_room')
})

test('API_JOIN_ROOM equals "join_room"', (t) => {
  t.is(API_JOIN_ROOM, 'join_room')
})

test('API_SEND_MESSAGE equals "send_message"', (t) => {
  t.is(API_SEND_MESSAGE, 'send_message')
})

test('API_RECEIVE_MESSAGE equals "receive_message"', (t) => {
  t.is(API_RECEIVE_MESSAGE, 'receive_message')
})

test('API_UPDATE_CONNECTIONS equals "update_connections"', (t) => {
  t.is(API_UPDATE_CONNECTIONS, 'update_connections')
})

test('all API constants are unique strings', (t) => {
  const constants = [
    API_REVERSE,
    API_CREATE_ROOM,
    API_JOIN_ROOM,
    API_SEND_MESSAGE,
    API_RECEIVE_MESSAGE,
    API_UPDATE_CONNECTIONS,
  ]
  const unique = new Set(constants)
  t.is(unique.size, constants.length, 'every constant has a distinct value')
  for (const c of constants) t.is(typeof c, 'string')
})

// ─── createMessage ────────────────────────────────────────────────────────────

test('createMessage returns an object with all required fields', (t) => {
  const result = createMessage('hello')
  t.ok(result, 'result is truthy')
  t.ok('timestamp' in result, 'has timestamp')
  t.ok('message' in result, 'has message')
  t.ok('local' in result, 'has local')
  t.ok('type' in result, 'has type')
})

test('createMessage sets message to the provided text', (t) => {
  t.is(createMessage('hello').message, 'hello')
  t.is(createMessage('').message, '')
  t.is(createMessage('  spaces  ').message, '  spaces  ')
})

test('createMessage defaults local to false', (t) => {
  t.is(createMessage('hi').local, false)
})

test('createMessage sets local to true when passed true', (t) => {
  t.is(createMessage('hi', true).local, true)
})

test('createMessage sets local to false when explicitly passed false', (t) => {
  t.is(createMessage('hi', false).local, false)
})

test('createMessage type is always "text"', (t) => {
  t.is(createMessage('hi').type, 'text')
  t.is(createMessage('hi', true).type, 'text')
})

test('createMessage timestamp is a Date instance', (t) => {
  const before = Date.now()
  const result = createMessage('time check')
  const after = Date.now()
  t.ok(result.timestamp instanceof Date, 'timestamp is a Date')
  t.ok(result.timestamp.getTime() >= before, 'timestamp is not in the past')
  t.ok(result.timestamp.getTime() <= after, 'timestamp is not in the future')
})

test('createMessage produces a fresh Date on each call', (t) => {
  // Two consecutive calls must create independent Date objects
  const a = createMessage('first')
  const b = createMessage('second')
  t.ok(a.timestamp !== b.timestamp, 'distinct Date instances')
})

test('createMessage with numeric message coerces correctly', (t) => {
  // msg parameter has no type guard; ensure it stores whatever is passed
  const result = createMessage(42)
  t.is(result.message, 42)
})
