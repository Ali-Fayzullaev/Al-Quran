'use client';

import { useState, useEffect } from 'react';
import { CalendarDay } from '../../lib/plannerTypes';
import { plannerStore } from '../../lib/plannerStore';
import { useLocale } from '../../context/LocaleContext';

interface CalendarViewProps {
  year?: number;
  month?: number; // 0-11
  onDateSelect?: (date: string) => void;
}

export default function CalendarView({ year, month, onDateSelect }: CalendarViewProps) {
  const { locale, t } = useLocale();
  const [currentYear, setCurrentYear] = useState(year || new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(month !== undefined ? month : new Date().getMonth());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, [currentYear, currentMonth]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const data = plannerStore.getCalendarData(currentYear, currentMonth);
      setCalendarData(data);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthNames = () => {
    switch (locale) {
      case 'en':
        return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      case 'uz':
        return ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
      default:
        return [
          t('calendarView.months.january'),
          t('calendarView.months.february'), 
          t('calendarView.months.march'),
          t('calendarView.months.april'),
          t('calendarView.months.may'),
          t('calendarView.months.june'),
          t('calendarView.months.july'),
          t('calendarView.months.august'),
          t('calendarView.months.september'),
          t('calendarView.months.october'),
          t('calendarView.months.november'),
          t('calendarView.months.december')
        ];
    }
  };

  const getWeekDays = () => {
    switch (locale) {
      case 'en':
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      case 'uz':
        return ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
      default:
        return [
          t('calendarView.weekdays.sunday'),
          t('calendarView.weekdays.monday'),
          t('calendarView.weekdays.tuesday'),
          t('calendarView.weekdays.wednesday'),
          t('calendarView.weekdays.thursday'),
          t('calendarView.weekdays.friday'),
          t('calendarView.weekdays.saturday')
        ];
    }
  };

  const monthNames = getMonthNames();
  const weekDays = getWeekDays();

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getDayStyles = (day: CalendarDay, isToday: boolean) => {
    const baseClasses = 'w-full h-full rounded-2xl border border-white/10 transition-transform duration-200 ease-out flex flex-col items-center justify-center text-sm font-semibold backdrop-blur-sm hover:-translate-y-1';
    const todayHighlight = isToday ? ' shadow-lg shadow-white/30 scale-[1.02] border-white/30' : '';

    switch (day.status) {
      case 'completed':
        return `${baseClasses} bg-emerald-500/90 text-white ${todayHighlight}`;
      case 'skipped':
        return `${baseClasses} bg-amber-500/90 text-white ${todayHighlight}`;
      case 'pending':
        return `${baseClasses} bg-rose-200/90 text-rose-900 ${todayHighlight}`;
      default:
        return `${baseClasses} bg-white/15 text-white/80 hover:bg-white/20 ${todayHighlight}`;
    }
  };

  const getDateIcon = (day: CalendarDay) => {
    if (day.status === 'completed') return '✓';
    if (day.status === 'skipped') return '⏭';
    if (day.status === 'pending') return '!';
    return '';
  };

  // Получаем первый день месяца и количество дней
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Создаем массив всех дней для отображения
  const calendarDays = [];
  
  // Пустые дни в начале
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayData = calendarData.find(d => d.date === dateStr);
    calendarDays.push(dayData || {
      date: dateStr,
      status: 'future' as const,
      tasks: []
    });
  }

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--color-background-secondary)] p-6 shadow-[0_20px_45px_rgba(15,23,42,0.25)]">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at top, color-mix(in srgb, var(--color-primary) 45%, transparent) 0%, transparent 70%)' }}></div>
        <div className="relative z-10 animate-pulse space-y-6">
          <div className="h-8 rounded-full bg-white/20"></div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-16 rounded-2xl bg-white/15"></div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/10"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = calendarDays.reduce(
    (acc, day) => {
      if (!day) return acc;
      acc[day.status] += 1;
      acc.totalTasks += day.tasks.length;
      return acc;
    },
    { completed: 0, skipped: 0, pending: 0, future: 0, totalTasks: 0 }
  );

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(15,23,42,0.25)]"
      style={{
        backgroundColor: 'var(--color-background-secondary)',
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 12%, rgba(15,23,42,0.95)) 0%, color-mix(in srgb, var(--color-primary) 6%, rgba(15,23,42,0.88)) 55%, color-mix(in srgb, var(--color-primary) 18%, rgba(15,23,42,0.92)) 100%)'
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-35" style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.45), transparent 60%)' }}></div>
      <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>

      <div className="relative z-10 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6">
          {/* Заголовок и навигация */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.25em] text-white/60">
                {t('planner.studyCalendar')}
              </span>
              <h3 className="text-3xl font-semibold leading-tight">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <span className="text-sm text-white/70">
                {t('calendarView.tasks')}: {stats.totalTasks}
              </span>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={() => navigateMonth('prev')}
                className="rounded-full border border-white/25 p-2 text-white/80 transition-all duration-200 hover:border-white hover:text-white"
                aria-label={t('calendarView.previousMonth')}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="hidden items-center gap-3 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60 backdrop-blur-sm sm:flex">
                <span>{t('planner.completed')}: {stats.completed}</span>
                <span className="h-1 w-1 rounded-full bg-white/30"></span>
                <span>{t('planner.pending')}: {stats.pending}</span>
                <span className="h-1 w-1 rounded-full bg-white/30"></span>
                <span>{t('planner.skipped')}: {stats.skipped}</span>
              </div>

              <button
                onClick={() => navigateMonth('next')}
                className="rounded-full border border-white/25 p-2 text-white/80 transition-all duration-200 hover:border-white hover:text-white"
                aria-label={t('calendarView.nextMonth')}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Карточки статистики */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-[0.3em] text-white/60">
                {t('planner.completed')}
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats.completed}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-[0.3em] text-white/60">
                {t('planner.pending')}
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats.pending}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-[0.3em] text-white/60">
                {t('planner.skipped')}
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats.skipped}</div>
            </div>
          </div>

          {/* Названия дней недели */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wider text-white/60">
            {weekDays.map((day) => (
              <div key={day} className="rounded-xl border border-white/10 bg-white/10 py-2 backdrop-blur-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Календарная сетка */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <button
                    onClick={() => onDateSelect?.(day.date)}
                    className={getDayStyles(day, day.date === todayStr)}
                    title={day.tasks.length > 0 ? `${day.tasks.length} ${t('calendarView.tasks')}` : undefined}
                  >
                    <div className="text-lg">
                      {new Date(day.date).getDate()}
                    </div>
                    {day.status !== 'future' && (
                      <div className="text-xs opacity-90">
                        {getDateIcon(day)}
                      </div>
                    )}
                    {day.tasks.length > 0 && (
                      <div className="mt-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
                        {day.tasks.length} {t('calendarView.tasks')}
                      </div>
                    )}
                    {day.ayahsRead && day.ayahsRead > 0 && (
                      <div className="text-[10px] text-white/80">{day.ayahsRead} 📖</div>
                    )}
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
            ))}
          </div>

          {/* Легенда */}
          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-emerald-400"></div>
              <span>{t('calendarView.legend.completed')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-amber-400"></div>
              <span>{t('calendarView.legend.skipped')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-rose-300"></div>
              <span>{t('calendarView.legend.pending')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border border-white/20 bg-white/10"></div>
              <span>{t('calendarView.legend.future')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}