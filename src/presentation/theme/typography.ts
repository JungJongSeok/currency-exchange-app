/**
 * Typography tokens for TipCalculatorApp.
 *
 * Material Design 3 type scale. System fonts are used throughout so nothing
 * needs to be bundled. `tipDisplay` is the large 48pt token used for the
 * per-person total in the result card.
 *
 * Per CLAUDE.md, `headerTitle` is the ONLY token allowed in React Navigation
 * `headerTitleStyle` — raw fontSize is forbidden.
 */

import {Platform, type TextStyle} from 'react-native';

const systemFont =
  Platform.select<string>({
    ios: 'System',
    android: 'sans-serif',
  }) ?? 'System';

export const typography = {
  // Display
  displayLarge: {
    fontFamily: systemFont,
    fontWeight: '700',
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
  } as TextStyle,
  displayMedium: {
    fontFamily: systemFont,
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 41,
  } as TextStyle,

  // Headline
  headlineLarge: {
    fontFamily: systemFont,
    fontWeight: '600',
    fontSize: 28,
    lineHeight: 34,
  } as TextStyle,
  headlineMedium: {
    fontFamily: systemFont,
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 28,
  } as TextStyle,
  headlineSmall: {
    fontFamily: systemFont,
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 25,
  } as TextStyle,

  // Title
  titleLarge: {
    fontFamily: systemFont,
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 22,
  } as TextStyle,
  titleMedium: {
    fontFamily: systemFont,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 21,
  } as TextStyle,
  titleSmall: {
    fontFamily: systemFont,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,

  // Body
  bodyLarge: {
    fontFamily: systemFont,
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 22,
  } as TextStyle,
  bodyMedium: {
    fontFamily: systemFont,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 20,
  } as TextStyle,
  bodySmall: {
    fontFamily: systemFont,
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,

  // Label
  labelLarge: {
    fontFamily: systemFont,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
  labelMedium: {
    fontFamily: systemFont,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,
  labelSmall: {
    fontFamily: systemFont,
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 13,
  } as TextStyle,

  // Tip-specific — giant per-person total
  tipDisplay: {
    fontFamily: systemFont,
    fontWeight: '700',
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -1,
  } as TextStyle,

  // Platform-aware header title
  headerTitle: (Platform.select<TextStyle>({
    ios: {
      fontFamily: systemFont,
      fontWeight: '600',
      fontSize: 17,
      lineHeight: 22,
    },
    android: {
      fontFamily: systemFont,
      fontWeight: '500',
      fontSize: 20,
      lineHeight: 26,
    },
  }) ?? {
    fontFamily: systemFont,
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 22,
  }) as TextStyle,
} as const;

export type Typography = typeof typography;
export type TypographyVariant = keyof Typography;
