/**
 * UniDate — Typography Tokens
 * Poppins for headings, Inter for body
 */
import { TextStyle, Platform } from 'react-native';

const webHeading = 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const webBody = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const fontFamilies = {
  headingRegular: Platform.select({ web: webHeading, default: 'Poppins_400Regular' }),
  headingMedium: Platform.select({ web: webHeading, default: 'Poppins_500Medium' }),
  headingSemiBold: Platform.select({ web: webHeading, default: 'Poppins_600SemiBold' }),
  headingBold: Platform.select({ web: webHeading, default: 'Poppins_700Bold' }),
  bodyRegular: Platform.select({ web: webBody, default: 'Inter_400Regular' }),
  bodyMedium: Platform.select({ web: webBody, default: 'Inter_500Medium' }),
  bodySemiBold: Platform.select({ web: webBody, default: 'Inter_600SemiBold' }),
  bodyBold: Platform.select({ web: webBody, default: 'Inter_700Bold' }),
} as const;

export const typography: Record<string, TextStyle> = {
  h1: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontFamily: fontFamilies.headingSemiBold,
    fontSize: 22,
    lineHeight: 30,
  },
  h3: {
    fontFamily: fontFamilies.headingSemiBold,
    fontSize: 18,
    lineHeight: 26,
  },
  body: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 15,
    lineHeight: 24,
  },
  supporting: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  supportingSmall: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  captionSmall: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 11,
    lineHeight: 16,
  },
  button: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 16,
    lineHeight: 20,
  },
  buttonSmall: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  label: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
};

export type TypographyToken = keyof typeof typography;

