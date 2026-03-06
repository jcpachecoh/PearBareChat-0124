export interface Message {
  id: string
  timestamp: number
  message: string
  local: boolean
  memberId?: string
  type: 'text'
}

export interface ChatState {
  messages: Message[]
  roomTopic: string | null
  peersCount: number
}
