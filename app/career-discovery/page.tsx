"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { CDEProvider } from '@/context/CDEContext';
import { CDEWrapper } from './CDEWrapper';

export default function CareerDiscoveryPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200 relative overflow-hidden flex flex-col">
      <Navbar />

      {/* Ambient background glows */}
      <div className="absolute top-16 left-1/4 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <main className="flex-1 flex flex-col justify-center py-4">
        <CDEProvider>
          <CDEWrapper />
        </CDEProvider>
      </main>
    </div>
  );
}
