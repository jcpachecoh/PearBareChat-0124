import test from 'brittle'
import b4a from 'b4a'
import { getBackend } from '../chat-core.js'

// Obtain one backend reference for all tests.  The underlying Hyperswarm
// instance is created at module-load time; we destroy it in the final
// cleanup test so the process can exit cleanly.
const backend = getBackend()

// ─── getBackend shape ─────────────────────────────────────────────────────────

test('getBackend returns a non-null object', (t) => {
  t.ok(backend)
  t.is(typeof backend, 'object')
})

test('getBackend.version is "0.0.1"', (t) => {
  t.is(backend.version, '0.0.1')
})

test('getBackend exposes all expected function members', (t) => {
  t.is(typeof backend.getMemberId, 'function', 'getMemberId is a function')
  t.is(typeof backend.createRoom, 'function', 'createRoom is a function')
  t.is(typeof backend.joinRoom, 'function', 'joinRoom is a function')
  t.is(typeof backend.sendMessage, 'function', 'sendMessage is a function')
})

test('getBackend.swarm is a Hyperswarm instance', (t) => {
  t.ok(backend.swarm, 'swarm is truthy')
  // Hyperswarm exposes a connections Set/iterator
  t.ok(typeof backend.swarm.join === 'function', 'swarm.join exists')
  t.ok(typeof backend.swarm.destroy === 'function', 'swarm.destroy exists')
})

test('each getBackend() call returns a new object wrapping the same swarm', (t) => {
  const a = getBackend()
  const b = getBackend()
  // The returned plain objects are different references …
  t.ok(a !== b, 'different wrapper objects')
  // … but both share the single module-level swarm
  t.ok(a.swarm === b.swarm, 'same underlying swarm instance')
})

// ─── getMemberId ──────────────────────────────────────────────────────────────

test('getMemberId returns "invalid" for null', (t) => {
  t.is(backend.getMemberId(null), 'invalid')
})

test('getMemberId returns "invalid" for undefined', (t) => {
  t.is(backend.getMemberId(undefined), 'invalid')
})

test('getMemberId returns "invalid" for falsy peer (0)', (t) => {
  t.is(backend.getMemberId(0), 'invalid')
})

test('getMemberId returns "invalid" for falsy peer (false)', (t) => {
  t.is(backend.getMemberId(false), 'invalid')
})

test('getMemberId returns a 6-character lowercase hex string for a valid peer', (t) => {
  // Build a fake peer with a deterministic 32-byte key (all 0xab bytes).
  // b4a.toString(Buffer.alloc(32, 0xab), 'hex') → 'abab…ab' (64 chars)
  // .substring(0, 6) → 'ababab'
  const key = Buffer.alloc(32, 0xab)
  const fakePeer = { remotePublicKey: key }

  const id = backend.getMemberId(fakePeer)
  t.is(id, 'ababab', 'first 6 hex chars of the key')
})

test('getMemberId returns exactly 6 characters', (t) => {
  const key = Buffer.alloc(32, 0xff)
  const id = backend.getMemberId({ remotePublicKey: key })
  t.is(id.length, 6)
})

test('getMemberId result only contains hex characters', (t) => {
  const key = b4a.from('deadbeefcafe0102030405060708090a0b0c0d0e0f101112131415161718191a', 'hex')
  const id = backend.getMemberId({ remotePublicKey: key })
  t.ok(/^[0-9a-f]+$/i.test(id), `"${id}" is valid hex`)
})

test('getMemberId reflects the first 3 bytes of the public key', (t) => {
  // Key starting with bytes 0x12, 0x34, 0x56 → hex prefix '123456'
  const key = Buffer.alloc(32, 0x00)
  key[0] = 0x12
  key[1] = 0x34
  key[2] = 0x56
  t.is(backend.getMemberId({ remotePublicKey: key }), '123456')
})

// ─── joinRoom (catch-branch only — no live network required) ──────────────────

test('joinRoom returns { done: false, topic: "err" } for null topic', async (t) => {
  // b4a.from(null, 'hex') throws a TypeError, hitting the catch branch
  const result = await backend.joinRoom(null)
  t.alike(result, { done: false, topic: 'err' })
})

test('joinRoom returns { done: false, topic: "err" } for undefined topic', async (t) => {
  // b4a.from(undefined, 'hex') also throws
  const result = await backend.joinRoom(undefined)
  t.alike(result, { done: false, topic: 'err' })
})

test('joinRoom result has boolean done and string topic fields on error', async (t) => {
  const result = await backend.joinRoom(null)
  t.is(typeof result.done, 'boolean')
  t.is(typeof result.topic, 'string')
})

// ─── Cleanup ──────────────────────────────────────────────────────────────────

// Must be the last test — destroys the module-level Hyperswarm so the
// process exits instead of waiting for DHT socket timeouts.
test('teardown: destroy swarm', async (t) => {
  await backend.swarm.destroy()
  t.pass('swarm destroyed successfully')
})
