// CJS stub of worklet/api.mjs — used by Jest (ESM not supported in the node test env)
module.exports = {
  API_PING: 'ping',
  API_REVERSE: 'reverse',
  API_CREATE_ROOM: 'create_room',
  API_JOIN_ROOM: 'join_room',
  API_SEND_MESSAGE: 'send_message',
  API_RECEIVE_MESSAGE: 'receive_message',
  API_UPDATE_CONNECTIONS: 'update_connections',
  createMessage: (msg, local = false) => ({
    timestamp: Date.now(),
    message: msg,
    local,
    type: 'text',
  }),
}
