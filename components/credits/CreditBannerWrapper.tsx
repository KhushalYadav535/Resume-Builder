"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
import CreditUpsellBanner from "@/components/credits/CreditUpsellBanner";

export default function CreditBannerWrapper() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ tier: string; credit_balance: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("tier, credit_balance")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [user]);

  if (!profile || !user) return null;

  return (
    <CreditUpsellBanner
      creditBalance={profile.credit_balance}
      tier={profile.tier}
    />
  );
}
