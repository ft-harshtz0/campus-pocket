import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { QuizResult, Quiz } from '../types/database';

export function useQuizzes(studentId: string | undefined) {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    averagePercentage: 0,
    highestScore: 0,
    lowestScore: 0,
    recentResults: [] as QuizResult[],
  });

  const fetchQuizResults = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select(`
          *,
          quiz:quizzes(
            *,
            class:classes(*)
          )
        `)
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const records = (data || []) as QuizResult[];
      setResults(records);

      if (records.length > 0) {
        const scores = records.map((r) => {
          const quiz = r.quiz as Quiz;
          return quiz ? (r.score / quiz.total_marks) * 100 : 0;
        });
        const avgPercentage = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const avgScore = Math.round(records.reduce((a, b) => a + b.score, 0) / records.length);

        setStats({
          totalQuizzes: records.length,
          averageScore: avgScore,
          averagePercentage: avgPercentage,
          highestScore: Math.max(...scores),
          lowestScore: Math.min(...scores),
          recentResults: records.slice(0, 5),
        });
      }
    } catch (err) {
      console.error('Error fetching quiz results:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchQuizResults();
  }, [fetchQuizResults]);

  return { results, loading, stats, refetch: fetchQuizResults };
}
