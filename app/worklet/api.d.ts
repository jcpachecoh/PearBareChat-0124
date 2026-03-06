export declare const API_PING: string
export declare const API_REVERSE: string
export declare const API_CREATE_ROOM: string
export declare const API_JOIN_ROOM: string
export declare const API_SEND_MESSAGE: string
export declare const API_RECEIVE_MESSAGE: string
export declare const API_UPDATE_CONNECTIONS: string

export interface WorkletMessage {
  id: string
  timestamp: number
  message: string
  local: boolean
  type: 'text'
}

export declare function createMessage(msg: string, local?: boolean): WorkletMessage
