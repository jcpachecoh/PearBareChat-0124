import React, { useState, useCallback } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
} from 'react-native'
import { colors, spacing, radius, typography } from '../../theme'

interface MessageInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

const MessageInput = ({ onSend, disabled = false }: MessageInputProps) => {
  const [text, setText] = useState('')

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }, [text, onSend])

  const canSend = text.trim().length > 0 && !disabled

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={disabled ? 'Connecting…' : 'Message'}
          placeholderTextColor={colors.placeholder}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
          maxLength={2000}
          blurOnSubmit={false}
          editable={!disabled}
        />
      </View>

      <TouchableOpacity
        style={[styles.sendBtn, canSend && styles.sendBtnActive]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.75}
      >
        {/* Arrow-up send icon */}
        <Text style={[styles.sendIcon, canSend && styles.sendIconActive]}>↑</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl + spacing.xs : spacing.sm,
    backgroundColor: colors.inputBar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    minHeight: 42,
    maxHeight: 130,
    justifyContent: 'center',
  },
  input: {
    ...typography.message,
    color: colors.text,
    padding: 0,
    margin: 0,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnActive: {
    backgroundColor: colors.accent,
  },
  sendIcon: {
    fontSize: 20,
    color: colors.placeholder,
    lineHeight: 22,
    textAlign: 'center',
  },
  sendIconActive: {
    color: '#FFFFFF',
  },
})

export default React.memo(MessageInput)
