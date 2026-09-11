import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Users, Target, Activity } from 'lucide-react';

export default async function CDEAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch some basic analytics
  const { count: totalSessions } = await supabase
    .from('cde_sessions')
    .select('*', { count: 'exact', head: true });

  const { count: totalFacts } = await supabase
    .from('cde_facts')
    .select('*', { count: 'exact', head: true });

  const { data: sessions } = await supabase
    .from('cde_sessions')
    .select('profile_strength')
    .eq('status', 'completed');

  const avgStrength = sessions && sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.profile_strength || 0), 0) / sessions.length)
    : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Career Discovery Engine - Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-neutral-500 mb-2">
            <Activity className="w-5 h-5" />
            <span className="font-medium">Total Sessions</span>
          </div>
          <div className="text-4xl font-bold">{totalSessions || 0}</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-neutral-500 mb-2">
            <Target className="w-5 h-5" />
            <span className="font-medium">Facts Collected</span>
          </div>
          <div className="text-4xl font-bold">{totalFacts || 0}</div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 text-neutral-500 mb-2">
            <Users className="w-5 h-5" />
            <span className="font-medium">Avg Completion Strength</span>
          </div>
          <div className="text-4xl font-bold">{avgStrength}%</div>
        </div>
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-8 border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-semibold mb-4">Phase 2 Dashboard</h2>
        <p className="text-neutral-500 mb-4">
          This dashboard currently tracks basic usage metrics for the Career Discovery Engine. 
          In the future, this is where you will be able to edit Question Definitions and create new Rule flows without modifying code.
        </p>
      </div>
    </div>
  );
}
