import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Animated from 'react-native-reanimated';
import { Sparkles, BrainCircuit } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { InsightCard } from '../../src/components/ai/InsightCard';
import { useAIInsights } from '../../src/hooks/useAIInsights';

export default function ParentInsights() {
  const theme = useTheme();
  const { selectedChild } = useAuth();
  const { insights, loading, fetchInsights } = useAIInsights();

  useEffect(() => {
    if (selectedChild) {
      fetchInsights(selectedChild.id);
    }
  }, [selectedChild, fetchInsights]);

  const onRefresh = () => {
    if (selectedChild) {
      fetchInsights(selectedChild.id);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View >
          <View style={styles.headerRow}>
            <View>
              <Text style={[Typography.title, { color: theme.text }]}>AI Insights</Text>
              {selectedChild && (
                <Text style={[Typography.body, { color: theme.textMuted, marginTop: 2 }]}>
                  Performance analysis for {selectedChild.full_name}
                </Text>
              )}
            </View>
            <View style={[styles.aiBadge, { backgroundColor: theme.primaryLight + '40' }]}>
              <Sparkles size={16} color={theme.primary} />
              <Text style={[Typography.caption, { color: theme.primary, marginLeft: 4 }]}>Gemini AI</Text>
            </View>
          </View>
        </View>

        {loading && !insights ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 16 }]}>
              Analyzing performance data...
            </Text>
          </View>
        ) : insights ? (
          <View >
            <InsightCard insights={insights} />
            
            <Button
              title="Regenerate Insights"
              onPress={onRefresh}
              variant="outline"
              icon={<BrainCircuit size={18} color={theme.primary} />}
              style={{ marginTop: 32 }}
              loading={loading}
            />
          </View>
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <Sparkles size={40} color={theme.textMuted} />
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
              No insights available yet.
            </Text>
            <Button
              title="Generate Insights"
              onPress={onRefresh}
              style={{ marginTop: 20 }}
              loading={loading}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
});
