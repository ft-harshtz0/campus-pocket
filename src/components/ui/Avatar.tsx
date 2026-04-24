import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';

interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({ name, uri, size = 44, style }: AvatarProps) {
  const theme = useTheme();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const fontSize = size * 0.38;

  return (
    <LinearGradient
      colors={theme.gradient.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <Text style={[{ fontSize, color: '#FFFFFF', fontFamily: 'Inter_700Bold' }]}>
        {initials}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
