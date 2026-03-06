import React, { useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ListRenderItemInfo,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'

import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { addMessage, setRoomTopic, leaveRoom } from '../../store/chatSlice'
import { useBackend } from '../../component/BareProvider'
import { Message } from '../../types'
import { colors, spacing, radius, typography } from '../../theme'

import ChatHeader from './ChatHeader'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

const HomeScreen = () => {
  const dispatch = useAppDispatch()
  const backend = useBackend()

  const messages = useAppSelector((s) => s.chat.messages)
  const roomTopic = useAppSelector((s) => s.chat.roomTopic)
  const peersCount = useAppSelector((s) => s.chat.peersCount)

  const [topicInput, setTopicInput] = React.useState('')
  const listRef = useRef<FlatList<Message>>(null)

  // ── Room actions ──────────────────────────────────────────────────────────

  const handleCreate = useCallback(() => {
    backend?.createRoom((topic) => dispatch(setRoomTopic(topic)))
  }, [backend, dispatch])

  const handleLeave = useCallback(() => {
    dispatch(leaveRoom())
  }, [dispatch])

  const handleJoin = useCallback(() => {
    const cleaned = topicInput.trim().replace(/^Topic:\s*/i, '')
    if (!cleaned) return
    dispatch(setRoomTopic(cleaned))
    backend?.joinRoom(cleaned, (confirmedTopic) => dispatch(setRoomTopic(confirmedTopic)))
  }, [backend, dispatch, topicInput])

  // ── Message sending ───────────────────────────────────────────────────────

  const handleSend = useCallback(
    (text: string) => {
      dispatch(addMessage({ timestamp: Date.now(), message: text, local: true, type: 'text' }))
      backend?.sendMessage(text)
    },
    [backend, dispatch],
  )

  // ── FlatList helpers ──────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Message>) => {
      const prevMsg = messages[messages.length - 1 - (index + 1)]
      const isSameSenderAsPrev =
        prevMsg !== undefined &&
        prevMsg.local === item.local &&
        prevMsg.memberId === item.memberId

      const nextMsg = messages[messages.length - 1 - (index - 1)]
      const isLastInGroup =
        index === 0 ||
        nextMsg === undefined ||
        nextMsg.local !== item.local ||
        nextMsg.memberId !== item.memberId

      return (
        <MessageBubble
          message={item}
          showAvatar={isLastInGroup}
          showSenderName={!isSameSenderAsPrev}
        />
      )
    },
    [messages],
  )

  const keyExtractor = useCallback((item: Message) => item.id, [])

  const reversedMessages = React.useMemo(() => [...messages].reverse(), [messages])

  // ── Lobby ─────────────────────────────────────────────────────────────────

  if (!roomTopic) {
    return (
      <View style={styles.lobbyContainer}>
        <StatusBar style="light" />

        {/* Hero */}
        <View style={styles.lobbyHero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🍐</Text>
          </View>
          <Text style={styles.lobbyTitle}>PearBare Chat</Text>
          <Text style={styles.lobbyTagline}>Peer-to-peer · End-to-end encrypted · No servers</Text>
        </View>

        {/* Actions card */}
        <View style={styles.lobbyCard}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleCreate}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>+ Create Room</Text>
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or join existing</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.joinRow}>
            <TextInput
              style={styles.joinInput}
              placeholder="Paste topic hash"
              placeholderTextColor={colors.placeholder}
              value={topicInput}
              onChangeText={setTopicInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="join"
              onSubmitEditing={handleJoin}
            />
            <TouchableOpacity
              style={[styles.joinBtn, !topicInput.trim() && styles.joinBtnDisabled]}
              onPress={handleJoin}
              disabled={!topicInput.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.lobbyFooter}>Built on Holepunch Pear Runtime</Text>
      </View>
    )
  }

  // ── Chat ──────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="light" />
      <ChatHeader topic={roomTopic} peersCount={peersCount} onBack={handleLeave} />

      <FlatList
        ref={listRef}
        data={reversedMessages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted
        style={styles.list}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={30}
        windowSize={8}
        initialNumToRender={20}
        ListEmptyComponent={<EmptyChat />}
      />

      <MessageInput onSend={handleSend} disabled={!backend} />
    </KeyboardAvoidingView>
  )
}

const EmptyChat = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>💬</Text>
    <Text style={styles.emptyTitle}>No messages yet</Text>
    <Text style={styles.emptySubtitle}>Be the first to say something</Text>
  </View>
)

const styles = StyleSheet.create({
  // ── Lobby ──
  lobbyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  lobbyHero: {
    alignItems: 'center',
    marginBottom: spacing.xl * 1.5,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  logoEmoji: {
    fontSize: 42,
  },
  lobbyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.3,
  },
  lobbyTagline: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  lobbyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
  orText: {
    ...typography.label,
    color: colors.placeholder,
  },
  joinRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  joinInput: {
    flex: 1,
    height: 46,
    backgroundColor: colors.inputBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.md,
    ...typography.label,
    color: colors.text,
  },
  joinBtn: {
    backgroundColor: colors.accentDark,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    justifyContent: 'center',
  },
  joinBtnDisabled: {
    backgroundColor: colors.surfaceElevated,
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  lobbyFooter: {
    ...typography.peers,
    color: colors.placeholder,
    textAlign: 'center',
    marginTop: spacing.xl,
  },

  // ── Chat ──
  chatContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingVertical: spacing.sm,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 4,
    transform: [{ scaleY: -1 }],
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySubtitle: {
    ...typography.label,
    color: colors.placeholder,
    marginTop: spacing.xs,
  },
})

export default HomeScreen
