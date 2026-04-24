import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  color,
  backgroundColor,
  height = 8,
  style,
}: ProgressBarProps) {
  const theme = useTheme();
  const barColor = color || theme.primary;
  const bgColor = backgroundColor || theme.borderLight;

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.container, { backgroundColor: bgColor, height, borderRadius: height / 2 }, style]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: barColor,
            height,
            borderRadius: height / 2,
            width: `${clampedProgress}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
