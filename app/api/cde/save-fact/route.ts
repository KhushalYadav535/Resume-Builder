import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If no user is logged in, we return 401. However, for a public MVP, you might want to skip this check
    // or handle anonymous sessions.
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, factKey, factValue, sourceQuestionId } = await req.json();

    if (!sessionId || !factKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert the fact
    const { data, error } = await supabase
      .from('cde_facts')
      .upsert({
        session_id: sessionId,
        user_id: user.id,
        fact_key: factKey,
        fact_value: factValue,
        source_question_id: sourceQuestionId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id, fact_key' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, fact: data });
  } catch (error) {
    console.error('Error saving fact:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
