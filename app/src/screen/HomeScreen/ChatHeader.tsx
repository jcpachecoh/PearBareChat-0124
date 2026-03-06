import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { colors, spacing, typography, radius } from '../../theme'
import { truncateTopic } from '../../lib/chatUtils'

interface ChatHeaderProps {
  topic: string
  peersCount: number
  onBack: () => void
}

const ChatHeader = ({ topic, peersCount, onBack }: ChatHeaderProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(topic)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }, [topic])

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        {/* Room identity */}
        <View style={styles.roomIcon}>
          <Text style={styles.roomIconText}>#</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {truncateTopic(topic)}
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, peersCount > 0 && styles.dotOnline]} />
            <Text style={styles.statusText}>
              {peersCount > 0
                ? `${peersCount} peer${peersCount === 1 ? '' : 's'} online`
                : 'waiting for peers…'}
            </Text>
          </View>
        </View>

        {/* Copy topic */}
        <TouchableOpacity
          style={[styles.iconBtn, copied && styles.iconBtnActive]}
          onPress={handleCopy}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.iconBtnText}>{copied ? '✓' : '⎘'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.header,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.headerBorder,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roomIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
  },
  info: {
    flex: 1,
  },
  title: {
    ...typography.topic,
    color: colors.headerText,
    letterSpacing: 0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.timestamp,
  },
  dotOnline: {
    backgroundColor: colors.online,
  },
  statusText: {
    ...typography.peers,
    color: colors.textSecondary,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnActive: {
    backgroundColor: colors.accentDark,
  },
  iconBtnText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  backIcon: {
    fontSize: 26,
    lineHeight: 30,
    color: colors.text,
  },
})

export default React.memo(ChatHeader)
