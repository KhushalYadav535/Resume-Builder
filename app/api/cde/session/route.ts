import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has an active session
    let { data: session, error } = await supabase
      .from('cde_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Create new session if none exists
    if (!session) {
      const { data: newSession, error: createError } = await supabase
        .from('cde_sessions')
        .insert({ user_id: user.id, status: 'in_progress' })
        .select()
        .single();

      if (createError) throw createError;
      session = newSession;
    }

    // Fetch facts for this session
    const { data: facts } = await supabase
      .from('cde_facts')
      .select('fact_key, fact_value')
      .eq('session_id', session.id);

    // Format facts to match local state { key: value }
    const knownFacts = facts?.reduce((acc: any, fact) => {
      acc[fact.fact_key] = fact.fact_value;
      return acc;
    }, {}) || {};

    return NextResponse.json({ session, knownFacts });
  } catch (error) {
    console.error('Error with session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
