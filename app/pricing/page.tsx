"use client";

import Navbar from "@/components/Navbar";
import PricingSection from "@/components/pricing/PricingSection";
import Footer from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0A1124] text-white flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#101B3B]">
      <Navbar />

      <main className="flex-1">
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
}
