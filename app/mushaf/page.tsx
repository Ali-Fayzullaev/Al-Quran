"use client";

import dynamic from 'next/dynamic';

// Lazy loading мусхафа для быстрой загрузки страницы  
const QuranBook = dynamic(() => import("@/components/mushaf/QuranBook"), {
  loading: () => (
    <div className="min-h-screen mushaf-container theme-light flex items-center justify-center"
         style={{ 
           backgroundColor: '#ffffff',
           background: '#ffffff',
           color: '#1a202c'
         }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
             style={{ borderColor: '#3182ce' }}></div>
        <p className="font-medium" style={{ color: '#1a202c' }}>تحميل المصحف...</p>
      </div>
    </div>
  ),
  ssr: false
});
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useQuranStore } from '@/lib/store';
import { useColorTheme } from '@/lib/useColorTheme';

function MushafPageContent() {
  const searchParams = useSearchParams();
  const initialPage = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const { theme } = useTheme();
  const { siteColorTheme } = useQuranStore();
  const { applyCurrentColors } = useColorTheme();

  // Применяем текущие цвета темы при загрузке страницы
  useEffect(() => {
    const timeout = setTimeout(() => {
      applyCurrentColors();
    }, 100);
    return () => clearTimeout(timeout);
  }, [theme, siteColorTheme, applyCurrentColors]);

  return (
    <div className="min-h-screen mushaf-container" 
         style={{ 
           backgroundColor: 'var(--mushaf-bg)',
           background: 'var(--mushaf-bg)'
         }}>
      <QuranBook initialPage={initialPage} />
    </div>
  );
}

export default function MushafPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen mushaf-container theme-light flex items-center justify-center"
           style={{ 
             backgroundColor: '#ffffff',
             background: '#ffffff',
             color: '#1a202c'
           }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
               style={{ borderColor: '#3182ce' }}></div>
          <p className="font-medium" style={{ color: '#1a202c' }}>تحميل المصحف...</p>
        </div>
      </div>
    }>
      <MushafPageContent />
    </Suspense>
  );
}