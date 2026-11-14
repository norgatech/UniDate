/**
 * UniDate — Theme System
 * Central export for all design tokens
 */
export { colors } from './colors';
export type { ColorToken } from './colors';
export { typography, fontFamilies } from './typography';
export type { TypographyToken } from './typography';
export { spacing, radii, layout, shadows } from './spacing';
export type { SpacingToken, RadiiToken } from './spacing';

// Theme object for convenience
import { colors } from './colors';
import { typography, fontFamilies } from './typography';
import { spacing, radii, layout, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  fontFamilies,
  spacing,
  radii,
  layout,
  shadows,
} as const;

export type Theme = typeof theme;

