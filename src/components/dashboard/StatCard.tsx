import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../constants/typography';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: readonly [string, string, ...string[]];
  delay?: number;
  style?: ViewStyle;
}

export function StatCard({ title, value, subtitle, icon, gradient, style }: StatCardProps) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 140,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  gradient: {
    padding: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...Typography.stat,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  title: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    ...Typography.captionSmall,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
});
