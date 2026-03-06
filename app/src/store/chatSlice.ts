import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChatState, Message } from '../types'

const initialState: ChatState = {
  messages: [],
  roomTopic: null,
  peersCount: 0,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<Omit<Message, 'id'>>) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      state.messages.push({ ...action.payload, id })
    },
    setRoomTopic(state, action: PayloadAction<string>) {
      state.roomTopic = action.payload
    },
    setPeersCount(state, action: PayloadAction<number>) {
      state.peersCount = action.payload
    },
    clearMessages(state) {
      state.messages = []
    },
    leaveRoom(state) {
      state.roomTopic = null
      state.messages = []
      state.peersCount = 0
    },
  },
})

export const { addMessage, setRoomTopic, setPeersCount, clearMessages, leaveRoom } = chatSlice.actions
export default chatSlice.reducer
