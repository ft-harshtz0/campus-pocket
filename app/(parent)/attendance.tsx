import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Animated from 'react-native-reanimated';
import { CalendarCheck, Check, X, Clock } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { Typography } from '../../src/constants/typography';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { useAttendance } from '../../src/hooks/useAttendance';

export default function ParentAttendance() {
  const theme = useTheme();
  const { selectedChild } = useAuth();
  const { attendance, stats, loading, refetch } = useAttendance(selectedChild?.id);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Group attendance by month
  const grouped = attendance.reduce((acc, record) => {
    const month = new Date(record.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(record);
    return acc;
  }, {} as Record<string, typeof attendance>);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <Check size={16} color={theme.success} />;
      case 'absent':
        return <X size={16} color={theme.danger} />;
      case 'late':
        return <Clock size={16} color={theme.warning} />;
      default:
        return null;
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'present': return 'success' as const;
      case 'absent': return 'danger' as const;
      case 'late': return 'warning' as const;
      default: return 'muted' as const;
    }
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
          <Text style={[Typography.title, { color: theme.text }]}>Attendance</Text>
          {selectedChild && (
            <Text style={[Typography.body, { color: theme.textMuted, marginTop: 2 }]}>
              {selectedChild.full_name}'s attendance record
            </Text>
          )}
        </View>

        {/* Overview Card */}
        <View >
          <Card style={styles.overviewCard}>
            <View style={styles.overviewRow}>
              <View style={styles.overviewStat}>
                <Text style={[Typography.stat, { color: theme.primary }]}>
                  {stats.percentage}%
                </Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>
                  Overall
                </Text>
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
              <View style={styles.overviewDivider} />
              <View style={styles.overviewStat}>
                <Text style={[Typography.stat, { color: theme.warning }]}>{stats.late}</Text>
                <Text style={[Typography.caption, { color: theme.textMuted }]}>Late</Text>
              </View>
            </View>
            <View style={{ marginTop: 16 }}>
              <ProgressBar
                progress={stats.percentage}
                color={stats.percentage >= 75 ? theme.success : theme.danger}
                height={10}
              />
            </View>
          </Card>
        </View>

        {/* Attendance Records by Month */}
        {Object.entries(grouped).map(([month, records], groupIndex) => (
          <View
            key={month}
            
          >
            <Text style={[Typography.heading, { color: theme.text, marginTop: 20, marginBottom: 12 }]}>
              {month}
            </Text>
            {records.map((record) => (
              <Card key={record.id} variant="outlined" style={styles.recordCard}>
                <View style={styles.recordRow}>
                  <View style={[styles.statusDot, {
                    backgroundColor: record.status === 'present' ? theme.successLight :
                      record.status === 'absent' ? theme.dangerLight : theme.warningLight,
                  }]}>
                    {statusIcon(record.status)}
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={[Typography.bodyMedium, { color: theme.text }]}>
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={[Typography.caption, { color: theme.textMuted }]}>
                      {record.class?.name || 'Class'}
                    </Text>
                  </View>
                  <Badge
                    label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    variant={statusVariant(record.status)}
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
              No attendance records yet.{'\n'}They'll appear here once marked.
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
  statusDot: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInfo: {
    flex: 1,
    gap: 2,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
});
