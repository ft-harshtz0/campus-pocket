import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Animated from 'react-native-reanimated';
import { Check, X, Clock, CalendarCheck } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { useAttendance } from '../../src/hooks/useAttendance';

export default function StudentAttendance() {
  const theme = useTheme();
  const { user } = useAuth();
  const { attendance, stats, loading, refetch } = useAttendance(user?.id);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const grouped = attendance.reduce((acc, record) => {
    const month = new Date(record.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(record);
    return acc;
  }, {} as Record<string, typeof attendance>);

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
          <Text style={[Typography.title, { color: theme.text }]}>My Attendance</Text>
          <Text style={[Typography.body, { color: theme.textMuted, marginTop: 2 }]}>
            Your daily presence record
          </Text>
        </View>

        <View >
          <Card style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <View style={styles.overviewStat}>
                <Text style={[Typography.stat, { color: theme.primary }]}>{stats.percentage}%</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Attendance</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Text style={[Typography.stat, { color: theme.success }]}>{stats.present}</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Present</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Text style={[Typography.stat, { color: theme.danger }]}>{stats.absent}</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Absent</Text>
              </View>
            </View>
            <ProgressBar
              progress={stats.percentage}
              color={stats.percentage >= 75 ? theme.success : theme.danger}
              style={{ marginTop: 16 }}
            />
          </Card>
        </View>

        {Object.entries(grouped).map(([month, records], idx) => (
          <View key={month}>
            <Text style={[Typography.heading, { color: theme.text, marginTop: 24, marginBottom: 12 }]}>
              {month}
            </Text>
            {records.map((record) => (
              <Card key={record.id} variant="outlined" style={styles.recordCard}>
                <View style={styles.recordRow}>
                  <View style={[styles.statusIcon, { 
                    backgroundColor: record.status === 'present' ? theme.successLight : 
                                     record.status === 'absent' ? theme.dangerLight : theme.warningLight 
                  }]}>
                    {record.status === 'present' ? <Check size={16} color={theme.success} /> : 
                     record.status === 'absent' ? <X size={16} color={theme.danger} /> : 
                     <Clock size={16} color={theme.warning} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.bodyMedium, { color: theme.text }]}>
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                    <Text style={[Typography.caption, { color: theme.textMuted }]}>
                      {record.class?.name}
                    </Text>
                  </View>
                  <Badge 
                    label={record.status.toUpperCase()} 
                    variant={record.status === 'present' ? 'success' : record.status === 'absent' ? 'danger' : 'warning'} 
                    size="small" 
                  />
                </View>
              </Card>
            ))}
          </View>
        ))}

        {attendance.length === 0 && !loading && (
          <Card variant="outlined" style={styles.emptyCard}>
            <CalendarCheck size={40} color={theme.textMuted} />
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 12, textAlign: 'center' }]}>
              No attendance records found.
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
  overviewCard: {
    marginTop: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    opacity: 0.5,
  },
  recordCard: {
    marginBottom: 8,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
});
