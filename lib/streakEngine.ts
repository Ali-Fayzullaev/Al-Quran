// Единая логика расчёта "стрика" (дней активности подряд), общая для
// journeyStore, muallamSaniStore и plannerStore. Раньше каждый стор считал
// это самостоятельно и по-своему ошибался: journeyStore сравнивал через
// toDateString() (завязано на локаль), muallamSaniStore делил миллисекунды
// без нормализации к полуночи, plannerStore считал по логу задач без
// дедупликации дня. Здесь — общие примитивы для всех трёх случаев.

/** Календарный день в виде 'YYYY-MM-DD', без привязки к времени суток. */
export type DateKey = string;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Превращает Date (или строку, полученную из Date/JSON) в локальный
 * календарный ключ дня. Не зависит от того, дошёл ли до нас исходный объект
 * как Date или как ISO-строка после persist/JSON round-trip.
 */
export function toDateKey(date: Date | string): DateKey {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Количество календарных дней между двумя ключами 'YYYY-MM-DD' (to - from).
 * Разбирает ключи вручную и строит локальную полночь для каждого — так
 * результат не зависит от того, как были сформированы сами ключи (UTC или
 * локальное время), пока оба ключа сформированы одинаково.
 */
export function daysBetweenKeys(fromKey: DateKey, toKey: DateKey): number {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  const from = new Date(fy, fm - 1, fd);
  const to = new Date(ty, tm - 1, td);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export interface StreakUpdateResult {
  streak: number;
  lastActiveDateKey: DateKey;
  /** true, если активность на сегодняшний день уже была учтена ранее в этом же вызове */
  alreadyLoggedToday: boolean;
}

/**
 * Обновляет серию дней подряд для хранилищ вида "последняя активная дата +
 * счётчик" (journeyStore, muallamSaniStore). Повторный вызов в тот же
 * календарный день — no-op; активность вчера продолжает серию; любой другой
 * разрыв сбрасывает её до 1.
 */
export function updateStreakOnActivity(
  lastActiveDate: Date | string | null,
  currentStreak: number,
  now: Date | string = new Date()
): StreakUpdateResult {
  const todayKey = toDateKey(now);
  const lastKey = lastActiveDate ? toDateKey(lastActiveDate) : null;

  if (lastKey === todayKey) {
    return { streak: currentStreak, lastActiveDateKey: todayKey, alreadyLoggedToday: true };
  }

  const gap = lastKey ? daysBetweenKeys(lastKey, todayKey) : null;
  const streak = gap === 1 ? currentStreak + 1 : 1;

  return { streak, lastActiveDateKey: todayKey, alreadyLoggedToday: false };
}
