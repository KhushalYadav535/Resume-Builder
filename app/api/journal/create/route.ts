import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, entry_type, tags, source, extracted_metrics } = body;

    if (!content || !entry_type) {
      return NextResponse.json({ error: "Missing content or entry_type" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("career_journal_entries")
      .insert({
        user_id: user.id,
        content,
        entry_type,
        tags: tags || [],
        source: source || 'manual',
        extracted_metrics: extracted_metrics || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, entry: data });
  } catch (error: any) {
    console.error("Error creating journal entry:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
