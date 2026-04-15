/**
 * Color tokens for CurrencyExchangeApp (환율 변환기).
 *
 * Design language: Material Design 3
 * Primary: #00695C (deep teal) — finance trust, distinct from tip-calculator
 * #26A69A teal mint.
 */

export const lightColors = {
  // Brand / primary — M3 Deep Teal
  primary: '#00695C',
  primaryLight: '#439889',
  primaryDark: '#003D33',
  primaryContainer: '#B2DFDB',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#00201C',

  // Secondary — amber accent for favorites/highlights
  secondary: '#FFB300',
  secondaryContainer: '#FFE082',
  onSecondaryContainer: '#3E2B00',

  // Surface / background
  background: '#F3FAF8',
  backgroundSecondary: '#E6F2EF',
  backgroundTertiary: '#D3E5E1',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceVariant: '#D5E4E1',
  outlineVariant: '#B9C9C5',

  // Text
  textPrimary: '#101C1A',
  textSecondary: '#3A4947',
  textTertiary: '#6A7876',
  textDisabled: '#B7C1BF',
  textInverse: '#FFFFFF',

  // Borders
  border: '#B9C9C5',
  borderLight: '#D5E4E1',
  divider: '#CBDAD6',

  // Semantic
  success: '#2E7D32',
  warning: '#F57C00',
  error: '#C62828',
  info: '#1976D2',

  statusSuccess: '#2E7D32',
  statusWarning: '#F57C00',
  statusError: '#C62828',

  // States
  overlay: 'rgba(0, 0, 0, 0.4)',
  pressed: 'rgba(0, 0, 0, 0.08)',
  disabled: '#D5E4E1',
} as const;

export type AppColors = {[K in keyof typeof lightColors]: string};

export const darkColors: AppColors = {
  primary: '#4DB6AC',
  primaryLight: '#82E9DE',
  primaryDark: '#00867D',
  primaryContainer: '#00544C',
  onPrimary: '#00201C',
  onPrimaryContainer: '#B2DFDB',

  secondary: '#FFCA28',
  secondaryContainer: '#5E4400',
  onSecondaryContainer: '#FFE082',

  background: '#0C1514',
  backgroundSecondary: '#151F1D',
  backgroundTertiary: '#1F2927',
  surface: '#151F1D',
  surfaceElevated: '#1F2927',
  surfaceVariant: '#283431',
  outlineVariant: '#414B48',

  textPrimary: '#DFE3E0',
  textSecondary: '#BFC7C4',
  textTertiary: '#88908D',
  textDisabled: '#505855',
  textInverse: '#101C1A',

  border: '#414B48',
  borderLight: '#283431',
  divider: '#36403E',

  success: '#81C784',
  warning: '#FFB74D',
  error: '#EF9A9A',
  info: '#64B5F6',

  statusSuccess: '#81C784',
  statusWarning: '#FFB74D',
  statusError: '#EF9A9A',

  overlay: 'rgba(0, 0, 0, 0.6)',
  pressed: 'rgba(255, 255, 255, 0.08)',
  disabled: '#283431',
};

export const colors = lightColors;
