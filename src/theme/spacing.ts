/**
 * UniDate — Spacing & Layout Tokens
 * 4px base unit
 */
export const spacing = {
  xs: 4,    // space.1
  sm: 8,    // space.2
  md: 12,   // space.3
  lg: 16,   // space.4
  xl: 20,   // space.5
  '2xl': 24, // space.6
  '3xl': 32, // space.8
  '4xl': 40, // space.10
  '5xl': 48,
  '6xl': 64,
} as const;

export const radii = {
  sm: 8,    // Small control
  md: 12,   // Input
  lg: 14,   // Button
  xl: 16,   // Card
  '2xl': 24, // Large sheet/modal
  full: 9999, // Pill/circle
} as const;

export const layout = {
  screenPaddingHorizontal: 20,
  sectionGap: 24,
  mobileWidth: 390,
  buttonMinHeight: 52,
  inputMinHeight: 48,
  touchTarget: 44,
  bottomNavHeight: 80,
  tabBarIconSize: 24,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiiToken = keyof typeof radii;

