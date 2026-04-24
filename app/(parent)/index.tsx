import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Animated from 'react-native-reanimated';
import {
  CalendarCheck,
  BarChart3,
  CreditCard,
  Bell,
  LogOut,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { StatCard } from '../../src/components/dashboard/StatCard';
import { ChildSelector } from '../../src/components/dashboard/ChildSelector';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { useAttendance } from '../../src/hooks/useAttendance';
import { useQuizzes } from '../../src/hooks/useQuizzes';
import { useFees } from '../../src/hooks/useFees';

export default function ParentHome() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, children, selectedChild, setSelectedChild, signOut } = useAuth();
  const { stats: attendanceStats, loading: attLoading } = useAttendance(selectedChild?.id);
  const { stats: quizStats, results: quizResults } = useQuizzes(selectedChild?.id);
  const { stats: feeStats } = useFees(selectedChild?.id);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Hooks auto-refetch when studentId changes
    setTimeout(() => setRefreshing(false), 1000);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View >
          <View style={styles.headerLeft}>
            <Text style={[Typography.caption, { color: theme.textMuted }]}>
              {greeting()} 👋
            </Text>
            <Text style={[Typography.title, { color: theme.text }]}>
              {profile?.full_name || 'Parent'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              onPress={signOut}
              style={[styles.iconButton, { backgroundColor: theme.surface }]}
            >
              <LogOut size={20} color={theme.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Child Selector */}
        {children.length > 0 && (
          <View >
            <Text style={[Typography.caption, { color: theme.textMuted, marginBottom: 8 }]}>
              VIEWING FOR
            </Text>
            <ChildSelector
              children={children}
              selected={selectedChild}
              onSelect={setSelectedChild}
            />
          </View>
        )}

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <StatCard
            title="Attendance"
            value={`${attendanceStats.percentage}%`}
            subtitle={`${attendanceStats.present} of ${attendanceStats.total} days`}
            icon={<CalendarCheck size={18} color="#FFFFFF" />}
            gradient={['#6366F1', '#8B5CF6']}
            delay={0}
          />
          <StatCard
            title="Avg Score"
            value={`${quizStats.averagePercentage}%`}
            subtitle={`${quizStats.totalQuizzes} quizzes taken`}
            icon={<BarChart3 size={18} color="#FFFFFF" />}
            gradient={['#EC4899', '#F472B6']}
            delay={100}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Pending Fees"
            value={`${feeStats.pendingCount + feeStats.overdueCount}`}
            subtitle={feeStats.totalDue > 0 ? `₹${feeStats.totalDue.toLocaleString()} due` : 'All clear!'}
            icon={<CreditCard size={18} color="#FFFFFF" />}
            gradient={feeStats.overdueCount > 0 ? ['#EF4444', '#F87171'] : ['#10B981', '#34D399']}
            delay={200}
          />
          <StatCard
            title="Late Marks"
            value={`${attendanceStats.late}`}
            subtitle={attendanceStats.late > 3 ? 'Needs attention' : 'Looking good'}
            icon={<Clock size={18} color="#FFFFFF" />}
            gradient={['#F59E0B', '#FBBF24']}
            delay={300}
          />
        </View>

        {/* Recent Quiz Scores */}
        <View >
          <Text style={[Typography.heading, { color: theme.text, marginBottom: 12, marginTop: 8 }]}>
            Recent Quiz Scores
          </Text>
          {quizStats.recentResults.length > 0 ? (
            quizStats.recentResults.slice(0, 4).map((result, i) => {
              const quiz = result.quiz;
              const percentage = quiz ? Math.round((result.score / quiz.total_marks) * 100) : 0;
              const variant = percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'danger';
              return (
                <Card key={result.id} style={styles.quizCard} variant="outlined">
                  <View style={styles.quizRow}>
                    <View style={styles.quizInfo}>
                      <Text style={[Typography.bodyMedium, { color: theme.text }]}>
                        {quiz?.title || 'Quiz'}
                      </Text>
                      <Text style={[Typography.caption, { color: theme.textMuted }]}>
                        {quiz?.class?.name || ''} • {new Date(result.submitted_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.quizScore}>
                      <Text style={[Typography.heading, { color: theme.text }]}>
                        {result.score}/{quiz?.total_marks}
                      </Text>
                      <Badge label={`${percentage}%`} variant={variant} size="small" />
                    </View>
                  </View>
                </Card>
              );
            })
          ) : (
            <Card variant="outlined" style={{ alignItems: 'center', padding: 32 }}>
              <BarChart3 size={32} color={theme.textMuted} />
              <Text style={[Typography.body, { color: theme.textMuted, marginTop: 8 }]}>
                No quiz results yet
              </Text>
            </Card>
          )}
        </View>

        {/* Fee Alerts */}
        {feeStats.overdueCount > 0 && (
          <View >
            <Card
              style={[styles.alertCard, { borderColor: theme.danger }]}
              variant="outlined"
            >
              <View style={styles.alertRow}>
                <AlertCircle size={20} color={theme.danger} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[Typography.bodySemiBold, { color: theme.danger }]}>
                    {feeStats.overdueCount} Overdue Fee{feeStats.overdueCount > 1 ? 's' : ''}
                  </Text>
                  <Text style={[Typography.caption, { color: theme.textMuted }]}>
                    Total due: ₹{feeStats.totalDue.toLocaleString()}
                  </Text>
                </View>
                <Badge label="Urgent" variant="danger" size="small" />
              </View>
            </Card>
          </View>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quizCard: {
    marginBottom: 8,
  },
  quizRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizInfo: {
    flex: 1,
    gap: 2,
  },
  quizScore: {
    alignItems: 'flex-end',
    gap: 4,
  },
  alertCard: {
    marginTop: 12,
    borderWidth: 1,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
