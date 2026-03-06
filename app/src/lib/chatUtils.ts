/**
 * Pure helper functions shared across chat components.
 * Kept in a separate module so they can be unit-tested without React or RN.
 */

const AVATAR_PALETTE = [
  '#7B4FDB', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#14B8A6', '#8B5CF6',
]

/** Returns a consistent avatar background color for a given memberId. */
export function avatarColor(memberId: string): string {
  let hash = 0
  for (let i = 0; i < memberId.length; i++) {
    hash = (hash * 31 + memberId.charCodeAt(i)) >>> 0
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

/** Formats a Unix timestamp (ms) as zero-padded HH:MM. */
export function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

/** Returns the first two characters of a memberId, uppercased. */
export function getInitials(memberId: string): string {
  return memberId.slice(0, 2).toUpperCase()
}

/**
 * Truncates a topic hash for display.
 * Topics ≤ 16 chars are shown as-is; longer ones show first 8 + ellipsis + last 8.
 */
export function truncateTopic(topic: string): string {
  if (topic.length <= 16) return topic
  return `${topic.slice(0, 8)}\u2026${topic.slice(-8)}`
}
