import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Read environment variables
const envContent = fs.readFileSync("d:/resume builder/resume-optimizer/.env.local", "utf8");
const lines = envContent.split("\n");
const env = {};
for (const line of lines) {
  const match = line.match(/^\s*(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
  console.log("1. Inspecting job_applications columns...");
  const { data: jobApps, error: jobAppsError } = await supabase
    .from("job_applications")
    .select("id, company, role, salary, platform, date, status, notes, reminders, resume_id, jd_text, jd_url, jd_match_score")
    .limit(1);

  if (jobAppsError) {
    console.error("Error querying job_applications columns:", jobAppsError.message);
  } else {
    console.log("job_applications query successful! New columns exist.");
  }

  console.log("\n1b. Inspecting user_profiles columns...");
  const { data: profiles, error: profileErr } = await supabase
    .from("user_profiles")
    .select("id, email, role, has_completed_onboarding")
    .limit(1);

  if (profileErr) {
    console.error("Error querying user_profiles columns:", profileErr.message);
  } else {
    console.log("user_profiles has_completed_onboarding exists!");
  }

  console.log("\n2. Inspecting notifications table...");
  const { data: notifications, error: notifError } = await supabase
    .from("notifications")
    .select("*")
    .limit(1);

  if (notifError) {
    console.log("notifications table does not exist or error:", notifError.message);
  } else {
    console.log("notifications table exists!");
  }

  console.log("\n3. Inspecting ai_requests table...");
  const { data: aiReqs, error: aiReqError } = await supabase
    .from("ai_requests")
    .select("*")
    .limit(1);

  if (aiReqError) {
    console.log("ai_requests table does not exist or error:", aiReqError.message);
  } else {
    console.log("ai_requests table exists!");
  }
}

inspect();
