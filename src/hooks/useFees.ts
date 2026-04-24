import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Fee } from '../types/database';

export function useFees(studentId: string | undefined) {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDue: 0,
    totalPaid: 0,
    pendingCount: 0,
    overdueCount: 0,
  });

  const fetchFees = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', studentId)
        .order('due_date', { ascending: false });

      if (error) throw error;

      const records = (data || []) as Fee[];
      setFees(records);

      const pending = records.filter((f) => f.status === 'pending');
      const overdue = records.filter((f) => f.status === 'overdue');
      const paid = records.filter((f) => f.status === 'paid');

      setStats({
        totalDue: [...pending, ...overdue].reduce((a, b) => a + b.amount, 0),
        totalPaid: paid.reduce((a, b) => a + b.amount, 0),
        pendingCount: pending.length,
        overdueCount: overdue.length,
      });
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  // Realtime subscription
  useEffect(() => {
    if (!studentId) return;

    const channel = supabase
      .channel(`fees_${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fees',
          filter: `student_id=eq.${studentId}`,
        },
        () => {
          fetchFees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, fetchFees]);

  return { fees, loading, stats, refetch: fetchFees };
}
