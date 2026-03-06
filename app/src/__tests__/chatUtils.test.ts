import { formatTime, getInitials, truncateTopic } from '../lib/chatUtils'

// ─── formatTime ───────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('formats midnight as 00:00', () => {
    // Use a fixed date at midnight UTC; derive a local midnight by going through Date
    const midnight = new Date('2024-01-15T00:00:00')
    expect(formatTime(midnight.getTime())).toBe('00:00')
  })

  it('zero-pads single-digit hours', () => {
    const t = new Date('2024-01-15T09:30:00')
    const result = formatTime(t.getTime())
    expect(result.startsWith('09:')).toBe(true)
  })

  it('zero-pads single-digit minutes', () => {
    const t = new Date('2024-01-15T14:05:00')
    const result = formatTime(t.getTime())
    expect(result.endsWith(':05')).toBe(true)
  })

  it('outputs exactly HH:MM format (5 characters)', () => {
    const result = formatTime(Date.now())
    expect(result).toMatch(/^\d{2}:\d{2}$/)
  })

  it('formats noon correctly', () => {
    const t = new Date('2024-06-15T12:00:00')
    expect(formatTime(t.getTime())).toBe('12:00')
  })

  it('formats 23:59 correctly', () => {
    const t = new Date('2024-01-15T23:59:00')
    expect(formatTime(t.getTime())).toBe('23:59')
  })
})

// ─── getInitials ──────────────────────────────────────────────────────────────

describe('getInitials', () => {
  it('returns the first 2 characters uppercased', () => {
    expect(getInitials('alice')).toBe('AL')
  })

  it('already-uppercase input stays uppercase', () => {
    expect(getInitials('PEER')).toBe('PE')
  })

  it('handles a hex peer id (first 2 hex digits)', () => {
    expect(getInitials('a3f82c...')).toBe('A3')
  })

  it('handles a string of exactly 2 characters', () => {
    expect(getInitials('ab')).toBe('AB')
  })

  it('handles a single-character string without throwing', () => {
    expect(getInitials('x')).toBe('X')
  })

  it('returns an empty string for an empty input', () => {
    expect(getInitials('')).toBe('')
  })

  it('handles special characters (emoji, unicode) without throwing', () => {
    expect(() => getInitials('🐦peer')).not.toThrow()
  })
})

// ─── truncateTopic ────────────────────────────────────────────────────────────

describe('truncateTopic', () => {
  it('returns the topic unchanged when it is exactly 16 characters', () => {
    const topic = 'a'.repeat(16) // 16 chars
    expect(truncateTopic(topic)).toBe(topic)
  })

  it('returns the topic unchanged when it is shorter than 16 characters', () => {
    expect(truncateTopic('short')).toBe('short')
  })

  it('returns an empty string unchanged', () => {
    expect(truncateTopic('')).toBe('')
  })

  it('truncates a topic longer than 16 characters', () => {
    const topic = 'abcdefgh12345678XYZ' // 19 chars
    const result = truncateTopic(topic)
    expect(result.length).toBeLessThan(topic.length)
  })

  it('keeps the first 8 characters of a long topic', () => {
    const topic = '12345678' + 'MIDDLE_MIDDLE' + 'ABCDEFGH'
    const result = truncateTopic(topic)
    expect(result.startsWith('12345678')).toBe(true)
  })

  it('keeps the last 8 characters of a long topic', () => {
    const topic = '12345678' + 'MIDDLE_MIDDLE' + 'ABCDEFGH'
    const result = truncateTopic(topic)
    expect(result.endsWith('ABCDEFGH')).toBe(true)
  })

  it('includes an ellipsis between the two retained segments', () => {
    const topic = '12345678' + 'MIDDLE_MIDDLE' + 'ABCDEFGH'
    const result = truncateTopic(topic)
    // ellipsis character U+2026
    expect(result).toContain('\u2026')
  })

  it('produces the exact expected truncation', () => {
    const topic = 'abcdefgh12345678ZYXWVUTS' // 24 chars
    expect(truncateTopic(topic)).toBe('abcdefgh\u2026ZYXWVUTS')
  })

  it('a 17-char topic (just over threshold) is truncated', () => {
    const topic = 'a'.repeat(17)
    const result = truncateTopic(topic)
    expect(result).toContain('\u2026')
  })
})
