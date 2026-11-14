/**
 * UniDate — Color Tokens
 * Based on design-system.md
 */
export const colors = {
  primary: '#970D19',
  primaryDeep: '#650914',
  accent: '#EF202B',
  pink: '#FAD4D6',
  purple: '#6B21A8',
  purpleLight: '#F3E8FF',
  purpleAccent: '#7C3AED',
  background: '#FFF3F3',
  surface: '#FFFFFF',
  textPrimary: '#202024',
  textSecondary: '#77777F',
  border: '#E8DCDD',
  success: '#218653',
  warning: '#A96713',
  error: '#B42318',

  // TikTok Verified Blue
  verifiedBlue: '#20D5EC',
  verifiedBlueDeep: '#00A3FF',
  verifiedText: '#0284C7',

  // Extended palette
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',

  // Gradient accents (for decorative corners)
  gradientStart: '#EF202B',
  gradientEnd: '#970D19',

  // Input states
  inputFocus: '#970D19',
  inputError: '#B42318',
  inputSuccess: '#218653',
  inputDisabled: '#F0F0F0',

  // Chat bubbles
  chatBubbleSent: '#970D19',
  chatBubbleReceived: '#FAD4D6',
  chatBubbleSentText: '#FFFFFF',
  chatBubbleReceivedText: '#202024',

  // Skeleton loading
  skeletonBase: '#E8DCDD',
  skeletonHighlight: '#F5F0F0',
} as const;

export type ColorToken = keyof typeof colors;

