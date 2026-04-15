/**
 * Material Design 3 elevation tokens.
 * Android uses `elevation`, iOS uses shadow* props.
 */

import type {ViewStyle} from 'react-native';

type Shadow = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export const shadows: Record<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl', Shadow> = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.17,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 28,
  xxl: 32,
  pill: 9999,
  circle: 9999,
} as const;

export type BorderRadius = typeof borderRadius;
export type BorderRadiusKey = keyof BorderRadius;
export type ShadowKey = keyof typeof shadows;
