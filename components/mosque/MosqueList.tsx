'use client';

import React from 'react';
import { Mosque } from '@/types/mosque';
import { useLocale } from '@/context/LocaleContext';
import MosqueCard from './MosqueCard';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, Clock } from 'lucide-react';

interface MosqueListProps {
  mosques: Mosque[];
  loading?: boolean;
  error?: string | null;
  onGetDirections?: (mosque: Mosque) => void;
  onViewDetails?: (mosque: Mosque) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

export default function MosqueList({
  mosques,
  loading = false,
  error = null,
  onGetDirections,
  onViewDetails,
  emptyStateTitle,
  emptyStateDescription
}: MosqueListProps) {
  const { t } = useLocale();
  // Loading состояние
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="w-full animate-pulse" style={{
            backgroundColor: 'var(--verse-background)',
            borderColor: 'var(--color-border)'
          }}>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-6 rounded w-48" style={{ backgroundColor: 'var(--color-background-secondary)' }}></div>
                  <div className="h-4 rounded w-64" style={{ backgroundColor: 'var(--color-background-secondary)' }}></div>
                </div>
                <div className="h-6 rounded w-16" style={{ backgroundColor: 'var(--color-background-secondary)' }}></div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <div className="h-8 bg-muted rounded w-24"></div>
                <div className="h-8 bg-muted rounded w-24"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Ошибка
  if (error) {
    return (
      <Card className="w-full" style={{
        backgroundColor: 'var(--verse-background)',
        borderColor: 'var(--color-border)'
      }}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{
            backgroundColor: '#fee2e2'
          }}>
            <Search className="w-6 h-6" style={{ color: '#dc2626' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#991b1b' }}>
            {t('mosque.searchError')}
          </h3>
          <p className="max-w-md" style={{ color: '#b91c1c' }}>
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Пустое состояние
  if (mosques.length === 0) {
    return (
      <Card className="w-full" style={{
        backgroundColor: 'var(--verse-background)',
        borderColor: 'var(--color-border)'
      }}>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{
            backgroundColor: 'var(--color-background-secondary)'
          }}>
            <MapPin className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
          </div>
          <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--fixed-text)' }}>
            {emptyStateTitle || t('mosque.noResults')}
          </h3>
          <p className="max-w-md mb-6" style={{ color: 'var(--fixed-text-secondary)' }}>
            {emptyStateDescription || t('mosque.tryDifferentSearch')}
          </p>
          
          <div className="text-sm space-y-2" style={{ color: 'var(--fixed-text-secondary)' }}>
            <div className="flex items-center justify-center gap-2">
              <Search className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span>Try searching by name or city</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span>Use location-based search</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span>Adjust search filters</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Список мечетей
  return (
    <div className="space-y-4">
      {/* Заголовок с количеством */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--fixed-text)' }}>
          {t('mosque.mosquesFound')} {mosques.length}
        </h2>
        
        {mosques.some(m => m.distance) && (
          <div className="text-sm flex items-center gap-1" style={{ color: 'var(--fixed-text-secondary)' }}>
            <MapPin className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            Sorted by distance
          </div>
        )}
      </div>

      {/* Карточки мечетей */}
      <div className="grid gap-4">
        {mosques.map((mosque) => (
          <MosqueCard
            key={mosque.id}
            mosque={mosque}
            onGetDirections={onGetDirections}
            onViewDetails={onViewDetails}
            showDistance={true}
          />
        ))}
      </div>

      {/* Инфо о лимитах */}
      {mosques.length >= 20 && (
        <Card className="w-full" style={{
          backgroundColor: 'var(--verse-background)',
          borderColor: 'var(--color-border)'
        }}>
          <CardContent className="py-4 text-center text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
            Показано первые 20 результатов. 
            Уточните поиск для более точных результатов.
          </CardContent>
        </Card>
      )}
    </div>
  );
}