import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Message } from '../../types'
import { colors, spacing, radius, typography } from '../../theme'
import { formatTime, getInitials, avatarColor } from '../../lib/chatUtils'

interface MessageBubbleProps {
  message: Message
  showAvatar: boolean
  showSenderName: boolean
}

const AVATAR_SIZE = 30

const MessageBubble = ({ message, showAvatar, showSenderName }: MessageBubbleProps) => {
  const isLocal = message.local
  const id = message.memberId ?? '??'
  const bgColor = avatarColor(id)

  return (
    <View style={[styles.row, isLocal ? styles.rowRight : styles.rowLeft]}>
      {/* Remote peer avatar */}
      {!isLocal && (
        <View style={styles.avatarSlot}>
          {showAvatar ? (
            <View style={[styles.avatar, { backgroundColor: bgColor }]}>
              <Text style={styles.avatarText}>{getInitials(id)}</Text>
            </View>
          ) : (
            <View style={styles.avatarSpacer} />
          )}
        </View>
      )}

      <View style={[styles.bubble, isLocal ? styles.bubbleSent : styles.bubbleReceived]}>
        {/* Sender label for group chats */}
        {!isLocal && showSenderName && (
          <Text style={[styles.senderName, { color: bgColor }]} numberOfLines={1}>
            {id.slice(0, 16)}
          </Text>
        )}

        <Text style={[styles.messageText, isLocal ? styles.textSent : styles.textReceived]}>
          {message.message}
        </Text>

        <Text style={[styles.timestamp, isLocal ? styles.timestampSent : styles.timestampReceived]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: spacing.md,
  },
  rowLeft: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  avatarSlot: {
    width: AVATAR_SIZE + spacing.xs,
    marginRight: spacing.xs,
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.avatarInitial,
    color: '#FFFFFF',
  },
  avatarSpacer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderRadius: radius.lg,
  },
  bubbleSent: {
    backgroundColor: colors.bubbleSent,
    borderBottomRightRadius: radius.sm,
  },
  bubbleReceived: {
    backgroundColor: colors.bubbleReceived,
    borderBottomLeftRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.bubbleReceivedBorder,
  },
  senderName: {
    ...typography.memberId,
    marginBottom: spacing.xs,
  },
  messageText: {
    ...typography.message,
  },
  textSent: {
    color: colors.bubbleSentText,
  },
  textReceived: {
    color: colors.bubbleReceivedText,
  },
  timestamp: {
    ...typography.timestamp,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  timestampSent: {
    color: 'rgba(255,255,255,0.5)',
  },
  timestampReceived: {
    color: colors.timestamp,
  },
})

export default memo(MessageBubble)
