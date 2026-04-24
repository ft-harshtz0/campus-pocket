import React from 'react';
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
  BookOpen,
  LogOut,
  Bell,
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { StatCard } from '../../src/components/dashboard/StatCard';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { Badge } from '../../src/components/ui/Badge';
import { useAttendance } from '../../src/hooks/useAttendance';
import { useQuizzes } from '../../src/hooks/useQuizzes';
import { useClasses } from '../../src/hooks/useClasses';

export default function StudentHome() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const { stats: attendanceStats, refetch: refetchAttendance } = useAttendance(user?.id);
  const { stats: quizStats, refetch: refetchQuizzes } = useQuizzes(user?.id);
  const { classes, refetch: refetchClasses } = useClasses(user?.id);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAttendance(), refetchQuizzes(), refetchClasses()]);
    setRefreshing(false);
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View >
          <View style={styles.headerLeft}>
            <Avatar name={profile?.full_name || 'Student'} size={48} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[Typography.caption, { color: theme.textMuted }]}>
                {greeting()} 👋
              </Text>
              <Text style={[Typography.title, { color: theme.text }]}>
                {profile?.full_name?.split(' ')[0] || 'Student'}
              </Text>
            </View>
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

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard
            title="Attendance"
            value={`${attendanceStats.percentage}%`}
            icon={<CalendarCheck size={18} color="#FFFFFF" />}
            gradient={['#6366F1', '#8B5CF6']}
            delay={0}
          />
          <StatCard
            title="Avg Score"
            value={`${quizStats.averagePercentage}%`}
            icon={<BarChart3 size={18} color="#FFFFFF" />}
            gradient={['#EC4899', '#F472B6']}
            delay={100}
          />
        </View>

        {/* Upcoming Classes */}
        <View >
          <View style={styles.sectionHeader}>
            <Text style={[Typography.heading, { color: theme.text }]}>Today's Schedule</Text>
            <Pressable onPress={() => router.push('/(student)/classes')}>
              <Text style={[Typography.caption, { color: theme.primary }]}>See all</Text>
            </Pressable>
          </View>
          {classes.length > 0 ? (
            classes.slice(0, 3).map((item, i) => (
              <Card key={item.id} variant="outlined" style={styles.classCard}>
                <View style={styles.classRow}>
                  <View style={[styles.timeBox, { backgroundColor: theme.borderLight }]}>
                    <Clock size={16} color={theme.primary} />
                    <Text style={[Typography.captionSmall, { color: theme.text, marginTop: 4 }]}>
                      {item.schedule.split(' ')[1]}
                    </Text>
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={[Typography.bodySemiBold, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[Typography.caption, { color: theme.textMuted }]}>
                      {item.subject} • Room {item.room}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={theme.textMuted} />
                </View>
              </Card>
            ))
          ) : (
            <Card variant="outlined" style={styles.emptyCard}>
              <BookOpen size={32} color={theme.textMuted} />
              <Text style={[Typography.body, { color: theme.textMuted, marginTop: 8 }]}>
                No classes scheduled for today
              </Text>
            </Card>
          )}
        </View>

        {/* Recent Performance */}
        <View >
          <View style={styles.sectionHeader}>
            <Text style={[Typography.heading, { color: theme.text }]}>Recent Quizzes</Text>
            <Pressable onPress={() => router.push('/(student)/performance')}>
              <Text style={[Typography.caption, { color: theme.primary }]}>Full report</Text>
            </Pressable>
          </View>
          {quizStats.recentResults.slice(0, 2).map((result) => {
            const quiz = result.quiz;
            const pct = quiz ? Math.round((result.score / quiz.total_marks) * 100) : 0;
            return (
              <Card key={result.id} variant="outlined" style={styles.quizCard}>
                <View style={styles.quizRow}>
                  <View style={styles.quizInfo}>
                    <Text style={[Typography.bodyMedium, { color: theme.text }]}>{quiz?.title}</Text>
                    <Text style={[Typography.caption, { color: theme.textMuted }]}>
                      {quiz?.class?.name}
                    </Text>
                  </View>
                  <View style={styles.quizScore}>
                    <Text style={[Typography.heading, { color: theme.text }]}>{result.score}/{quiz?.total_marks}</Text>
                    <Badge label={`${pct}%`} variant={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger'} size="small" />
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* AI Study Tip */}
        <View >
          <Card style={styles.aiCard}>
            <View style={styles.aiRow}>
              <View style={[styles.aiIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Sparkles size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[Typography.bodySemiBold, { color: '#FFFFFF' }]}>Study Tip</Text>
                <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  Based on your performance, focus on Math concepts for the upcoming week.
                </Text>
              </View>
            </View>
          </Card>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  classCard: {
    marginBottom: 8,
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classInfo: {
    flex: 1,
  },
  quizCard: {
    marginBottom: 8,
  },
  quizRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizInfo: {
    flex: 1,
  },
  quizScore: {
    alignItems: 'flex-end',
    gap: 4,
  },
  aiCard: {
    backgroundColor: '#6366F1',
    marginTop: 20,
    padding: 16,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 8,
  },
});
