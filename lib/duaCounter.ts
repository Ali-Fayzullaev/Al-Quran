/**
 * Утилиты для работы со счетчиком дуа
 */

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
 * Извлекает количество повторений из поля notes
 * Поддерживает форматы: "Читать 3 раза", "Читать 1 раз", "Читать 33 раза"
 */
export function extractCountFromNotes(notes: string | null | undefined): number {
  if (!notes) return 1;
  
  // Ищем числа в тексте заметок
  const numberMatch = notes.match(/(\d+)\s*раз/i);
  if (numberMatch) {
    return parseInt(numberMatch[1], 10);
  }
  
  // По умолчанию возвращаем 1
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
export function getCompletionMessage(duaTitle: string, count: number): string {
  const messages = [
    `🎉 Машаллах! Вы завершили "${duaTitle}" (${count} раз)`,
    `✨ Баракаллаху фикум! "${duaTitle}" прочитано ${count} раз`,
    `🌟 Альхамдулиллях! Вы успешно завершили "${duaTitle}"`,
    `💫 Отлично! "${duaTitle}" выполнено полностью (${count} раз)`,
    `🏆 Великолепно! Вы прочитали "${duaTitle}" ${count} раз`,
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Генерирует сообщения для завершения всей категории
 */
export function getCategoryCompletionMessage(categoryName: string, totalDuas: number): string {
  const messages = [
    `🎊 Субханаллах! Вы завершили все дуа в категории "${categoryName}"! (${totalDuas} дуа)`,
    `🌈 Альхамдулиллях! Все ${totalDuas} дуа из "${categoryName}" прочитаны!`,
    `🎖️ Машаллах! Категория "${categoryName}" полностью завершена!`,
    `✨ Баракаллаху фикум! Вы успешно завершили все дуа "${categoryName}"!`,
    `🏅 Поздравляем! Все ${totalDuas} дуа из "${categoryName}" выполнены!`,
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Промежуточные мотивационные сообщения
 */
export function getProgressMessage(progress: number): string | null {
  if (progress === 25) return "💪 Четверть пути пройдена!";
  if (progress === 50) return "🌟 Половина выполнена!";
  if (progress === 75) return "🔥 Почти готово!";
  return null;
}