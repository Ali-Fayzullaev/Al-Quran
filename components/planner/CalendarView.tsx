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
      case "kz":
        return ["Жс", "Дс", "Сс", "Ср", "Бс", "Жм", "Сб"];
      default:
        return [
          t('createPlanForm.weekDays.sun'),
          t('createPlanForm.weekDays.mon'),
          t('createPlanForm.weekDays.tue'),
          t('createPlanForm.weekDays.wed'),
          t('createPlanForm.weekDays.thu'),
          t('createPlanForm.weekDays.fri'),
          t('createPlanForm.weekDays.sat')
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
    return 'w-full h-full rounded-2xl transition-all duration-300 ease-out flex flex-col items-center justify-center text-sm font-semibold hover:scale-105 hover:shadow-lg cursor-pointer';
  };

  const getDayStylesInline = (day: CalendarDay, isToday: boolean) => {
    const baseStyle = {
      borderWidth: '1px',
      borderColor: 'var(--color-border)',
      transition: 'all 0.3s ease',
      transform: isToday ? 'scale(1.05)' : 'scale(1)',
      boxShadow: isToday ? '0 4px 15px rgba(var(--color-primary-rgb), 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
    };

    switch (day.status) {
      case 'completed':
        return {
          ...baseStyle,
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, var(--color-background))',
          color: 'var(--color-primary)',
          borderColor: 'var(--color-primary)'
        };
      case 'skipped':
        return {
          ...baseStyle,
          backgroundColor: 'color-mix(in srgb, orange 15%, var(--color-background))',
          color: 'orange',
          borderColor: 'orange'
        };
      case 'pending':
        return {
          ...baseStyle,
          backgroundColor: 'color-mix(in srgb, #ef4444 15%, var(--color-background))',
          color: '#ef4444',
          borderColor: '#ef4444'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-secondary)',
          borderColor: 'var(--color-border)'
        };
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
      className="relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-300"
      style={{
        backgroundColor: 'var(--color-background-secondary)',
        borderColor: 'var(--color-border)',
        borderWidth: '1px',
        background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, color-mix(in srgb, var(--color-primary) 8%, var(--color-background-secondary)) 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ 
        background: 'radial-gradient(circle at top right, color-mix(in srgb, var(--color-primary) 30%, transparent), transparent 60%)' 
      }}></div>
      <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full opacity-30 blur-3xl" style={{
        backgroundColor: 'var(--color-primary)'
      }}></div>

      <div className="relative z-10 p-6 sm:p-8" style={{ color: 'var(--color-text)' }}>
        <div className="flex flex-col gap-6">
          {/* Заголовок и навигация */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--color-text-secondary)' }}>
                {t('planner.studyCalendar')}
              </span>
              <h3 className="text-3xl font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {t('calendarView.tasks')}: {stats.totalTasks}
              </span>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={() => navigateMonth('prev')}
                className="rounded-full p-2 transition-all duration-200 hover:scale-110" 
                style={{
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-background)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-background)'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }}
                aria-label={t('calendarView.previousMonth')}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="hidden items-center gap-3 rounded-full px-4 py-2 text-xs uppercase tracking-[0.3em] backdrop-blur-sm sm:flex" style={{
                borderColor: 'var(--color-border)',
                borderWidth: '1px',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-secondary)'
              }}>
                <span>{t('planner.completed')}: {stats.completed}</span>
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}></span>
                <span>{t('planner.pending')}: {stats.pending}</span>
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}></span>
                <span>{t('planner.skipped')}: {stats.skipped}</span>
              </div>

              <button
                onClick={() => navigateMonth('next')}
                className="rounded-full p-2 transition-all duration-200 hover:scale-110"
                style={{
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-background)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-background)'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }}
                aria-label={t('calendarView.nextMonth')}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Карточки статистики */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="group rounded-2xl p-4 backdrop-blur-sm transition-all duration-200 hover:scale-105" style={{
              borderColor: 'var(--color-border)',
              borderWidth: '1px',
              backgroundColor: 'color-mix(in srgb, var(--color-background) 90%, var(--color-primary) 10%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center gap-2">
                <div className="text-2xl">✅</div>
                <div>
                  <div className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--color-text-secondary)' }}>
                    {t('planner.completed')}
                  </div>
                  <div className="mt-1 text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{stats.completed}</div>
                </div>
              </div>
            </div>
            <div className="group rounded-2xl p-4 backdrop-blur-sm transition-all duration-200 hover:scale-105" style={{
              borderColor: 'var(--color-border)',
              borderWidth: '1px',
              backgroundColor: 'color-mix(in srgb, var(--color-background) 90%, orange 10%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center gap-2">
                <div className="text-2xl">⏳</div>
                <div>
                  <div className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--color-text-secondary)' }}>
                    {t('planner.pending')}
                  </div>
                  <div className="mt-1 text-2xl font-bold" style={{ color: 'orange' }}>{stats.pending}</div>
                </div>
              </div>
            </div>
            <div className="group rounded-2xl p-4 backdrop-blur-sm transition-all duration-200 hover:scale-105" style={{
              borderColor: 'var(--color-border)',
              borderWidth: '1px',
              backgroundColor: 'color-mix(in srgb, var(--color-background) 90%, #ef4444 10%)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex items-center gap-2">
                <div className="text-2xl">⏭️</div>
                <div>
                  <div className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--color-text-secondary)' }}>
                    {t('planner.skipped')}
                  </div>
                  <div className="mt-1 text-2xl font-bold" style={{ color: '#ef4444' }}>{stats.skipped}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Названия дней недели */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wider">
            {weekDays.map((day, index) => (
              <div key={day} className="rounded-xl py-3 backdrop-blur-sm transition-all duration-200" style={{
                borderColor: 'var(--color-border)',
                borderWidth: '1px',
                backgroundColor: index === 6 || index === 0 ? 'color-mix(in srgb, var(--color-primary) 20%, var(--color-background))' : 'var(--color-background)',
                color: index === 6 || index === 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)'
              }}>
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
                    style={getDayStylesInline(day, day.date === todayStr)}
                    title={day.tasks.length > 0 ? `${day.tasks.length} ${t('calendarView.tasks')}` : undefined}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.08)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = day.date === todayStr ? 'scale(1.05)' : 'scale(1)';
                      e.currentTarget.style.boxShadow = day.date === todayStr ? '0 4px 15px rgba(var(--color-primary-rgb), 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <div className="text-lg font-bold">
                      {new Date(day.date).getDate()}
                    </div>
                    {day.status !== 'future' && (
                      <div className="text-xs opacity-90 mt-1">
                        {getDateIcon(day)}
                      </div>
                    )}
                    {day.tasks.length > 0 && (
                      <div className="mt-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                        color: 'var(--color-primary)'
                      }}>
                        {day.tasks.length}
                      </div>
                    )}
                    {day.ayahsRead && day.ayahsRead > 0 && (
                      <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {day.ayahsRead} 📖
                      </div>
                    )}
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
            ))}
          </div>

          {/* Легенда */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-3 rounded-lg p-2 backdrop-blur-sm" style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px'
            }}>
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
              <span style={{ color: 'var(--color-text)' }}>{t('calendarView.legend.completed')}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg p-2 backdrop-blur-sm" style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px'
            }}>
              <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
              <span style={{ color: 'var(--color-text)' }}>{t('calendarView.legend.skipped')}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg p-2 backdrop-blur-sm" style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px'
            }}>
              <div className="h-4 w-4 rounded-full bg-red-500"></div>
              <span style={{ color: 'var(--color-text)' }}>{t('calendarView.legend.pending')}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg p-2 backdrop-blur-sm" style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px'
            }}>
              <div className="h-4 w-4 rounded-full" style={{ 
                backgroundColor: 'var(--color-background-secondary)',
                borderColor: 'var(--color-border)',
                borderWidth: '2px'
              }}></div>
              <span style={{ color: 'var(--color-text)' }}>{t('calendarView.legend.future')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}