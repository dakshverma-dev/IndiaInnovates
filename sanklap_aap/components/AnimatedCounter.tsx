import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, TextStyle } from "react-native";

interface Props {
  value: number;
  duration?: number;
  style?: TextStyle;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({
  value,
  duration = 1200,
  style,
  suffix = "",
  prefix = "",
}: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
    animatedValue.addListener(({ value: v }) => {
      displayValue.current = Math.round(v);
    });
    return () => animatedValue.removeAllListeners();
  }, [value]);

  const AnimatedText = Animated.createAnimatedComponent(Text);

  return (
    <AnimatedText
      style={style}
    >
      {prefix}
      {animatedValue.interpolate({
        inputRange: [0, Math.max(value, 1)],
        outputRange: ["0", String(value)],
      }) as unknown as string}
      {suffix}
    </AnimatedText>
  );
}
