'use client';

import React, { useState, useCallback } from 'react';
import { Mosque, MosqueSearchFilters } from '@/types/mosque';
import { mosqueFinderService } from '@/lib/mosqueService';
import { useLocale } from '@/context/LocaleContext';
import MosqueSearch from '@/components/mosque/MosqueSearch';
import MosqueList from '@/components/mosque/MosqueList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Settings } from 'lucide-react';
import Link from 'next/link';

/**
 * Главная страница поиска мечетей
 */
export default function MosqueFinderPage() {
  const { t } = useLocale();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  /**
   * Поиск по текстовому запросу
   */
  const handleSearch = useCallback(async (query: string, filters?: MosqueSearchFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      // Попробуем поиск по ключевым словам из локальной базы
      const keywordResults = mosqueFinderService.searchMosquesByKeyword(query);
      
      if (keywordResults.length > 0) {
        setMosques(keywordResults);
        setSearchPerformed(true);
        return;
      }

      // Поиск по городу через API
      const cityResults = await mosqueFinderService.searchMosquesByCity(query);
      setMosques(cityResults);
      setSearchPerformed(true);
      
    } catch (err) {
      console.error('Ошибка поиска:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при поиске');
      setMosques([]);
      setSearchPerformed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Поиск по геолокации
   */
  const handleLocationSearch = useCallback(async (lat: number, lng: number, radius: number = 5000) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await mosqueFinderService.searchMosques(lat, lng, radius);
      setMosques(results);
      setSearchPerformed(true);
    } catch (err) {
      console.error('Ошибка геопоиска:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при поиске по местоположению');
      setMosques([]);
      setSearchPerformed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Построение маршрута к мечети
   */
  const handleGetDirections = useCallback((mosque: Mosque) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.location.lat},${mosque.location.lng}&destination_place_id=${mosque.place_id || ''}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  /**
   * Просмотр деталей мечети
   */
  const handleViewDetails = useCallback(async (mosque: Mosque) => {
    // В будущем можно добавить модальное окно с деталями
    console.log('Просмотр деталей мечети:', mosque);
    
    // Пока что просто открываем Google Maps
    if (mosque.place_id) {
      const url = `https://www.google.com/maps/place/?q=place_id:${mosque.place_id}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  /**
   * Очистка результатов
   */
  const clearResults = useCallback(() => {
    setMosques([]);
    setError(null);
    setSearchPerformed(false);
  }, []);

  return (
    <div className="min-h-screen transition-colors" style={{
      backgroundColor: 'var(--fixed-background)',
      color: 'var(--fixed-text)'
    }}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" style={{
                color: 'var(--fixed-text-secondary)'
              }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('mosqueFinderSection.back')}
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
              <h1 className="text-3xl font-bold" style={{ color: 'var(--fixed-text)' }}>
                {t('mosqueFinderSection.title')}
              </h1>
            </div>
          </div>
          
          <p className="max-w-2xl" style={{ color: 'var(--fixed-text-secondary)' }}>
            {t('mosqueFinderSection.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Панель поиска */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <MosqueSearch
                onSearch={handleSearch}
                onLocationSearch={handleLocationSearch}
                loading={loading}
                error={error}
              />

              {/* Статистика и информация */}
              <Card style={{
                backgroundColor: 'var(--verse-background)',
                borderColor: 'var(--color-border)',
                color: 'var(--fixed-text)'
              }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm" style={{
                    color: 'var(--fixed-text)'
                  }}>
                    <Settings className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    {t('mosqueFinderSection.information')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--fixed-text-secondary)' }}>{t('mosqueFinderSection.mosquesFound')}</span>
                    <span className="font-medium" style={{ color: 'var(--fixed-text)' }}>{mosques.length}</span>
                  </div>
                  
                  {searchPerformed && (
                    <div className="pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearResults}
                        className="w-full"
                      >
                        {t('mosqueFinderSection.clearResults')}
                      </Button>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                    <p>{t('mosqueFinderSection.dataDisclaimer')}</p>
                    <p>{t('mosqueFinderSection.prayerTimesNote')}</p>
                    <p>{t('mosqueFinderSection.verifyInfo')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Результаты поиска */}
          <div className="lg:col-span-2">
            {!searchPerformed ? (
              <Card style={{
                backgroundColor: 'var(--verse-background)',
                borderColor: 'var(--color-border)',
                color: 'var(--fixed-text)'
              }}>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{
                    backgroundColor: 'var(--color-background-secondary)'
                  }}>
                    <MapPin className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--fixed-text)' }}>
                    {t('mosqueFinderSection.welcomeTitle')}
                  </h3>
                  <p className="max-w-md mb-6" style={{ color: 'var(--fixed-text-secondary)' }}>
                    {t('mosqueFinderSection.welcomeDescription')}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md text-sm">
                    <div className="p-3 rounded-lg" style={{
                      backgroundColor: 'var(--color-background-secondary)'
                    }}>
                      <div className="font-medium mb-1" style={{ color: 'var(--fixed-text)' }}>{t('mosqueFinderSection.searchByName')}</div>
                      <div className="text-xs" style={{ color: 'var(--fixed-text-secondary)' }}>
                        {t('mosqueFinderSection.searchByNameExample')}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg" style={{
                      backgroundColor: 'var(--color-background-secondary)'
                    }}>
                      <div className="font-medium mb-1" style={{ color: 'var(--fixed-text)' }}>{t('mosqueFinderSection.searchNearby')}</div>
                      <div className="text-xs" style={{ color: 'var(--fixed-text-secondary)' }}>
                        {t('mosqueFinderSection.searchNearbyDescription')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <MosqueList
                mosques={mosques}
                loading={loading}
                error={error}
                onGetDirections={handleGetDirections}
                onViewDetails={handleViewDetails}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}