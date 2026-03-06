// Keet-inspired dark theme
export const colors = {
  // Core
  background: '#0B0B14',
  surface: '#141421',
  surfaceElevated: '#1C1C2C',
  surfaceHighlight: '#242436',

  // Accent — purple (Keet signature)
  accent: '#7B4FDB',
  accentLight: '#9670E8',
  accentDark: '#5B30B0',

  // Bubbles
  bubbleSent: '#5B30B0',
  bubbleSentText: '#FFFFFF',
  bubbleReceived: '#252540',      // lifted so it contrasts against #0B0B14 bg
  bubbleReceivedText: '#E8E8F2',
  bubbleReceivedBorder: '#2E2E52', // subtle border for extra definition

  // Header
  header: '#0F0F1C',
  headerBorder: '#1C1C2C',
  headerText: '#FFFFFF',

  // Input
  inputBar: '#0F0F1C',
  inputBg: '#1C1C2C',
  inputBorder: '#2A2A3E',

  // Text
  text: '#FFFFFF',
  textSecondary: '#9090B0',
  placeholder: '#4A4A65',
  timestamp: '#5A5A78',

  // Status
  online: '#22C55E',
  danger: '#E53935',

  // Misc
  separator: '#1C1C2C',
  avatarColors: [
    '#7B4FDB', // purple
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#EC4899', // pink
    '#14B8A6', // teal
    '#8B5CF6', // violet
  ],
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
}

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 24,
  full: 9999,
}

export const typography = {
  message: { fontSize: 15, lineHeight: 22 },
  memberId: { fontSize: 12, fontWeight: '600' as const },
  timestamp: { fontSize: 11 },
  topic: { fontSize: 15, fontWeight: '600' as const },
  peers: { fontSize: 12 },
  label: { fontSize: 14 },
  title: { fontSize: 18, fontWeight: '700' as const },
  avatarInitial: { fontSize: 13, fontWeight: '700' as const },
}
