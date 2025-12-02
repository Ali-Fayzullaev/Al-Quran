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
        {/* Кнопка для доступа к PDF книгам */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => router.push('/muallim-sani/books')}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <BookOpen className="w-5 h-5" />
            <span>📖 PDF Книги Muallim Sani</span>
          </button>
        </div>
        
        <MuallamSaniMain />
      </main>
    </div>
  );
}