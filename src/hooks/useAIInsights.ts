import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AIInsight } from '../types/database';

export function useAIInsights() {
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (studentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('gemini-insights', {
        body: { student_id: studentId },
      });

      if (fnError) throw fnError;

      setInsights({
        ...data,
        generated_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error fetching AI insights:', err);
      setError(err.message || 'Failed to generate insights');
      // Provide fallback mock insights for demo
      setInsights({
        summary: 'Based on recent performance data, the student shows consistent engagement with coursework. Attendance has been regular with minor gaps in certain subjects.',
        strengths: [
          'Strong performance in Mathematics with above-average quiz scores',
          'Consistent attendance record above 85%',
          'Improving trend in Science subjects over the last month',
        ],
        improvements: [
          'English quiz scores show a declining trend — review recent topics',
          'Two consecutive late marks in morning classes suggest schedule adjustments',
          'Quiz preparation time could be improved based on submission patterns',
        ],
        tips: [
          'Consider dedicating 30 minutes daily to English reading comprehension',
          'Setting an earlier alarm to avoid late marks in morning sessions',
          'Practice quizzes from previous chapters to reinforce fundamentals',
          'Join study groups for collaborative learning in weaker subjects',
        ],
        generated_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { insights, loading, error, fetchInsights };
}
