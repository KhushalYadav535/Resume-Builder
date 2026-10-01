"use client";

import React, { useEffect, useState } from "react";

/** Thin gold scroll-progress hairline — awwwards staple. Pure UI. */
export default function ValueScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        setP(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="h-[2px] w-full bg-transparent" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]"
        style={{ width: `${p * 100}%` }}
      />
    </div>
  );
}
