"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, Settings, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import Image from "next/image";

interface PrayerTime {
  name: string;
  time: string;
  nameAr: string;
}

export function PrayerTimesModal() {
  const { t, locale } = useLocale();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState("Ташкент, Узбекистан");
  const [isOpen, setIsOpen] = useState(false);

  // Примерные времена намаза (в реальном проекте это должно приходить из API)
  const prayerTimes: PrayerTime[] = [
    { name: "Фаджр", nameAr: "الفجر", time: "05:45" },
    { name: "Восход", nameAr: "الشروق", time: "07:12" },
    { name: "Зухр", nameAr: "الظهر", time: "12:30" },
    { name: "Аср", nameAr: "العصر", time: "15:45" },
    { name: "Магриб", nameAr: "المغرب", time: "18:20" },
    { name: "Иша", nameAr: "العشاء", time: "19:45" }
  ];

  // Обновление времени каждую минуту
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Определяем следующий намаз
  const getNextPrayer = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    for (let i = 0; i < prayerTimes.length; i++) {
      const [hours, minutes] = prayerTimes[i].time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      
      if (now < prayerMinutes) {
        return {
          prayer: prayerTimes[i],
          timeLeft: prayerMinutes - now
        };
      }
    }
    
    // Если все намазы прошли, возвращаем первый на завтра
    const [hours, minutes] = prayerTimes[0].time.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;
    return {
      prayer: prayerTimes[0],
      timeLeft: (24 * 60) - now + prayerMinutes
    };
  };

  const nextPrayer = getNextPrayer();
  const timeLeftHours = Math.floor(nextPrayer.timeLeft / 60);
  const timeLeftMinutes = nextPrayer.timeLeft % 60;

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center space-x-2 p-0 rounded-full transition-all duration-200 hover:bg-opacity-80 group"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-text)'
          }}
          title={t("prayerTimesTitle") || "Время намаза"}
        >
          <Image src="/iconsPages/time.jpg" alt="Prayer Times" className="rounded-full" width={35} height={35} />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
            <span>{t("prayerTimesTitle") || "Время намаза"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Текущее время и местоположение */}
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--color-muted)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              {formatCurrentTime()}
            </div>
            <div className="flex items-center justify-center space-x-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
            </div>
          </div>

          {/* Следующий намаз */}
          <div className="text-center p-3 rounded-lg border-2" style={{ 
            borderColor: 'var(--color-primary)', 
            backgroundColor: 'var(--color-primary-alpha)' 
          }}>
            <div className="text-sm opacity-75 mb-1">
              {t("nextPrayer") || "Следующий намаз"}
            </div>
            <div className="font-bold text-lg">
              {nextPrayer.prayer.name} - {nextPrayer.prayer.time}
            </div>
            <div className="text-sm font-medium font-amiri" dir="rtl">
              {nextPrayer.prayer.nameAr}
            </div>
            <div className="text-xs mt-1 opacity-75">
              {timeLeftHours > 0 && `${timeLeftHours}ч `}{timeLeftMinutes}мин
            </div>
          </div>

          {/* Все времена намаза */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {t("todaysPrayerTimes") || "Время намаза на сегодня"}
            </h4>
            <div className="space-y-1">
              {prayerTimes.map((prayer, index) => {
                const [hours, minutes] = prayer.time.split(':').map(Number);
                const prayerMinutes = hours * 60 + minutes;
                const now = currentTime.getHours() * 60 + currentTime.getMinutes();
                const isPassed = now > prayerMinutes;
                const isCurrent = prayer === nextPrayer.prayer && !isPassed;

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                      isCurrent ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{
                      backgroundColor: isCurrent ? 'var(--color-primary-alpha)' : 'var(--color-muted)',
                      opacity: isPassed ? 0.6 : 1
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        isCurrent ? 'bg-primary animate-pulse' : isPassed ? 'bg-gray-400' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-sm">{prayer.name}</div>
                        <div className="text-xs font-amiri" dir="rtl">{prayer.nameAr}</div>
                      </div>
                    </div>
                    <div className={`font-bold ${isCurrent ? 'text-primary' : ''}`}>
                      {prayer.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                // Здесь можно добавить функционал настроек
                console.log("Open prayer settings");
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              {t("settings") || "Настройки"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}