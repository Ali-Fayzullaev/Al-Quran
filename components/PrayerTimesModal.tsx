"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, X, MapPin, Loader2, RefreshCw, Search } from "lucide-react";
import { 
  getPrayerTimesByCoordinates, 
  getUserLocation, 
  searchCities,
  type PrayerTimesSystem,
  type SearchResult
} from "@/lib/prayerTimes";
import Image from "next/image";

export function PrayerTimesModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [prayerSystem, setPrayerSystem] = useState<PrayerTimesSystem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Обновление времени каждую минуту
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Загрузка времен намаза при открытии модала
  useEffect(() => {
    if (isOpen && !prayerSystem && !loading) {
      loadPrayerTimes();
    }
  }, [isOpen]);

  // Поиск городов с дебаунсом
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadPrayerTimes = useCallback(async (coordinates?: { lat: number; lng: number }) => {
    setLoading(true);
    setError(null);

    try {
      let coords = coordinates;
      if (!coords) {
        try {
          coords = await getUserLocation();
        } catch (locationError) {
          coords = { lat: 41.2995, lng: 69.2401 }; // Ташкент по умолчанию
        }
      }

      const system = await getPrayerTimesByCoordinates(coords, 2); // ISNA метод
      setPrayerSystem(system);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки времени намаза');
    } finally {
      setLoading(false);
    }
  }, []);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchCities(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCity = (city: SearchResult) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
    loadPrayerTimes(city.coordinates);
  };

  // Получаем массив времен намаза для отображения
  const getPrayerTimesArray = () => {
    if (!prayerSystem) return [];
    
    const { prayerTimes: times } = prayerSystem;
    return [
      { name: "Фаджр", time: times.fajr, nameAr: "الفجر", key: "fajr" },
      { name: "Восход", time: times.sunrise, nameAr: "الشروق", key: "sunrise" },
      { name: "Зухр", time: times.dhuhr, nameAr: "الظهر", key: "dhuhr" },
      { name: "Аср", time: times.asr, nameAr: "العصر", key: "asr" },
      { name: "Магриб", time: times.maghrib, nameAr: "المغرب", key: "maghrib" },
      { name: "Иша", time: times.isha, nameAr: "العشاء", key: "isha" }
    ];
  };

  const prayerTimesArray = getPrayerTimesArray();
  const nextPrayer = prayerSystem?.prayerTimes.nextPrayer;

  return (
    <>
      {/* Кнопка */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-0 rounded-full transition-all duration-200 hover:opacity-90"
        title="Время намаза"
      >
        <Image src="/iconsPages/times.png" className="rounded-full" alt="Время намаза" width={34} height={34} />
      </button>

      {/* Модал - АБСОЛЮТНО ПО ЦЕНТРУ ЭКРАНА */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '0px',
            left: '0px',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0px',
            margin: '0px'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-background)',
              borderRadius: '12px',
              padding: '20px',
              width: '400px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              margin: '0px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закрытия */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                padding: '5px'
              }}
            >
              <X size={20} />
            </button>

            {/* Заголовок */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock style={{ color: 'var(--color-primary)' }} size={24} />
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  color: 'var(--color-text)'
                }}>
                  Время намаза
                </h2>
              </div>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="me-5"
                style={{
                  background: 'var(--color-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: 'var(--color-text)'
                }}
                title="Поиск города"
              >
                <Search size={16} />
              </button>
            </div>

            {/* Поиск городов */}
            {showSearch && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск города..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid var(--color-border)`,
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-text)',
                      fontSize: '14px'
                    }}
                  />
                  {isSearching && (
                    <div style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}>
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Результаты поиска */}
                {searchResults.length > 0 && (
                  <div style={{
                    marginTop: '8px',
                    backgroundColor: 'var(--color-muted)',
                    borderRadius: '6px',
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}>
                    {searchResults.map((city, index) => (
                      <div
                        key={index}
                        onClick={() => selectCity(city)}
                        style={{
                          padding: '10px',
                          borderBottom: index < searchResults.length - 1 ? `1px solid var(--color-border)` : 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: 'var(--color-text)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-alpha)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ fontWeight: '500' }}>{city.city}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{city.country}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Содержимое */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)', marginBottom: '15px' }} />
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                  Загрузка времени намаза...
                </p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <p style={{ color: '#ef4444', marginBottom: '15px' }}>{error}</p>
                <button
                  onClick={() => loadPrayerTimes()}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                >
                  <RefreshCw size={16} />
                  Попробовать снова
                </button>
              </div>
            ) : prayerSystem ? (
              <>
                {/* Текущее время и локация */}
                <div style={{
                  textAlign: 'center',
                  padding: '15px',
                  backgroundColor: 'var(--color-muted)',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'var(--color-primary)',
                    marginBottom: '5px'
                  }}>
                    {currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}>
                    <MapPin size={14} />
                    {prayerSystem.location.city}, {prayerSystem.location.country}
                  </div>
                </div>

                {/* Следующий намаз */}
                {nextPrayer && (
                  <div style={{
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'var(--color-primary-alpha)',
                    border: `2px solid var(--color-primary)`,
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '5px'
                    }}>
                      Следующий намаз
                    </div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: 'var(--color-text)',
                      marginBottom: '3px'
                    }}>
                      {nextPrayer.name} - {nextPrayer.time}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--color-text-secondary)'
                    }}>
                      {nextPrayer.timeUntil}
                    </div>
                  </div>
                )}

                {/* Времена намаза */}
                <div>
                  <h3 style={{
                    margin: '0 0 15px 0',
                    fontSize: '16px',
                    color: 'var(--color-text)'
                  }}>
                    Сегодняшние намазы
                  </h3>
                  
                  {prayerTimesArray.map((prayer) => {
                    const [hours, minutes] = prayer.time.split(':').map(Number);
                    const prayerMinutes = hours * 60 + minutes;
                    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
                    const isPassed = now > prayerMinutes;
                    const isCurrent = nextPrayer?.name === prayer.name && !isPassed;

                    return (
                      <div
                        key={prayer.key}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 15px',
                          backgroundColor: isCurrent ? 'var(--color-primary-alpha)' : 'var(--color-muted)',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          opacity: isPassed ? 0.6 : 1,
                          border: isCurrent ? `1px solid var(--color-primary)` : '1px solid transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: isCurrent ? 'var(--color-primary)' : isPassed ? '#9ca3af' : '#10b981'
                            }}
                          />
                          <div>
                            <div style={{ 
                              fontWeight: '500',
                              color: 'var(--color-text)',
                              fontSize: '15px'
                            }}>
                              {prayer.name}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: 'var(--color-text-secondary)',
                              marginTop: '2px'
                            }}>
                              {prayer.nameAr}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          fontWeight: 'bold',
                          color: isCurrent ? 'var(--color-primary)' : 'var(--color-text)',
                          fontSize: '16px'
                        }}>
                          {prayer.time}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Кнопки действий */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={() => loadPrayerTimes()}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: 'var(--color-muted)',
                      color: 'var(--color-text)',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Обновить
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      flex: 2,
                      padding: '12px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Закрыть
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Clock size={48} style={{ color: 'var(--color-text-secondary)', marginBottom: '15px' }} />
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                  Нажмите "Обновить" для загрузки времен намаза
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}