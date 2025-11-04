"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SurahIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем на список сур
    router.push('/surahs');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
        <p style={{ color: 'var(--fixed-text-secondary)' }}>
          Redirecting to Surahs...
        </p>
      </div>
    </div>
  );
}