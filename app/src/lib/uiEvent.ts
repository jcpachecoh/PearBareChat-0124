import { TinyEmitter } from 'tiny-emitter'

// Legacy event bus — kept for non-Redux event bridging needs
export const RECEIVE_MESSAGE_UI = 'receive_message_ui'
export const CONNECTIONS_UI = 'connections_ui'

const uiEvent = new TinyEmitter()
export default uiEvent
