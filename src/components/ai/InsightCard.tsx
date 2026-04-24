import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react-native';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
import { AIInsight } from '../../types/database';

interface InsightCardProps {
  insights: AIInsight;
}

function InsightSection({
  title,
  items,
  icon,
  color,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  color: string;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.section, { borderLeftColor: color }]}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={[Typography.heading, { color: theme.text, marginLeft: 8 }]}>{title}</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={styles.item}>
          <View style={[styles.bullet, { backgroundColor: color }]} />
          <Text style={[Typography.body, { color: theme.textSecondary, flex: 1 }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function InsightCard({ insights }: InsightCardProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      <View>
        <LinearGradient
          colors={theme.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryHeader}>
            <Sparkles size={20} color="#FFFFFF" />
            <Text style={[Typography.heading, { color: '#FFFFFF', marginLeft: 8 }]}>
              AI Analysis
            </Text>
          </View>
          <Text style={[Typography.body, { color: 'rgba(255,255,255,0.9)', lineHeight: 22 }]}>
            {insights.summary}
          </Text>
          <Text style={[Typography.captionSmall, { color: 'rgba(255,255,255,0.5)', marginTop: 8 }]}>
            Generated {new Date(insights.generated_at).toLocaleDateString()}
          </Text>
        </LinearGradient>
      </View>

      {/* Strengths */}
      <InsightSection
        title="Strengths"
        items={insights.strengths}
        icon={<TrendingUp size={18} color={theme.success} />}
        color={theme.success}
      />

      {/* Areas for Improvement */}
      <InsightSection
        title="Needs Attention"
        items={insights.improvements}
        icon={<AlertTriangle size={18} color={theme.warning} />}
        color={theme.warning}
      />

      {/* Tips */}
      <InsightSection
        title="Suggestions"
        items={insights.tips}
        icon={<Lightbulb size={18} color={theme.primary} />}
        color={theme.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  section: {
    borderLeftWidth: 3,
    paddingLeft: 16,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
});
