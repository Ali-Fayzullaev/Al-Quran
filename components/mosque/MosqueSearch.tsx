'use client';

import React, { useState, useCallback } from 'react';
import { Mosque, MosqueSearchFilters } from '@/types/mosque';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MapPin, 
  Settings, 
  Star,
  Clock,
  X,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface MosqueSearchProps {
  onSearch: (query: string, filters?: MosqueSearchFilters) => Promise<void>;
  onLocationSearch: (lat: number, lng: number, radius?: number) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export default function MosqueSearch({ 
  onSearch, 
  onLocationSearch, 
  loading = false,
  error = null 
}: MosqueSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MosqueSearchFilters>({
    minRating: 0,
    hasJumuah: false,
    hasParking: false,
    wheelchairAccessible: false,
  });
  const [locationLoading, setLocationLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    await onSearch(query.trim(), filters);
  }, [query, filters, onSearch]);

  const handleLocationSearch = useCallback(async () => {
    setLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Геолокация не поддерживается');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await onLocationSearch(latitude, longitude);
          setLocationLoading(false);
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } catch (err) {
      console.error('Ошибка геолокации:', err);
      setLocationLoading(false);
    }
  }, [onLocationSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      minRating: 0,
      hasJumuah: false,
      hasParking: false,
      wheelchairAccessible: false,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className="w-full" style={{
      backgroundColor: 'var(--verse-background)',
      borderColor: 'var(--color-border)',
      color: 'var(--fixed-text)'
    }}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2" style={{
          color: 'var(--fixed-text)'
        }}>
          <Search className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          Поиск мечетей
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Основное поле поиска */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Название мечети, город..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Кнопка поиска по местоположению */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={handleLocationSearch}
            disabled={locationLoading || loading}
            className="w-full max-w-xs"
          >
            {locationLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            Найти рядом
          </Button>
        </div>

        <Separator />

        {/* Фильтры */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span className="font-medium" style={{ color: 'var(--fixed-text)' }}>Фильтры</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Очистить
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Скрыть' : 'Показать'}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg" style={{
              backgroundColor: 'var(--color-background-secondary)'
            }}>
              {/* Минимальный рейтинг */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2" style={{ color: 'var(--fixed-text)' }}>
                  <Star className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  Минимальный рейтинг
                </Label>
                <Select 
                  value={filters.minRating === 0 ? 'any' : filters.minRating.toString()}
                  onValueChange={(value: string) => 
                    setFilters(prev => ({
                      ...prev,
                      minRating: value === 'any' ? 0 : parseFloat(value)
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Любой" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">✨ Любой</SelectItem>
                    <SelectItem value="3.0">⭐ 3.0+</SelectItem>
                    <SelectItem value="3.5">⭐ 3.5+</SelectItem>
                    <SelectItem value="4.0">⭐ 4.0+</SelectItem>
                    <SelectItem value="4.5">⭐ 4.5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Пятничный намаз */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2" style={{ color: 'var(--fixed-text)' }}>
                  <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  Дополнительно
                </Label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="jumuah"
                    checked={filters.hasJumuah}
                    onCheckedChange={(checked: boolean) => 
                      setFilters(prev => ({
                        ...prev,
                        hasJumuah: checked
                      }))
                    }
                  />
                  <Label htmlFor="jumuah" className="text-sm" style={{ color: 'var(--fixed-text)' }}>
                    Пятничный намаз
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ошибка */}
        {error && (
          <div className="p-3 text-sm rounded-md" style={{
            color: '#dc2626',
            backgroundColor: 'var(--color-background-secondary)',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}