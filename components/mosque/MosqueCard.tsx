'use client';

import React from 'react';
import { Mosque } from '@/types/mosque';
import { useLocale } from '@/context/LocaleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Phone, Clock, ExternalLink, Navigation } from 'lucide-react';

interface MosqueCardProps {
  mosque: Mosque;
  onGetDirections?: (mosque: Mosque) => void;
  onViewDetails?: (mosque: Mosque) => void;
  showDistance?: boolean;
}

export default function MosqueCard({ 
  mosque, 
  onGetDirections, 
  onViewDetails,
  showDistance = true 
}: MosqueCardProps) {
  const { t } = useLocale();
  
  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    return distance < 1 
      ? `${Math.round(distance * 1000)} м` 
      : `${distance.toFixed(1)} ${t('mosque.kmAway')}`;  
  };

  const formatRating = (rating?: number): string => {
    if (!rating) return 'No rating';
    return rating.toFixed(1);
  };

  const handleCallPhone = () => {
    if (mosque.phone) {
      window.open(`tel:${mosque.phone}`, '_self');
    }
  };

  const handleOpenWebsite = () => {
    if (mosque.website) {
      window.open(mosque.website, '_blank', 'noopener,noreferrer');
    }
  };

  const isOpen = mosque.opening_hours?.open_now;

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200" style={{
      backgroundColor: 'var(--verse-background)',
      borderColor: 'var(--color-border)',
      color: 'var(--fixed-text)'
    }}>
      {/* Фотографии мечети - сетка */}
      {mosque.photos && mosque.photos.length > 0 && (
        <div className="w-full">
          {mosque.photos.length === 1 ? (
            // Одна фотография
            <div className="w-full h-48 overflow-hidden rounded-t-lg">
              <img 
                src={mosque.photos[0]} 
                alt={mosque.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : mosque.photos.length === 2 ? (
            // Две фотографии - столбцы
            <div className="flex gap-1 h-48 rounded-t-lg overflow-hidden">
              {mosque.photos.slice(0, 2).map((photo, index) => (
                <div key={index} className="flex-1 h-full">
                  <img 
                    src={photo} 
                    alt={`${mosque.name} - ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            // Три и больше фотографий - сетка
            <div className="h-48 rounded-t-lg overflow-hidden">
              <div className="flex gap-1 h-full">
                {/* Основная фотография */}
                <div className="flex-1 h-full">
                  <img 
                    src={mosque.photos[0]} 
                    alt={mosque.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                {/* Миниатюры */}
                <div className="w-24 flex flex-col gap-1">
                  {mosque.photos.slice(1, 3).map((photo, index) => (
                    <div key={index + 1} className="flex-1 relative">
                      <img 
                        src={photo} 
                        alt={`${mosque.name} - ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {/* Показываем количество остальных фото */}
                      {index === 1 && mosque.photos && mosque.photos.length > 3 && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            +{mosque.photos.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2" style={{
            color: 'var(--fixed-text)'
          }}>
            {mosque.name}
          </CardTitle>
          {showDistance && mosque.distance && (
            <Badge variant="secondary" className="ml-2 whitespace-nowrap">
              <MapPin className="w-3 h-3 mr-1" />
              {formatDistance(mosque.distance)}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-sm" style={{
          color: 'var(--fixed-text-secondary)'
        }}>
          <MapPin className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <span className="line-clamp-1">{mosque.address}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Рейтинг и статус */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {mosque.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{formatRating(mosque.rating)}</span>
                {mosque.user_ratings_total && (
                  <span className="text-sm text-muted-foreground">
                    ({mosque.user_ratings_total})
                  </span>
                )}
              </div>
            )}
          </div>
          
          {mosque.opening_hours && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span className={`text-sm font-medium ${
                isOpen ? 'text-green-600' : 'text-red-600'
              }`}>
                {isOpen ? t('mosque.openNow') : t('mosque.closed')}
              </span>
            </div>
          )}
        </div>

        {/* Время пятничного намаза */}
        {mosque.jumuah_times && mosque.jumuah_times.length > 0 && (
          <div className="text-sm">
            <span className="font-medium text-green-700">{t('mosque.hasJumuah')}:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {mosque.jumuah_times.map((time, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Услуги */}
        {mosque.services && mosque.services.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Услуги:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {mosque.services.slice(0, 3).map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
              {mosque.services.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{mosque.services.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex flex-wrap gap-2 pt-2">
          {onGetDirections && (
            <Button 
              size="sm" 
              variant="default"
              onClick={() => onGetDirections(mosque)}
              className="flex-1 min-w-0"
            >
              <Navigation className="w-4 h-4 mr-1" />
              {t('mosque.getDirections')}
            </Button>
          )}
          
          {mosque.phone && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleCallPhone}
            >
              <Phone className="w-4 h-4 mr-1" />
              {t('mosque.phone')}
            </Button>
          )}
          
          {mosque.website && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleOpenWebsite}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              {t('mosque.website')}
            </Button>
          )}
          
          {onViewDetails && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => onViewDetails(mosque)}
              className="ml-auto"
            >
              {t('mosque.viewDetails')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}