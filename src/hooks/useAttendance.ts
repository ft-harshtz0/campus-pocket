import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Attendance } from '../types/database';

export function useAttendance(studentId: string | undefined) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
  });

  const fetchAttendance = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          class:classes(*)
        `)
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;

      const records = (data || []) as Attendance[];
      setAttendance(records);

      const total = records.length;
      const present = records.filter((r) => r.status === 'present').length;
      const absent = records.filter((r) => r.status === 'absent').length;
      const late = records.filter((r) => r.status === 'late').length;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      setStats({ total, present, absent, late, percentage });
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Realtime subscription
  useEffect(() => {
    if (!studentId) return;

    const channel = supabase
      .channel(`attendance_${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `student_id=eq.${studentId}`,
        },
        () => {
          fetchAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, fetchAttendance]);

  return { attendance, loading, stats, refetch: fetchAttendance };
}
