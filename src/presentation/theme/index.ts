/**
 * Theme barrel — single import point for Material Design 3 tokens.
 */

export {colors, lightColors, darkColors} from './colors';
export type {AppColors} from './colors';

export {typography} from './typography';
export type {Typography, TypographyVariant} from './typography';

export {spacing, componentSize} from './spacing';
export type {Spacing, SpacingKey, ComponentSize, ComponentSizeKey} from './spacing';

export {shadows, borderRadius} from './shadows';
export type {BorderRadius, BorderRadiusKey, ShadowKey} from './shadows';

export {platformTokens} from './platform';
export type {PlatformTokens} from './platform';

import {lightColors, darkColors, type AppColors} from './colors';
import {typography} from './typography';
import {spacing, componentSize} from './spacing';
import {shadows, borderRadius} from './shadows';
import {platformTokens} from './platform';

export interface AppTheme {
  readonly isDark: boolean;
  readonly colors: AppColors;
  readonly typography: typeof typography;
  readonly spacing: typeof spacing;
  readonly componentSize: typeof componentSize;
  readonly shadows: typeof shadows;
  readonly borderRadius: typeof borderRadius;
  readonly platformTokens: typeof platformTokens;
}

export const lightTheme: AppTheme = {
  isDark: false,
  colors: lightColors,
  typography,
  spacing,
  componentSize,
  shadows,
  borderRadius,
  platformTokens,
};

export const darkTheme: AppTheme = {
  isDark: true,
  colors: darkColors,
  typography,
  spacing,
  componentSize,
  shadows,
  borderRadius,
  platformTokens,
};
