"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function Tracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      // Store in localStorage
      localStorage.setItem("uprole_referral_code", ref);
      
      // Also store in cookie (lives for 30 days) in case we need it server-side later
      document.cookie = `uprole_referral_code=${ref}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }
  }, [searchParams]);

  return null;
}

export default function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
