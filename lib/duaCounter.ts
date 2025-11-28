/**
 * Утилиты для работы со счетчиком дуа
 */

import { translations, type Locale } from './translations';

// Ключ для сохранения прогресса в localStorage
const DUA_PROGRESS_STORAGE_KEY = 'dua-progress';

// Интерфейс для состояния счетчика дуа
export interface DuaCounterState {
  duaId: string;
  currentCount: number;
  targetCount: number;
  isCompleted: boolean;
}

// Интерфейс для прогресса всей категории
export interface CategoryProgress {
  completedDuas: number;
  totalDuas: number;
  isAllCompleted: boolean;
}

/**
 * Сохранить прогресс DUA
 */
export function saveDuaProgress(duaId: string, currentCount: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const allProgress = getDuaProgress();
    allProgress[duaId] = currentCount;
    localStorage.setItem(DUA_PROGRESS_STORAGE_KEY, JSON.stringify(allProgress));
    console.log(`💾 Сохранен прогресс: ${duaId} = ${currentCount}`);
  } catch (error) {
    console.error('Ошибка при сохранении прогресса DUA:', error);
  }
}

/**
 * Загрузить прогресс DUA
 */
export function loadDuaProgress(duaId: string): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const allProgress = getDuaProgress();
    const progress = allProgress[duaId] || 0;
    console.log(`📂 Загружен прогресс: ${duaId} = ${progress}`);
    return progress;
  } catch (error) {
    console.error('Ошибка при загрузке прогресса DUA:', error);
    return 0;
  }
}

/**
 * Получить весь прогресс DUA
 */
function getDuaProgress(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  
  try {
    const saved = localStorage.getItem(DUA_PROGRESS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Ошибка при получении прогресса DUA:', error);
    return {};
  }
}

/**
 * Сбросить прогресс DUA
 */
export function resetDuaProgress(duaId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const allProgress = getDuaProgress();
    delete allProgress[duaId];
    localStorage.setItem(DUA_PROGRESS_STORAGE_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Ошибка при сбросе прогресса DUA:', error);
  }
}

/**
 * Извлекает количество повторений из поля notes
 * Поддерживает форматы: "Читать 3 раза", "Read 3x", "33 раз", "Read 33 times", "100 раз в день"
 */
export function extractCountFromNotes(notes: string | null | undefined): number {
  if (!notes) return 1;
  
  // Ищем числа в различных форматах
  const patterns = [
    /читать\s*(\d+)\s*раз/i,  // "Читать 3 раза", "читать 100 раз"
    /(\d+)\s*раз(?:\s*в\s*день)?/i, // "3 раза", "100 раз в день"
    /read\s*(\d+)x/i,         // "Read 3x", "Read 33x"
    /read\s*(\d+)\s*times?/i, // "Read 3 times", "Read 1 time"
    /(\d+)\s*times?/i,        // "3 times", "33 times"
    /(\d+)x/i                 // "3x", "33x"
  ];
  
  // Собираем все числа, которые находим
  const counts: number[] = [];
  
  for (const pattern of patterns) {
    const matches = notes.matchAll(new RegExp(pattern.source, pattern.flags + 'g'));
    for (const match of matches) {
      const count = parseInt(match[1], 10);
      if (count > 0) {
        counts.push(count);
      }
    }
  }
  
  if (counts.length > 0) {
    // Возвращаем максимальное найденное число (например, из "1 раз или 10 раз утром, 100 раз в день" возьмем 100)
    const maxCount = Math.max(...counts);
    console.log(`🎯 Извлечено количество из "${notes}": ${maxCount} (найдены: ${counts.join(', ')})`);
    return maxCount;
  }
  
  // По умолчанию возвращаем 1
  console.log(`🎯 Не найдено количество в "${notes}", используем значение по умолчанию: 1`);
  return 1;
}

/**
 * Создает уникальный ID для дуа на основе заголовка и арабского текста
 */
export function createDuaId(title: string, arabic: string): string {
  return `${title.replace(/\s+/g, '-').toLowerCase()}-${arabic.slice(0, 10)}`;
}

/**
 * Вычисляет процент выполнения
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 100;
  return Math.min(Math.round((current / target) * 100), 100);
}

/**
 * Генерирует мотивационные сообщения для завершения дуа
 */
export function getCompletionMessage(duaTitle: string, count: number, locale: Locale = 'ru'): string {
  try {
    const localeData = translations[locale] || translations.ru;
    const messages = (localeData as any)?.DuaDhikr?.completionMessages?.dua;
    
    if (!Array.isArray(messages)) {
      // Фальбэк на русские сообщения
      return `🎉 Машаллах! Вы завершили "${duaTitle}" (${count} раз)`;
    }
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    const message = messages[randomIndex];
    
    return message
      .replace('{title}', duaTitle)
      .replace('{count}', count.toString());
  } catch (error) {
    console.error('Error in getCompletionMessage:', error);
    return `🎉 Машаллах! Вы завершили "${duaTitle}" (${count} раз)`;
  }
}

/**
 * Генерирует сообщения для завершения всей категории
 */
export function getCategoryCompletionMessage(categoryName: string, totalDuas: number, locale: Locale = 'ru'): string {
  try {
    const localeData = translations[locale] || translations.ru;
    const messages = (localeData as any)?.DuaDhikr?.completionMessages?.category;
    
    if (!Array.isArray(messages)) {
      // Фальбэк на русское сообщение
      return `🎖️ Машаллах! Категория "${categoryName}" полностью завершена!`;
    }
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    const message = messages[randomIndex];
    
    return message
      .replace('{category}', categoryName)
      .replace('{total}', totalDuas.toString());
  } catch (error) {
    console.error('Error in getCategoryCompletionMessage:', error);
    return `🎖️ Машаллах! Категория "${categoryName}" полностью завершена!`;
  }
}

/**
 * Промежуточные мотивационные сообщения
 */
export function getProgressMessage(progress: number, locale: Locale = 'ru'): string | null {
  try {
    const localeData = translations[locale] || translations.ru;
    const progressMessages = (localeData as any)?.DuaDhikr?.completionMessages?.progress;
    
    if (!progressMessages || typeof progressMessages !== 'object') {
      // Фальбэк на русские сообщения
      if (progress === 25) return "💪 Четверть пути пройдена!";
      if (progress === 50) return "🌟 Половина выполнена!";
      if (progress === 75) return "🔥 Почти готово!";
      return null;
    }
    
    if (progress === 25) return progressMessages['25'] || null;
    if (progress === 50) return progressMessages['50'] || null;
    if (progress === 75) return progressMessages['75'] || null;
    return null;
  } catch (error) {
    console.error('Error in getProgressMessage:', error);
    return null;
  }
}