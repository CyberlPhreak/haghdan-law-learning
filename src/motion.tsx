import { AccessibilityInfo, Animated, Easing, Platform, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export const motion = { quick: 180, standard: 280, relaxed: 360, stagger: 45 } as const;
const useNativeDriver = Platform.OS !== 'web';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (mounted) setReduced(value); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { mounted = false; subscription.remove(); };
  }, []);
  return reduced;
}

type MotionViewProps = Omit<ViewProps, 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  distance?: number;
  duration?: number;
  replayKey?: string | number | boolean | null;
};

export function MotionView({ children, style, delay = 0, distance = 12, duration = motion.standard, replayKey, ...viewProps }: MotionViewProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    opacity.stopAnimation();
    translateY.stopAnimation();
    if (reducedMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    opacity.setValue(0);
    translateY.setValue(distance);
    const entrance = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver }),
        Animated.timing(translateY, { toValue: 0, duration, easing: Easing.out(Easing.cubic), useNativeDriver }),
      ]),
    ]);
    entrance.start();
    return () => entrance.stop();
  }, [delay, distance, duration, opacity, reducedMotion, replayKey, translateY]);

  return <Animated.View {...viewProps} style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}
