"use client";

import React from "react";
import { Asterisk } from "lucide-react";

interface ValueMarqueeProps {
  customItems?: string[];
}

const DEFAULT_MARQUEE_ITEMS = [
  "₹48L/yr Legacy Cost Cut",
  "Evidence-Backed",
  "3 Fast-Track Promotions",
  "24 Engineers Led",
  "18 Verified Facts",
  "Traceable to Source",
  "VP Trajectory Alignment",
  "Zero Hallucinations",
  "You Approve Every Fact",
];

function Row({ items }: { items: string[] }) {
  return (
    <div className="flex shrink-0 items-center">
      {items.map((w, idx) => (
        <span
          key={`${w}-${idx}`}
          className="flex items-center gap-6 pr-6 text-[11px] font-black uppercase tracking-[0.24em] whitespace-nowrap"
        >
          <span>{w}</span>
          <Asterisk size={16} strokeWidth={3} className="opacity-70" />
        </span>
      ))}
    </div>
  );
}

/** Full-bleed amber ticker — brand drumbeat under the hero with dynamic proof metrics. */
export default function ValueMarquee({ customItems }: ValueMarqueeProps) {
  const items = customItems && customItems.length > 0 ? customItems : DEFAULT_MARQUEE_ITEMS;

  return (
    <div
      className="relative overflow-hidden border-y border-amber-600/40 bg-amber-500 text-brand-navy"
      aria-hidden="true"
    >
      <div className="value-marquee-track flex w-max py-2.5">
        <Row items={items} />
        <Row items={items} />
      </div>
    </div>
  );
}
