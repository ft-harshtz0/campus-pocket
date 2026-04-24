import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const theme = useTheme();

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
    medium: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
    large: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: 16 },
  };

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          { opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1 },
          style
        ]}
      >
        <LinearGradient
          colors={theme.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, sizeStyles[size]]}
        >
          {loading ? (
            <ActivityIndicator color={theme.textInverse} />
          ) : (
            <>
              {icon}
              <Text style={[Typography.button, { color: theme.textInverse }, icon ? { marginLeft: 8 } : undefined]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  const variantStyles = {
    secondary: {
      backgroundColor: theme.isDark ? '#312E81' : '#EEF2FF',
      textColor: theme.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.primary,
      textColor: theme.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: theme.primary,
    },
  };

  const vs = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        sizeStyles[size],
        {
          backgroundColor: vs.backgroundColor,
          borderWidth: (vs as any).borderWidth,
          borderColor: (vs as any).borderColor,
          opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vs.textColor} />
      ) : (
        <>
          {icon}
          <Text style={[Typography.button, { color: vs.textColor }, icon ? { marginLeft: 8 } : undefined]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
