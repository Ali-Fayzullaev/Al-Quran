// src/components/PrayerTimesDisplay.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/context/LocaleContext";
import {
  getUserLocation,
  getCityFromCoordinates,
  getPrayerTimesByCoordinates,
  getPrayerTimesByCity,
  getDefaultCalculationSettings,
  searchCities,
  getCachedPrayerTimes,
  setCachedPrayerTimes,
  type PrayerTimesSystem,
  type SearchResult
} from "@/lib/prayerTimes";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  Settings, 
  Search, 
  Loader, 
  AlertCircle,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  RefreshCw,
  Navigation,
  CheckCircle
} from "lucide-react";

interface PrayerTimesDisplayProps {
  className?: string;
}

export function PrayerTimesDisplay({ className = "" }: PrayerTimesDisplayProps) {
  const { t } = useLocale();
  const [prayerSystem, setPrayerSystem] = useState<PrayerTimesSystem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSearching, setIsSearching] = useState(false);

  // Обновляем текущее время каждую секунду для обратного отсчета
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Обновляем каждую секунду

    return () => clearInterval(interval);
  }, []);

  // Дебаунсинг для поиска
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performActualSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Автоматическое определение местоположения при загрузке
  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const loadPrayerTimes = useCallback(async (coordinates?: { lat: number; lng: number }) => {
    setLoading(true);
    setError(null);

    try {
      let coords = coordinates;
      let autoDetected = false;

      // Если координаты не переданы, определяем автоматически
      if (!coords) {
        try {
          coords = await getUserLocation();
          autoDetected = true;
        } catch (locationError) {
          // Используем координаты по умолчанию (Москва)
          coords = { lat: 55.7558, lng: 37.6176 };
          autoDetected = false;
        }
      }

      if (!coords) {
        throw new Error('Не удалось определить координаты');
      }

      // Проверяем кэш
      const cacheKey = `${coords.lat}-${coords.lng}`;
      const cached = getCachedPrayerTimes(cacheKey);
      
      if (cached) {
        setPrayerSystem(cached);
        setLoading(false);
        return;
      }

      // Получаем настройки расчета по умолчанию для региона
      const calculationSettings = getDefaultCalculationSettings(coords);
      
      // Получаем время намазов через API
      const newSystem = await getPrayerTimesByCoordinates(coords, calculationSettings.method);
      
      // Обновляем информацию об автоопределении
      newSystem.location.autoDetected = autoDetected;
      
      // Сохраняем в кэш
      setCachedPrayerTimes(cacheKey, newSystem);

      setPrayerSystem(newSystem);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке времени намазов');
    } finally {
      setLoading(false);
    }
  }, []);

  // Выполнение поиска
  const performActualSearch = useCallback(async () => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      try {
        const results = await searchCities(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.warn('Ошибка поиска:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }
  }, [searchQuery]);

  // Поиск городов
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
    }
  }, []);

  // Очистка поиска
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  // Вычисляем время до следующего намаза
  const getTimeUntilNextPrayer = useCallback(() => {
    if (!prayerSystem) return null;

    const now = new Date();
    const prayerNames = [
      { key: 'fajr', name: t('prayerTimes.prayers.fajr'), arabic: 'الفجر' },
      { key: 'dhuhr', name: t('prayerTimes.prayers.dhuhr'), arabic: 'الظهر' },
      { key: 'asr', name: t('prayerTimes.prayers.asr'), arabic: 'العصر' },
      { key: 'maghrib', name: t('prayerTimes.prayers.maghrib'), arabic: 'المغرب' },
      { key: 'isha', name: t('prayerTimes.prayers.isha'), arabic: 'العشاء' }
    ];

    // Находим следующий намаз
    for (const prayer of prayerNames) {
      const prayerTime = new Date();
      const timeString = prayerSystem.prayerTimes[prayer.key as keyof typeof prayerSystem.prayerTimes] as string;
      
      if (typeof timeString === 'string') {
        const [hours, minutes] = timeString.split(':').map(Number);
        prayerTime.setHours(hours, minutes, 0, 0);
        
        if (prayerTime > now) {
          const diffMs = prayerTime.getTime() - now.getTime();
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          
          return {
            name: prayer.name,
            arabic: prayer.arabic,
            time: timeString,
            hours,
            minutes,
            seconds,
            totalMs: diffMs
          };
        }
      }
    }

    // Если все намазы прошли, следующий - завтрашний фаджр
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = prayerSystem.prayerTimes.fajr.split(':').map(Number);
    tomorrow.setHours(hours, minutes, 0, 0);
    
    const diffMs = tomorrow.getTime() - now.getTime();
    const hoursUntil = Math.floor(diffMs / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secondsUntil = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return {
      name: t('prayerTimes.prayers.fajr'),
      arabic: 'الفجر',
      time: prayerSystem.prayerTimes.fajr,
      hours: hoursUntil,
      minutes: minutesUntil,
      seconds: secondsUntil,
      totalMs: diffMs,
      tomorrow: true
    };
  }, [prayerSystem, currentTime]);

  // Выбор города из поиска
  const selectCity = useCallback((city: SearchResult) => {
    clearSearch();
    loadPrayerTimesByCity(city.city, city.country);
  }, [clearSearch]);



  // Загрузка времени намазов по названию города
  const loadPrayerTimesByCity = useCallback(async (city: string, country: string = '') => {
    setLoading(true);
    setError(null);
    try {
      // Проверяем кэш
      const cacheKey = `${city}-${country}`;
      const cached = getCachedPrayerTimes(cacheKey);
      
      if (cached) {
        setPrayerSystem(cached);
        setLoading(false);
        return;
      }

      // Получаем время намазов через API
      const newSystem = await getPrayerTimesByCity(city, country);
      
      // Сохраняем в кэш
      setCachedPrayerTimes(cacheKey, newSystem);
      setPrayerSystem(newSystem);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке времени намазов');
    } finally {
      setLoading(false);
    }
  }, []);

  // Иконки для намазов
  const prayerIcons = {
    fajr: Moon,
    sunrise: Sunrise,
    dhuhr: Sun,
    asr: Sun,
    maghrib: Sunset,
    isha: Moon
  };

  // Цвета для намазов
  const prayerColors = {
    fajr: "from-indigo-500 to-purple-600",
    sunrise: "from-orange-400 to-pink-500",
    dhuhr: "from-yellow-400 to-orange-500",
    asr: "from-amber-500 to-orange-600",
    maghrib: "from-orange-500 to-red-500",
    isha: "from-purple-600 to-indigo-700"
  };

  const prayers = [
    { key: 'fajr', name: t('prayerTimes.prayers.fajr') },
    { key: 'sunrise', name: t('prayerTimes.prayers.sunrise') },
    { key: 'dhuhr', name: t('prayerTimes.prayers.dhuhr') },
    { key: 'asr', name: t('prayerTimes.prayers.asr') },
    { key: 'maghrib', name: t('prayerTimes.prayers.maghrib') },
    { key: 'isha', name: t('prayerTimes.prayers.isha') }
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Заголовок секции */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.4em] backdrop-blur-sm shadow-lg" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>
          <Clock className="h-5 w-5" />
          <span>{t('prayerTimes.title')}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ 
          background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          🕌 {t('prayerTimes.title')}
        </h2>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--fixed-text-secondary)" }}>
          {t('prayerTimes.subtitle')}
        </p>
      </div>

      {/* Основная карточка */}
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 relative group" style={{ backgroundColor: "var(--verse-background)", borderColor: "var(--color-border)", borderWidth: "2px", borderStyle: "solid" }}>
          {/* Градиентный фон */}
          <div className="absolute inset-0 opacity-30" style={{
            background: `linear-gradient(135deg, var(--color-primary)15, var(--color-secondary)15)`
          }}></div>
          
          <div className="relative z-10 p-8 space-y-8">
            {/* Информация о местоположении и поиск */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                {prayerSystem?.location && (
                  <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--fixed-text)" }}>
                    <MapPin className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
                    <span>
                      {prayerSystem.location.city && prayerSystem.location.country 
                        ? `${prayerSystem.location.city}, ${prayerSystem.location.country}`
                        : `${prayerSystem.location.coordinates.lat.toFixed(2)}°, ${prayerSystem.location.coordinates.lng.toFixed(2)}°`
                      }
                    </span>
                    {prayerSystem.location.autoDetected && (
                      <CheckCircle className="h-4 w-4" style={{ color: "var(--color-success)" }} />
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    {t('prayerTimes.updated')}: {prayerSystem?.lastUpdated.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => loadPrayerTimes()}
                      className="px-3 py-1 text-xs text-white rounded-lg transition-colors flex items-center gap-1"
                      style={{ 
                        backgroundColor: "var(--color-primary)",
                        borderColor: "var(--color-primary)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <Navigation className="h-3 w-3" />
                      {t('prayerTimes.gps')}
                    </Button>
                    <Button
                      onClick={() => loadPrayerTimes()}
                      className="px-3 py-1 text-xs text-white rounded-lg transition-colors flex items-center gap-1"
                      style={{ 
                        backgroundColor: "var(--color-success)",
                        borderColor: "var(--color-success)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <RefreshCw className="h-3 w-3" />
                      {t('prayerTimes.refresh')}
                    </Button>

                  </div>
                </div>
              </div>

              {/* Поиск городов */}
              <div className="relative w-full lg:w-80">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('prayerTimes.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && performActualSearch()}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={performActualSearch}
                    disabled={searchQuery.length < 2 || isSearching}
                    className="px-4 py-3 text-white rounded-xl transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      backgroundColor: searchQuery.length < 2 || isSearching ? "var(--color-border)" : "var(--color-primary)",
                      opacity: searchQuery.length < 2 || isSearching ? 0.5 : 1
                    }}
                  >
                    {isSearching ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">
                      {isSearching ? t('prayerTimes.searching') : t('prayerTimes.find')}
                    </span>
                  </Button>
                </div>
                
                {/* Результаты поиска */}
                {(searchResults.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="px-4 py-6 text-center">
                        <Loader className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-600" />
                        <div className="text-sm text-gray-500">{t('prayerTimes.searchingCities')}</div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((city, index) => (
                        <button
                          key={index}
                          onClick={() => selectCity(city)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                                {city.city}
                              </div>
                              <div className="text-sm text-gray-500">{city.country}</div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {city.coordinates.lat.toFixed(2)}°, {city.coordinates.lng.toFixed(2)}°
                            </div>
                          </div>
                        </button>
                      ))
                    ) : searchQuery.length >= 2 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="text-gray-500 mb-2">
                          {t('prayerTimes.noResults').replace('{query}', searchQuery)}
                        </div>
                        <div className="text-xs text-gray-400 mb-3">
                          {t('prayerTimes.tryEnglish')}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">{t('prayerTimes.quickTests')}</div>
                        <div className="flex flex-wrap gap-1 justify-center">
                          <button 
                            onClick={() => loadPrayerTimesByCity('Moscow', 'Russia')}
                            className="px-2 py-1 text-xs text-white rounded transition-opacity"
                            style={{ backgroundColor: "var(--color-primary)" }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            {t('prayerTimes.cities.moscow')}
                          </button>
                          <button 
                            onClick={() => loadPrayerTimesByCity('London', 'UK')}
                            className="px-2 py-1 text-xs text-white rounded transition-opacity"
                            style={{ backgroundColor: "var(--color-primary)" }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            {t('prayerTimes.cities.london')}
                          </button>
                            <button 
                              onClick={() => loadPrayerTimesByCity('Dubai', 'UAE')}
                              className="px-2 py-1 text-xs text-white rounded transition-opacity"
                              style={{ backgroundColor: "var(--color-primary)" }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            >
                              {t('prayerTimes.cities.dubai')}
                            </button>
                            <button 
                              onClick={() => loadPrayerTimesByCity('Almaty', 'Kazakhstan')}
                              className="px-2 py-1 text-xs text-white rounded transition-opacity"
                              style={{ backgroundColor: "var(--color-primary)" }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            >
                              {t('prayerTimes.cities.almaty')}
                            </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Состояние загрузки */}
            {loading && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-2xl mb-4">
                  <Loader className="w-10 h-10 text-white animate-spin" />
                </div>
                <p className="text-lg font-semibold text-gray-700">{t('prayerTimes.loading')}</p>
              </div>
            )}

            {/* Ошибка */}
            {error && (
              <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-semibold text-lg mb-4">{error}</p>
                <Button
                  onClick={() => loadPrayerTimes()}
                  variant="outline"
                  className="rounded-xl px-6 py-3"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('prayerTimes.tryAgain')}
                </Button>
              </div>
            )}

            {/* Время намазов */}
            {prayerSystem && !loading && (
              <div className="space-y-8">
                {/* Следующий намаз с живым обратным отсчетом */}
                {(() => {
                  const nextPrayer = getTimeUntilNextPrayer();
                  return (
                    <div 
                      className="text-center p-8 rounded-3xl text-white shadow-2xl"
                      style={{
                        background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`
                      }}
                    >
                      <div className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2">
                        {nextPrayer?.tomorrow ? t('prayerTimes.tomorrowPrayer') : t('prayerTimes.nextPrayer')}
                      </div>
                      <div className="text-4xl font-black mb-2">
                        {nextPrayer?.name || prayerSystem.prayerTimes.nextPrayer.name}
                      </div>
                      <div className="text-2xl font-bold mb-4">
                        {nextPrayer?.time || prayerSystem.prayerTimes.nextPrayer.time}
                      </div>
                      
                      {nextPrayer && (
                        <div className="space-y-3">
                          <div className="text-sm opacity-80 uppercase tracking-wider">
                            {t('prayerTimes.timeRemaining')}
                          </div>
                          <div className="flex justify-center items-center gap-4 text-white">
                            {/* Часы */}
                            <div className="text-center">
                              <div className="text-3xl font-black bg-white/20 rounded-xl px-4 py-2 min-w-[70px]">
                                {nextPrayer.hours.toString().padStart(2, '0')}
                              </div>
                              <div className="text-xs mt-1 opacity-80">{t('prayerTimes.hours')}</div>
                            </div>
                            
                            <div className="text-2xl font-bold opacity-60">:</div>
                            
                            {/* Минуты */}
                            <div className="text-center">
                              <div className="text-3xl font-black bg-white/20 rounded-xl px-4 py-2 min-w-[70px]">
                                {nextPrayer.minutes.toString().padStart(2, '0')}
                              </div>
                              <div className="text-xs mt-1 opacity-80">{t('prayerTimes.minutes')}</div>
                            </div>
                            
                            <div className="text-2xl font-bold opacity-60">:</div>
                            
                            {/* Секунды */}
                            <div className="text-center">
                              <div className="text-3xl font-black bg-white/20 rounded-xl px-4 py-2 min-w-[70px] transition-all duration-300">
                                {nextPrayer.seconds.toString().padStart(2, '0')}
                              </div>
                              <div className="text-xs mt-1 opacity-80">{t('prayerTimes.seconds')}</div>
                            </div>
                          </div>
                          
                          {/* Арабское название */}
                          <div className="text-lg opacity-90 font-arabic">
                            {nextPrayer.arabic}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Расписание намазов */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {prayers.map((prayer) => {
                    const Icon = prayerIcons[prayer.key as keyof typeof prayerIcons];
                    const colorClass = prayerColors[prayer.key as keyof typeof prayerColors];
                    const time = prayerSystem.prayerTimes[prayer.key as keyof typeof prayerSystem.prayerTimes] as string;
                    
                    return (
                      <div
                        key={prayer.key}
                        className={`p-6 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-bold text-lg">{prayer.name}</div>
                              <div className="text-sm opacity-90">{t(`prayerTimes.prayersEn.${prayer.key}`)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-3xl font-black text-center">
                          {time}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Информация о методе расчета */}
                <div className="text-center p-6 rounded-2xl border-2" style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--verse-background)"
                }}>
                  <div className="text-sm font-semibold mb-2" style={{ color: "var(--color-primary)" }}>
                    {t('prayerTimes.calculationMethod')}
                  </div>
                  <div className="text-lg font-bold" style={{ color: "var(--fixed-text)" }}>
                    {prayerSystem.calculationMethod.name}
                  </div>
                </div>

                {/* Кнопки управления */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => loadPrayerTimes()}
                    className="rounded-xl px-6 py-3 font-semibold text-white transition-opacity"
                    style={{ 
                      backgroundColor: "var(--color-success)",
                      borderColor: "var(--color-success)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {t('prayerTimes.refresh')}
                  </Button>
                  
                  <Button
                    onClick={() => loadPrayerTimes()}
                    className="rounded-xl px-6 py-3 font-semibold text-white transition-opacity"
                    style={{ 
                      backgroundColor: "var(--color-primary)",
                      borderColor: "var(--color-primary)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    {t('prayerTimes.detectLocation')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Информационное сообщение */}
        <div className="mt-8 text-center p-6 rounded-2xl border" style={{
          backgroundColor: "var(--verse-background)",
          borderColor: "var(--color-border)"
        }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            <span className="font-semibold" style={{ color: "var(--fixed-text)" }}>{t('prayerTimes.infoTitle')}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: "var(--fixed-text-secondary)" }}>
            <div className="flex items-start gap-2">
              <span className="text-amber-500">🌍</span>
              <span>{t('prayerTimes.infoLocation')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-500">⚙️</span>
              <span>{t('prayerTimes.infoMethod')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-500">🕐</span>
              <span>{t('prayerTimes.infoUpdates')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-500">📍</span>
              <span>{t('prayerTimes.infoSearch')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}