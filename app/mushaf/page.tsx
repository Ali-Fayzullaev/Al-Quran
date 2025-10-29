"use client";

import QuranBook from "@/components/mushaf/QuranBook";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function MushafPageContent() {
  const searchParams = useSearchParams();
  const initialPage = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <QuranBook initialPage={initialPage} />
    </div>
  );
}

export default function MushafPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700 font-medium">تحميل المصحف...</p>
        </div>
      </div>
    }>
      <MushafPageContent />
    </Suspense>
  );
}