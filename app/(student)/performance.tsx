import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Animated from 'react-native-reanimated';
import { BarChart3, TrendingUp, Award } from 'lucide-react-native';
import { BarChart } from 'react-native-chart-kit';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { useQuizzes } from '../../src/hooks/useQuizzes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StudentPerformance() {
  const theme = useTheme();
  const { user } = useAuth();
  const { results, stats, loading, refetch } = useQuizzes(user?.id);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const chartData = {
    labels: results.slice(0, 6).reverse().map(r => r.quiz?.title.slice(0, 5) || 'Q'),
    datasets: [{
      data: results.slice(0, 6).reverse().map(r => r.quiz ? Math.round((r.score / r.quiz.total_marks) * 100) : 0)
    }]
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View >
          <Text style={[Typography.title, { color: theme.text }]}>My Performance</Text>
          <Text style={[Typography.body, { color: theme.textMuted, marginTop: 2 }]}>
            Your quiz and assessment track record
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[Typography.stat, { color: theme.primary }]}>{stats.averagePercentage}%</Text>
            <Text style={[Typography.caption, { color: theme.textMuted }]}>Average</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[Typography.stat, { color: theme.success }]}>{Math.round(stats.highestScore)}%</Text>
            <Text style={[Typography.caption, { color: theme.textMuted }]}>Best</Text>
          </Card>
        </View>

        {chartData.labels.length > 0 && (
          <Card style={{ marginTop: 16 }}>
            <Text style={[Typography.heading, { color: theme.text, marginBottom: 16 }]}>Recent Progress</Text>
            <BarChart
              data={chartData}
              width={SCREEN_WIDTH - 72}
              height={200}
              yAxisSuffix="%"
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                labelColor: () => theme.textMuted,
                barPercentage: 0.6,
              }}
              fromZero
              showValuesOnTopOfBars
            />
          </Card>
        )}

        <Text style={[Typography.heading, { color: theme.text, marginTop: 24, marginBottom: 12 }]}>All Results</Text>
        {results.map((result) => {
          const quiz = result.quiz;
          const pct = quiz ? Math.round((result.score / quiz.total_marks) * 100) : 0;
          return (
            <Card key={result.id} variant="outlined" style={styles.resultCard}>
              <View style={styles.resultRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{quiz?.title}</Text>
                  <Text style={[Typography.caption, { color: theme.textMuted }]}>
                    {quiz?.class?.name} • {new Date(result.submitted_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[Typography.heading, { color: theme.text }]}>{result.score}/{quiz?.total_marks}</Text>
                  <Badge label={`${pct}%`} variant={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger'} size="small" />
                </View>
              </View>
            </Card>
          );
        })}

        {results.length === 0 && !loading && (
          <Card variant="outlined" style={styles.emptyCard}>
            <Award size={40} color={theme.textMuted} />
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
              No quiz results recorded yet.
            </Text>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  resultCard: {
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
});
