import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { keywordId, action } = await req.json();
    if (!keywordId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Fetch the pending keyword
    const { data: kw, error: fetchErr } = await supabase
      .from('pending_keywords')
      .select('*')
      .eq('id', keywordId)
      .single();

    if (fetchErr || !kw) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }

    if (kw.status !== 'pending') {
      return NextResponse.json({ error: "Keyword is already " + kw.status }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    if (action === 'approve') {
      const dynamicPath = path.join(process.cwd(), 'keywords', 'dynamic', `${kw.industry}.json`);
      let data: { keywords: any[] } = { keywords: [] };
      if (fs.existsSync(dynamicPath)) {
        try {
          data = JSON.parse(fs.readFileSync(dynamicPath, 'utf8'));
        } catch (e) {
          console.warn("Could not parse existing dynamic file", e);
        }
      }

      // 6 months from now
      const expiresOn = new Date();
      expiresOn.setMonth(expiresOn.getMonth() + 6);

      data.keywords.push({
        keyword: kw.keyword,
        weight: kw.weight,
        aliases: kw.aliases || [],
        is_active: true,
        expires_on: expiresOn.toISOString().split('T')[0]
      } as any);

      fs.writeFileSync(dynamicPath, JSON.stringify(data, null, 2), 'utf8');
    }

    // Update DB status
    const { error: updateErr } = await supabase
      .from('pending_keywords')
      .update({ status: newStatus })
      .eq('id', keywordId);

    if (updateErr) {
      console.error(updateErr);
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
