'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MuallamSaniMain from '@/components/muallim-sani/MuallamSaniMain';
import { BookOpen } from 'lucide-react';

export default function MuallamSaniPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <main className="container mx-auto px-4 py-8">        
        <MuallamSaniMain />
      </main>
    </div>
  );
}