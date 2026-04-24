const { createClient } = require('@supabase/supabase-js');

const url = 'https://lwoahalttiywfozilnts.supabase.co';
const key = 'sb_publishable_LX-j4Les4yJrJzGycIx5_A_JHYxd79s';

const supabase = createClient(url, key);

async function run() {
  const tables = [
    'profiles',
    'classes',
    'student_parents',
    'student_classes',
    'attendance',
    'quizzes',
    'quiz_results',
    'fees',
    'todos',
  ];

  for (const table of tables) {
    const { error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`${table}: ERROR -> ${error.message}`);
    } else {
      console.log(`${table}: OK (count=${count})`);
    }
  }
}

run().catch((error) => {
  console.error('Connection check failed:', error.message);
  process.exit(1);
});
