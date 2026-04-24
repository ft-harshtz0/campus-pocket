import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, style, onPress, variant = 'default' }: CardProps) {
  const theme = useTheme();

  const variantStyles: ViewStyle = {
    default: {
      backgroundColor: theme.card,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 3,
    },
    elevated: {
      backgroundColor: theme.surfaceElevated,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 6,
    },
    outlined: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
  }[variant] as ViewStyle;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          variantStyles,
          { opacity: pressed ? 0.95 : 1 },
          style
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, variantStyles, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
});
