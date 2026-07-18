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

    // --- JOURNAL GAMIFICATION: BONUS CREDITS ---
    const creditMap: Record<string, number> = {
      promotion: 25,
      award: 20,
      impact: 20,
      publication: 20,
      certification: 15,
      project: 15,
      feedback: 15,
      mentorship: 10,
      skill: 8,
      other: 3,
      win: 0,
      gap: 0,
    };

    const potentialBonus = creditMap[entry_type] || 0;

    if (potentialBonus > 0) {
      // Get current month start
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Check how many credits they earned this month from journal
      const { data: monthTx, error: txErr } = await supabase
        .from("credit_transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("category", "journal_bonus")
        .gte("created_at", startOfMonth);

      if (!txErr && monthTx) {
        const earnedThisMonth = monthTx.reduce((sum, tx) => sum + tx.amount, 0);
        const MAX_MONTHLY_BONUS = 50;

        let allowedBonus = Math.min(potentialBonus, MAX_MONTHLY_BONUS - earnedThisMonth);

        // --- DIMINISHING RETURNS: Check same entry_type in last 7 days ---
        if (allowedBonus > 0) {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const { data: recentSameType } = await supabase
            .from("career_journal_entries")
            .select("id")
            .eq("user_id", user.id)
            .eq("entry_type", entry_type)
            .gte("created_at", sevenDaysAgo.toISOString());

          const sameTypeCount = recentSameType ? recentSameType.length : 0;

          // 5+ same type in 7 days → 0 bonus
          // 3-4 same type in 7 days → 50% bonus
          if (sameTypeCount >= 5) {
            allowedBonus = 0;
          } else if (sameTypeCount >= 3) {
            allowedBonus = Math.floor(allowedBonus * 0.5);
          }
        }
        // -------------------------------------------------------------------

        if (allowedBonus > 0) {
          // Give them the allowed bonus
          const { data: profile } = await supabase
            .from("profiles")
            .select("credit_balance")
            .eq("id", user.id)
            .single();

          if (profile) {
            await supabase
              .from("profiles")
              .update({ credit_balance: profile.credit_balance + allowedBonus })
              .eq("id", user.id);

            await supabase
              .from("credit_transactions")
              .insert({
                user_id: user.id,
                amount: allowedBonus,
                reason: `Journal Entry Bonus: ${entry_type}`,
                category: "journal_bonus",
                expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() // 12 months expiry
              });
          }
        }
      }
    }
    // -------------------------------------------

    return NextResponse.json({ success: true, entry: data });
  } catch (error: unknown) {
    console.error("Error creating journal entry:", error);
    return NextResponse.json({ error: "Failed to save journal entry. Please try again." }, { status: 500 });
  }
}
