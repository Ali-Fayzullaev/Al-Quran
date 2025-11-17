/**
 * Утилиты для работы с временем намазов
 */

export const PRAYER_DESCRIPTIONS = {
  fajr: {
    ru: "Утренний намаз перед рассветом",
    en: "Dawn prayer before sunrise",
    ar: "صلاة الفجر قبل طلوع الشمس"
  },
  dhuhr: {
    ru: "Полуденный намаз после зенита солнца",
    en: "Midday prayer after sun zenith", 
    ar: "صلاة الظهر بعد زوال الشمس"
  },
  asr: {
    ru: "Послеполуденный намаз",
    en: "Afternoon prayer",
    ar: "صلاة العصر"
  },
  maghrib: {
    ru: "Вечерний намаз после заката",
    en: "Evening prayer after sunset",
    ar: "صلاة المغرب بعد غروب الشمس"
  },
  isha: {
    ru: "Ночной намаз после исчезновения зари",
    en: "Night prayer after twilight",
    ar: "صلاة العشاء بعد زوال الشفق"
  }
};

export const CALCULATION_METHOD_DESCRIPTIONS = {
  1: {
    name: "University of Islamic Sciences, Karachi",
    description: "Стандартный метод для Пакистана, Индии, Бангладеш",
    region: "Южная Азия"
  },
  2: {
    name: "Islamic Society of North America (ISNA)",
    description: "Рекомендуется для Северной Америки",
    region: "Северная Америка"
  },
  3: {
    name: "Muslim World League (MWL)",
    description: "Наиболее распространенный международный стандарт",
    region: "Международный"
  },
  4: {
    name: "Umm al-Qura, Makkah",
    description: "Официальный метод Саудовской Аравии",
    region: "Саудовская Аравия"
  },
  5: {
    name: "Egyptian General Authority of Survey",
    description: "Официальный метод Египта",
    region: "Египет"
  },
  7: {
    name: "Institute of Geophysics, University of Tehran",
    description: "Используется в Иране",
    region: "Иран"
  },
  0: {
    name: "Jafari (Shia Ithna-Ashari)",
    description: "Шиитский метод расчета",
    region: "Шиитские общины"
  }
};

/**
 * Получает рекомендуемый метод расчета для координат
 */
export function getRecommendedMethod(coordinates: { lat: number; lng: number }): {
  method: number;
  reason: string;
} {
  const { lat, lng } = coordinates;
  
  // Северная Америка
  if (lat > 25 && lat < 75 && lng > -170 && lng < -60) {
    return {
      method: 2,
      reason: "ISNA рекомендуется для Северной Америки"
    };
  }
  
  // Саудовская Аравия и ближний восток
  if (lat > 12 && lat < 42 && lng > 30 && lng < 75) {
    return {
      method: 4,
      reason: "Умм аль-Кура используется в Саудовской Аравии"
    };
  }
  
  // Пакистан, Индия, Бангладеш
  if (lat > 5 && lat < 40 && lng > 60 && lng < 100) {
    return {
      method: 1,
      reason: "Карачи стандарт для Южной Азии"
    };
  }
  
  // Иран
  if (lat > 25 && lat < 40 && lng > 44 && lng < 64) {
    return {
      method: 7,
      reason: "Тегеранский институт для Ирана"
    };
  }
  
  // Египет и северная Африка
  if (lat > 15 && lat < 35 && lng > -20 && lng < 55) {
    return {
      method: 5,
      reason: "Египетский стандарт для северной Африки"
    };
  }
  
  // По умолчанию - MWL
  return {
    method: 3,
    reason: "Международный стандарт (MWL)"
  };
}

/**
 * Форматирует координаты для отображения
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'С.Ш.' : 'Ю.Ш.';
  const lngDir = lng >= 0 ? 'В.Д.' : 'З.Д.';
  
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Получает время до следующего намаза в миллисекундах
 */
export function getTimeUntilPrayer(prayerTime: string): number {
  const now = new Date();
  const [hours, minutes] = prayerTime.split(':');
  const prayer = new Date();
  prayer.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  
  // Если время уже прошло сегодня, добавляем день
  if (prayer < now) {
    prayer.setDate(prayer.getDate() + 1);
  }
  
  return prayer.getTime() - now.getTime();
}

/**
 * Форматирует время до намаза
 */
export function formatTimeUntil(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  } else {
    return `${minutes}м`;
  }
}

/**
 * Проверяет, является ли время временем намаза (в пределах 10 минут)
 */
export function isNearPrayerTime(prayerTime: string, threshold: number = 10): boolean {
  const timeUntil = getTimeUntilPrayer(prayerTime);
  const thresholdMs = threshold * 60 * 1000; // 10 минут в миллисекундах
  
  return timeUntil <= thresholdMs && timeUntil > 0;
}

/**
 * Получает цвет для намаза в зависимости от времени
 */
export function getPrayerColor(prayerKey: string, isPassed: boolean = false): string {
  const colors = {
    fajr: isPassed ? 'from-slate-400 to-slate-500' : 'from-indigo-500 to-purple-600',
    sunrise: isPassed ? 'from-slate-400 to-slate-500' : 'from-amber-400 to-orange-500',
    dhuhr: isPassed ? 'from-slate-400 to-slate-500' : 'from-blue-500 to-cyan-600',
    asr: isPassed ? 'from-slate-400 to-slate-500' : 'from-yellow-500 to-orange-600',
    maghrib: isPassed ? 'from-slate-400 to-slate-500' : 'from-red-500 to-pink-600',
    isha: isPassed ? 'from-slate-400 to-slate-500' : 'from-purple-600 to-indigo-700'
  };
  
  return colors[prayerKey as keyof typeof colors] || 'from-gray-500 to-gray-600';
}