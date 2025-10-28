'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-sm text-muted-foreground">Перенаправление...</span>
    </div>
  );
}
