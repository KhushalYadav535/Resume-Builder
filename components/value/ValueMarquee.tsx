"use client";

import React from "react";
import { Asterisk } from "lucide-react";

const words = [
  "Evidence-Backed",
  "No Single Score",
  "Traceable to Source",
  "You Approve Every Fact",
  "Multidimensional",
  "Zero Hallucinations",
];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {words.map((w) => (
        <span
          key={w}
          className="flex items-center gap-6 pr-6 text-[11px] font-black uppercase tracking-[0.24em] whitespace-nowrap"
        >
          <span>{w}</span>
          <Asterisk size={16} strokeWidth={3} className="opacity-70" />
        </span>
      ))}
    </div>
  );
}

/** Full-bleed amber ticker — brand drumbeat under the hero. */
export default function ValueMarquee() {
  return (
    <div
      className="relative overflow-hidden border-y border-amber-600/40 bg-amber-500 text-brand-navy"
      aria-hidden="true"
    >
      <div className="value-marquee-track flex w-max py-2.5">
        <Row />
        <Row />
      </div>
    </div>
  );
}
