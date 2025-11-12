'use client';

import { useState, useEffect } from 'react';
import { CalendarDay } from '../../lib/plannerTypes';
import { plannerStore } from '../../lib/plannerStore';

interface CalendarViewProps {
  year?: number;
  month?: number; // 0-11
  onDateSelect?: (date: string) => void;
}

export default function CalendarView({ year, month, onDateSelect }: CalendarViewProps) {
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

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

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

  const getDateStatus = (day: CalendarDay) => {
    if (day.status === 'completed') return 'bg-green-500 text-white';
    if (day.status === 'skipped') return 'bg-yellow-500 text-white';
    if (day.status === 'pending') return 'bg-red-200 text-red-800';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      {/* Заголовок с навигацией */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Предыдущий месяц"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Следующий месяц"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Заголовки дней недели */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
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
                className={`w-full h-full rounded-lg border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex flex-col items-center justify-center text-sm ${getDateStatus(day)}`}
                title={day.tasks.length > 0 ? `${day.tasks.length} задач` : undefined}
              >
                <div className="font-medium">
                  {new Date(day.date).getDate()}
                </div>
                {day.status !== 'future' && (
                  <div className="text-xs mt-1">
                    {getDateIcon(day)}
                  </div>
                )}
                {day.ayahsRead && day.ayahsRead > 0 && (
                  <div className="text-xs opacity-75">
                    {day.ayahsRead}
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
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Выполнено</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Пропущено</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-200 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Не выполнено</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Будущее</span>
        </div>
      </div>
    </div>
  );
}