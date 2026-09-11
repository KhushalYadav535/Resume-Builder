import React from 'react';
import { CDEProvider } from '@/context/CDEContext';
import { CDEWrapper } from './CDEWrapper';

export default function CareerDiscoveryPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-blue-200 dark:selection:bg-blue-900">
      <CDEProvider>
        <CDEWrapper />
      </CDEProvider>
    </div>
  );
}
