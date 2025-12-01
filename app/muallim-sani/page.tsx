'use client';

import React from 'react';
import MuallamSaniMain from '@/components/muallim-sani/MuallamSaniMain';

export default function MuallamSaniPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <main className="container mx-auto px-4 py-8">
        <MuallamSaniMain />
      </main>
    </div>
  );
}