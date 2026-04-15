/**
 * ThrottledPressable — a Pressable that ignores repeat taps within 300ms.
 */

import React, {useCallback, useRef} from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
} from 'react-native';

export interface ThrottledPressableProps extends PressableProps {
  readonly throttleMs?: number;
}

const DEFAULT_THROTTLE_MS = 300;

export const ThrottledPressable: React.FC<ThrottledPressableProps> = ({
  onPress,
  throttleMs = DEFAULT_THROTTLE_MS,
  disabled,
  ...rest
}) => {
  const lastPressRef = useRef<number>(0);

  const handlePress = useCallback(
    (event: GestureResponderEvent): void => {
      if (disabled === true || onPress == null) {
        return;
      }
      const now = Date.now();
      if (now - lastPressRef.current < throttleMs) {
        return;
      }
      lastPressRef.current = now;
      onPress(event);
    },
    [disabled, onPress, throttleMs],
  );

  return <Pressable {...rest} disabled={disabled} onPress={handlePress} />;
};
