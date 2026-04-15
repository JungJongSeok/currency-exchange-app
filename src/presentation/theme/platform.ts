import {Platform} from 'react-native';

/**
 * Platform tokens — Material Design 3 values with iOS adaptive fallbacks.
 */
export const platformTokens = {
  buttonHeight: Platform.select({ios: 52, android: 48}) ?? 48,
  minTouchTarget: Platform.select({ios: 44, android: 48}) ?? 48,
  defaultRadius: Platform.select({ios: 16, android: 12}) ?? 12,
  largeRadius: Platform.select({ios: 28, android: 20}) ?? 20,
  headerTitleStyle:
    Platform.select<'large' | 'default'>({ios: 'default', android: 'default'}) ??
    'default',
  gestureEnabled: Platform.select({ios: true, android: false}) ?? false,
  pressEffect:
    Platform.select<'opacity' | 'ripple'>({ios: 'opacity', android: 'ripple'}) ??
    'ripple',
} as const;

export type PlatformTokens = typeof platformTokens;
