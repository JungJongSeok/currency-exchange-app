/**
 * PlatformIcon — thin wrapper that picks a platform-appropriate icon name.
 *
 * Concrete icon component (MaterialIcons / Ionicons / ...) is injected so
 * this file has no hard dependency on a specific icon library.
 */

import React from 'react';
import {
  Platform,
  type ColorValue,
  type StyleProp,
  type TextStyle,
} from 'react-native';

export interface IconComponentProps {
  name: string;
  size?: number;
  color?: number | ColorValue;
  style?: StyleProp<TextStyle>;
}

export type IconComponent = React.ComponentType<IconComponentProps>;

export interface PlatformIconProps {
  readonly name?: string;
  readonly ios?: string;
  readonly android?: string;
  readonly Component: IconComponent;
  readonly size?: number;
  readonly color?: string;
  readonly style?: StyleProp<TextStyle>;
}

const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = '#1C1C1E';

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  name,
  ios,
  android,
  Component,
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  style,
}) => {
  const resolved: string | undefined =
    Platform.select<string | undefined>({
      ios: ios ?? name,
      android: android ?? name,
    }) ?? name;

  if (resolved == null) {
    return null;
  }

  return <Component name={resolved} size={size} color={color} style={style} />;
};
