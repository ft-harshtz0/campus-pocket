import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Class } from '../types/database';

export function useClasses(studentId: string | undefined) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_classes')
        .select(`
          class_id,
          class:classes(*)
        `)
        .eq('student_id', studentId);

      if (error) throw error;

      const classList = (data || []).map((item: any) => item.class as Class).filter(Boolean);
      setClasses(classList);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, loading, refetch: fetchClasses };
}
