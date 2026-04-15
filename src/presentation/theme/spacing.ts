/**
 * Spacing tokens — 4px grid.
 *
 * Material Design 3 recommends 4dp / 8dp increments.
 */

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
  giant: 80,
} as const;

export type Spacing = typeof spacing;
export type SpacingKey = keyof Spacing;

export const componentSize = {
  buttonHeightSmall: 36,
  buttonHeightMedium: 44,
  buttonHeightLarge: 52,
  iconButtonSize: 44,
  inputHeight: 56,

  iconXs: 12,
  iconSm: 16,
  iconMd: 20,
  iconBase: 24,
  iconLg: 32,
  iconXl: 40,

  headerHeight: 56,

  // Tip calculator specific
  chipHeight: 36,
  stepperButtonSize: 44,
  historyRowHeight: 72,
  sliderHeight: 40,
} as const;

export type ComponentSize = typeof componentSize;
export type ComponentSizeKey = keyof ComponentSize;
