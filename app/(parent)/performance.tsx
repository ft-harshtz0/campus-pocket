import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Animated from 'react-native-reanimated';
import { BarChart3, TrendingUp, TrendingDown, Award } from 'lucide-react-native';
import { BarChart } from 'react-native-chart-kit';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { useQuizzes } from '../../src/hooks/useQuizzes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ParentPerformance() {
  const theme = useTheme();
  const { selectedChild } = useAuth();
  const { results, stats, loading, refetch } = useQuizzes(selectedChild?.id);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Prepare chart data: last 6 quizzes
  const recentForChart = results.slice(0, 6).reverse();
  const chartData = {
    labels: recentForChart.map((r) => {
      const title = r.quiz?.title || 'Q';
      return title.length > 6 ? title.slice(0, 6) : title;
    }),
    datasets: [
      {
        data: recentForChart.map((r) => {
          const quiz = r.quiz;
          return quiz ? Math.round((r.score / quiz.total_marks) * 100) : 0;
        }),
      },
    ],
  };

  // Group results by subject
  const bySubject = results.reduce((acc, r) => {
    const subject = r.quiz?.class?.subject || 'Unknown';
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(r);
    return acc;
  }, {} as Record<string, typeof results>);

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
          <Text style={[Typography.title, { color: theme.text }]}>Performance</Text>
          {selectedChild && (
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 2 }]}>
              {selectedChild.full_name}'s quiz & assignment scores
            </Text>
          )}
        </View>

        {/* Overview Stats */}
        <View >
          <Card style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <View style={styles.overviewStat}>
                <View style={[styles.iconBg, { backgroundColor: theme.isDark ? '#312E81' : '#EEF2FF' }]}>
                  <BarChart3 size={18} color={theme.primary} />
                </View>
                <Text style={[Typography.stat, { color: theme.text }]}>{stats.averagePercentage}%</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Average</Text>
              </View>
              <View style={styles.overviewStat}>
                <View style={[styles.iconBg, { backgroundColor: theme.successLight }]}>
                  <TrendingUp size={18} color={theme.success} />
                </View>
                <Text style={[Typography.stat, { color: theme.text }]}>{Math.round(stats.highestScore)}%</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Best</Text>
              </View>
              <View style={styles.overviewStat}>
                <View style={[styles.iconBg, { backgroundColor: theme.dangerLight }]}>
                  <TrendingDown size={18} color={theme.danger} />
                </View>
                <Text style={[Typography.stat, { color: theme.text }]}>{Math.round(stats.lowestScore)}%</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Lowest</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Chart */}
        {recentForChart.length > 0 && (
          <View >
            <Text style={[Typography.heading, { color: theme.text, marginTop: 20, marginBottom: 12 }]}>
              Recent Quiz Scores
            </Text>
            <Card>
              <BarChart
                data={chartData}
                width={SCREEN_WIDTH - 80}
                height={200}
                yAxisSuffix="%"
                yAxisLabel=""
                chartConfig={{
                  backgroundColor: theme.card,
                  backgroundGradientFrom: theme.card,
                  backgroundGradientTo: theme.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                  labelColor: () => theme.textMuted,
                  style: { borderRadius: 16 },
                  barPercentage: 0.6,
                  propsForBackgroundLines: {
                    stroke: theme.borderLight,
                    strokeDasharray: '4',
                  },
                }}
                style={styles.chart}
                showValuesOnTopOfBars
                fromZero
              />
            </Card>
          </View>
        )}

        {/* Subject-wise Breakdown */}
        <View >
          <Text style={[Typography.heading, { color: theme.text, marginTop: 20, marginBottom: 12 }]}>
            Subject Breakdown
          </Text>
          {Object.entries(bySubject).map(([subject, subResults]) => {
            const avg = Math.round(
              subResults.reduce((a, r) => {
                const quiz = r.quiz;
                return a + (quiz ? (r.score / quiz.total_marks) * 100 : 0);
              }, 0) / subResults.length
            );
            const variant = avg >= 80 ? 'success' : avg >= 50 ? 'warning' : 'danger';
            const color = avg >= 80 ? theme.success : avg >= 50 ? theme.warning : theme.danger;

            return (
              <Card key={subject} variant="outlined" style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <Text style={[Typography.bodyMedium, { color: theme.text }]}>{subject}</Text>
                  <Badge label={`${avg}%`} variant={variant} size="small" />
                </View>
                <ProgressBar progress={avg} color={color} height={6} style={{ marginTop: 10 }} />
                <Text style={[Typography.caption, { color: theme.textMuted, marginTop: 6 }]}>
                  {subResults.length} quiz{subResults.length > 1 ? 'zes' : ''}
                </Text>
              </Card>
            );
          })}
        </View>

        {/* All Results */}
        <View >
          <Text style={[Typography.heading, { color: theme.text, marginTop: 20, marginBottom: 12 }]}>
            All Results
          </Text>
          {results.map((result) => {
            const quiz = result.quiz;
            const pct = quiz ? Math.round((result.score / quiz.total_marks) * 100) : 0;
            const variant = pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger';
            return (
              <Card key={result.id} variant="outlined" style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <View style={styles.resultInfo}>
                    <Text style={[Typography.bodyMedium, { color: theme.text }]}>
                      {quiz?.title}
                    </Text>
                    <Text style={[Typography.caption, { color: theme.textMuted }]}>
                      {quiz?.class?.name} • {new Date(result.submitted_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.resultScore}>
                    <Text style={[Typography.heading, { color: theme.text }]}>
                      {result.score}/{quiz?.total_marks}
                    </Text>
                    <Badge label={`${pct}%`} variant={variant} size="small" />
                  </View>
                </View>
              </Card>
            );
          })}

          {results.length === 0 && !loading && (
            <Card variant="outlined" style={styles.emptyCard}>
              <Award size={40} color={theme.textMuted} />
              <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
                No quiz results yet
              </Text>
            </Card>
          )}
        </View>
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
  overviewCard: {
    marginTop: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
    gap: 4,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  subjectCard: {
    marginBottom: 10,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCard: {
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  resultScore: {
    alignItems: 'flex-end',
    gap: 4,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
});
