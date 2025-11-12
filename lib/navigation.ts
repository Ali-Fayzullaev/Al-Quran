'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

// Хук для программной навигации с правильным кешем
export const useAppRouter = () => {
  const router = useRouter();
  
  const navigate = useCallback((url: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  }, [router]);
  
  const back = useCallback(() => {
    router.back();
  }, [router]);
  
  const forward = useCallback(() => {
    router.forward();
  }, [router]);
  
  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);
  
  return { navigate, back, forward, refresh, router };
};

// Утилита для предзагрузки страниц (используйте внутри компонентов)
export const usePrefetch = () => {
  const router = useRouter();
  
  const prefetchPage = useCallback((url: string) => {
    router.prefetch(url);
  }, [router]);
  
  return { prefetchPage };
};