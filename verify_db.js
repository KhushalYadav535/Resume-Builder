const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SERVICE_ROLE_KEY
);

async function verify() {
  let success = true;
  console.log("Verifying 'profiles' table...");
  const { data: pData, error: pError } = await supabase.from('profiles').select('id, tier, credit_balance').limit(1);
  if (pError) {
    console.error("❌ Profiles Table Error:", pError.message);
    success = false;
  } else {
    console.log("✅ 'profiles' Table EXISTS!");
  }

  console.log("\nVerifying 'credit_transactions' table...");
  const { data: cData, error: cError } = await supabase.from('credit_transactions').select('id, amount, reason').limit(1);
  if (cError) {
    console.error("❌ Transactions Table Error:", cError.message);
    success = false;
  } else {
    console.log("✅ 'credit_transactions' Table EXISTS!");
  }

  if (success) {
    console.log("\n🎉 Verification successful! All tables are perfectly set up.");
  } else {
    console.log("\n⚠️ Verification failed. The tables might not have been created correctly.");
  }
}

verify();
