import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'primary' | 'secondary' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'primary', size = 'medium', style }: BadgeProps) {
  const theme = useTheme();

  const colorMap = {
    success: { bg: theme.successLight, text: theme.success },
    warning: { bg: theme.warningLight, text: theme.warning },
    danger: { bg: theme.dangerLight, text: theme.danger },
    primary: { bg: theme.isDark ? '#312E81' : '#EEF2FF', text: theme.primary },
    secondary: { bg: theme.isDark ? '#831843' : '#FDF2F8', text: theme.secondary },
    muted: { bg: theme.borderLight, text: theme.textMuted },
  };

  const colors = colorMap[variant];

  return (
    <View
      style={[
        styles.badge,
        size === 'small' && styles.badgeSmall,
        { backgroundColor: colors.bg },
        style,
      ]}
    >
      <Text
        style={[
          size === 'small' ? Typography.captionSmall : Typography.caption,
          { color: colors.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
});
