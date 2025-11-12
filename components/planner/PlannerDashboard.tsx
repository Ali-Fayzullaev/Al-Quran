'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudyPlan, ProgressStats, DailyTask } from '../../lib/plannerTypes';
import { plannerStore } from '../../lib/plannerStore';
import { getAyahsRange } from '../../lib/api';
import CreatePlanForm from './CreatePlanForm';
import CalendarView from './CalendarView';
import CustomColorSettings from '../CustomColorSettings';

export default function PlannerDashboard() {
  const router = useRouter();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayTasks, setTodayTasks] = useState<DailyTask[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [todayAyahs, setTodayAyahs] = useState<{[taskId: string]: any[]}>({});
  const [readingCounter, setReadingCounter] = useState<{[taskId: string]: number}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Инициализация хранилища
      const initialized = plannerStore.initialize();
      if (!initialized) {
        console.error('Failed to initialize planner store');
        return;
      }

      // Загружаем планы и статистику
      const allPlans = plannerStore.getAllStudyPlans();
      const progressStats = plannerStore.getProgressStats();
      
      setPlans(allPlans);
      setStats(progressStats);

      // Получаем задачи на сегодня
      const today = new Date().toISOString().split('T')[0];
      const todaysTasks = allPlans
        .filter(plan => plan.status === 'active')
        .flatMap(plan => plan.tasks.filter(task => task.date === today));
      
      setTodayTasks(todaysTasks);
      
      // Загружаем арабские тексты для задач на сегодня
      await loadTodayAyahs(todaysTasks);
    } catch (error) {
      console.error('Error loading planner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayAyahs = async (tasks: DailyTask[]) => {
    const ayahsData: {[taskId: string]: any[]} = {};
    
    for (const task of tasks) {
      if (!task.completed) {
        try {
          const ayahs = await getAyahsRange(
            task.surahNumber.toString(),
            task.fromAyah.toString(), 
            task.toAyah.toString()
          );
          ayahsData[`${task.surahNumber}-${task.fromAyah}-${task.toAyah}-${task.date}`] = ayahs;
        } catch (error) {
          console.error(`Error loading ayahs for task ${task.surahNumber}:${task.fromAyah}-${task.toAyah}:`, error);
        }
      }
    }
    
    setTodayAyahs(ayahsData);
  };

  const incrementReadingCounter = (taskKey: string) => {
    setReadingCounter(prev => ({
      ...prev,
      [taskKey]: (prev[taskKey] || 0) + 1
    }));
  };

  const handleCreatePlan = () => {
    // Проверяем, есть ли профиль пользователя
    const profile = plannerStore.getUserProfile();
    if (!profile) {
      // Создаем базовый профиль
      plannerStore.createUserProfile('Пользователь', {
        language: 'ru',
        theme: 'light',
        notifications: true
      });
    }
    
    setShowCreateForm(true);
  };

  const handlePlanCreated = (planId: string) => {
    setShowCreateForm(false);
    loadData(); // Перезагружаем данные
  };

  const handleCompleteTask = async (planId: string, taskDate: string) => {
    try {
      const startTime = Date.now();
      // Здесь можно добавить время выполнения задачи
      const timeSpent = 5; // Примерное время в минутах
      
      plannerStore.completeTask(planId, taskDate, timeSpent, 'Выполнено через дашборд');
      loadData(); // Обновляем данные
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleSkipTask = async (planId: string, taskDate: string) => {
    try {
      plannerStore.skipTask(planId, taskDate, 'Пропущено пользователем');
      loadData(); // Обновляем данные
    } catch (error) {
      console.error('Error skipping task:', error);
    }
  };

  const handleExportData = () => {
    try {
      const exportData = plannerStore.exportData();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quran-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Ошибка при экспорте данных');
    }
  };

  const getMotivationalMessage = () => {
    const currentStreak = stats?.currentStreak || 0;
    
    if (currentStreak === 0) {
      return {
        title: "Добро пожаловать! 🌟",
        message: "Начните свое духовное путешествие с изучения Корана сегодня."
      };
    } else if (currentStreak < 7) {
      return {
        title: `Отличное начало! 🔥`,
        message: `У вас серия в ${currentStreak} ${currentStreak === 1 ? 'день' : 'дня'}. Продолжайте в том же духе!`
      };
    } else if (currentStreak < 30) {
      return {
        title: `Потрясающая дисциплина! ⭐`,
        message: `Серия в ${currentStreak} дней! Вы на правильном пути к формированию прочной привычки.`
      };
    } else {
      return {
        title: `Невероятное достижение! 🏆`,
        message: `${currentStreak} дней подряд! Ваша преданность изучению Корана вдохновляет.`
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-8 border-gray-200 dark:border-gray-700"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-8 border-transparent border-t-green-500 border-r-blue-500 absolute inset-0"></div>
          </div>
          <div className="mt-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              📖 Загружаем ваш планировщик...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Подготавливаем духовное путешествие</p>
          </div>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <CreatePlanForm 
        onPlanCreated={handlePlanCreated}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  const motivationalMsg = getMotivationalMessage();

  return (
    <div className="min-h-screen  py-8" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
      {/* Скрытый компонент для инициализации цветовых настроек */}
      <div style={{ display: 'none' }}>
        <CustomColorSettings />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary)] to-purple-600 bg-clip-text text-transparent mb-4">
            📖 Планировщик изучения Корана 🕌
          </h1>
          <p className="mt-2 text-base sm:text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Создавайте персональные планы изучения и отслеживайте свой духовный прогресс с мудростью и постоянством
          </p>
        </div>

        {/* Мотивационное сообщение */}
        <div className="mb-8 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary)] to-blue-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3 flex items-center">
              <span className="mr-3">🌟</span>
              {motivationalMsg.title}
            </h2>
            <p className="text-lg opacity-95">{motivationalMsg.message}</p>
          </div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full"></div>
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full"></div>
        </div>

        {plans.length === 0 ? (
          // Первый запуск - приветственная страница
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="rounded-3xl p-12 shadow-2xl" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="text-8xl mb-8">�</div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
                  Начните свое духовное путешествие
                </h2>
                <p className="text-xl mb-12 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Создайте свой первый план изучения Священного Корана и откройте дверь к мудрости, 
                  покою и духовному росту с персонализированным подходом.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="text-center">
                    <div className="text-3xl mb-3">📅</div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Планирование</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Структурированное изучение по дням</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-3">📊</div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Прогресс</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Отслеживание достижений</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-3">🏆</div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Мотивация</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Система наград и достижений</p>
                  </div>
                </div>

                <button
                  onClick={handleCreatePlan}
                  className="text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-dark)'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)'}
                >
                  ✨ Создать первый план ✨
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Левая колонка - Статистика и текущие задачи */}
            <div className="lg:col-span-2 space-y-6">
              {/* Статистика */}
              <div className="rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                <h3 className="text-2xl font-bold mb-6 flex items-center" style={{ color: 'var(--color-text)' }}>
                  <span className="mr-3">📊</span>
                  Общая статистика
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats?.activePlans || 0}</div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">Активных планов</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats?.currentStreak || 0}</div>
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Текущая серия</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats?.totalAyahsRead || 0}</div>
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Изучено аятов</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{Math.round(stats?.totalTimeSpent || 0)}</div>
                    <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Минут изучения</div>
                  </div>
                </div>
              </div>

              {/* Задачи на сегодня */}
              <div className="rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                <h3 className="text-2xl font-bold mb-6 flex items-center" style={{ color: 'var(--color-text)' }}>
                  <span className="mr-3">📖</span>
                  Задачи на сегодня
                </h3>
                {todayTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-6">🎉</div>
                    <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Отличная работа!</h4>
                    <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                      На сегодня все задачи выполнены. Отдохните или создайте новый план!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayTasks.map((task, index) => {
                      const plan = plans.find(p => p.tasks.includes(task));
                      return (
                        <div key={index} className="rounded-xl p-6 hover:shadow-lg transition-all duration-200" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="text-2xl mr-3">📚</span>
                                <div className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>{plan?.title}</div>
                              </div>
                              <div className="text-base mb-4" style={{ color: 'var(--color-primary)' }}>
                                🕌 Сура {task.surahNumber}, аяты {task.fromAyah}-{task.toAyah}
                                <span className="ml-2 px-2 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-text)' }}>
                                  {task.ayahCount} {task.ayahCount === 1 ? 'аят' : 'аятов'}
                                </span>
                              </div>
                              
                              {/* Ссылка на детальное изучение */}
                              {!task.completed && (
                                <div className="mt-2">
                                  <a 
                                    href={`/planner/${plan?.id}`}
                                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                  >
                                    <span className="mr-1">📖</span>
                                    Перейти к изучению аятов
                                    <span className="ml-1">→</span>
                                  </a>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 sm:gap-3">
                              {!task.completed && !task.skipped && (
                                <>
                                  <button
                                    onClick={() => handleCompleteTask(plan!.id, task.date)}
                                    className="px-4 sm:px-6 py-2 sm:py-3 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center text-sm sm:text-base"
                                    style={{ backgroundColor: 'var(--color-primary)' }}
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-dark)'}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)'}
                                  >
                                    <span className="mr-2">✅</span>
                                    Выполнено
                                  </button>
                                  <button
                                    onClick={() => handleSkipTask(plan!.id, task.date)}
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg sm:rounded-xl font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center text-sm sm:text-base"
                                  >
                                    <span className="mr-2">⏭️</span>
                                    Пропустить
                                  </button>
                                </>
                              )}
                              {task.completed && (
                                <div className="px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-800 dark:to-emerald-800 dark:text-green-200 rounded-xl font-semibold flex items-center justify-center">
                                  <span className="mr-2">🎉</span>
                                  Выполнено!
                                </div>
                              )}
                              {task.skipped && (
                                <div className="px-6 py-3 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 dark:from-gray-700 dark:to-slate-700 dark:text-gray-200 rounded-xl font-semibold flex items-center justify-center">
                                  <span className="mr-2">⏸️</span>
                                  Пропущено
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Активные планы */}
              <div className="rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center" style={{ color: 'var(--color-text)' }}>
                    <span className="mr-3">📋</span>
                    Активные планы
                  </h3>
                  <button
                    onClick={handleCreatePlan}
                    className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex items-center"
                  >
                    <span className="mr-2">➕</span>
                    Создать план
                  </button>
                </div>
                
                <div className="space-y-6">
                  {plans.filter(plan => plan.status === 'active').map((plan) => (
                    <Link key={plan.id} href={`/planner/${plan.id}`} className="block">
                      <div className="rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer" 
                           style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-3xl mr-3">📖</span>
                          <h4 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>{plan.title}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {plan.completionPercentage.toFixed(1)}%
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>выполнено</div>
                        </div>
                      </div>
                      
                      {plan.description && (
                        <p className="mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                          {plan.description}
                        </p>
                      )}
                      
                        <div className="mb-4">
                        <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: 'var(--color-muted)' }}>
                          <div 
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${plan.completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                          <span className="mr-2">🔥</span>
                          <span className="font-medium">Серия: {plan.currentStreak} дней</span>
                        </div>
                        <div className="flex items-center text-sm text-purple-600 dark:text-purple-400">
                          <span className="mr-2">📊</span>
                          <span className="font-medium">{plan.totalDaysCompleted}/{plan.tasks.length} дней</span>
                        </div>
                      </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Правая колонка - Дополнительная информация */}
            <div className="space-y-8">
              {/* Достижения */}
              <div className="rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                <h3 className="text-2xl font-bold mb-6 flex items-center" style={{ color: 'var(--color-text)' }}>
                  <span className="mr-3">🏆</span>
                  Достижения
                </h3>
                <div className="space-y-4">
                  {stats?.longestStreak && stats.longestStreak > 0 ? (
                    <div className="flex items-center space-x-4 rounded-xl p-4" style={{ backgroundColor: 'var(--color-muted)' }}>
                      <span className="text-4xl">🔥</span>
                      <div>
                        <div className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Самая длинная серия</div>
                        <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>{stats.longestStreak} дней подряд!</div>
                      </div>
                    </div>
                  ) : null}
                  
                  {stats?.completedPlans && stats.completedPlans > 0 ? (
                    <div className="flex items-center space-x-4 rounded-xl p-4" style={{ backgroundColor: 'var(--color-muted)' }}>
                      <span className="text-4xl">🎯</span>
                      <div>
                        <div className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Завершенные планы</div>
                        <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>{stats.completedPlans} планов завершено</div>
                      </div>
                    </div>
                  ) : null}
                  
                  {stats?.totalAyahsRead && stats.totalAyahsRead > 100 ? (
                    <div className="flex items-center space-x-4 rounded-xl p-4" style={{ backgroundColor: 'var(--color-muted)' }}>
                      <span className="text-4xl">📚</span>
                      <div>
                        <div className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Ученый читатель</div>
                        <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>Изучено {stats.totalAyahsRead} аятов</div>
                      </div>
                    </div>
                  ) : null}
                  
                  {(!stats?.longestStreak && !stats?.completedPlans && (!stats?.totalAyahsRead || stats?.totalAyahsRead <= 100)) && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🌟</div>
                      <p className="font-medium text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                        Начните изучение, чтобы получить первые достижения!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Быстрые действия */}
              <div className="rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                <h3 className="text-2xl font-bold mb-6 flex items-center" style={{ color: 'var(--color-text)' }}>
                  <span className="mr-3">⚡</span>
                  Быстрые действия
                </h3>
                <div className="space-y-4">
                  <button 
                    onClick={handleCreatePlan}
                    className="w-full px-6 py-4 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-dark)'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)'}
                  >
                    <span className="mr-3 text-xl">➕</span>
                    Новый план
                  </button>
                  
                  <button 
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <span className="mr-3 text-xl">📅</span>
                    {showCalendar ? 'Скрыть календарь' : 'Просмотр календаря'}
                  </button>
                  
                  <button 
                    onClick={handleExportData}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    Экспорт данных
                  </button>
                </div>
              </div>

              {/* Совет дня */}
              <div className="rounded-2xl p-8 shadow-xl relative overflow-hidden" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                <div className="absolute inset-0 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 flex items-center" style={{ color: 'var(--color-text)' }}>
                    <span className="mr-3">💡</span>
                    Совет дня
                  </h3>
                  <p className="text-lg leading-relaxed font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    "Лучшее время для чтения Корана - раннее утро после фаджр намаза, когда ум наиболее ясен и спокоен. 
                    В эти благословенные моменты сердце открыто для божественной мудрости."
                  </p>
                </div>
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/30 rounded-full"></div>
                <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-indigo-300/30 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Календарь (отображается при showCalendar = true) */}
        {showCalendar && (
          <div className="mt-12">
            <div className="rounded-3xl p-8 shadow-2xl" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <span className="mr-4">📅</span>
                  Календарь изучения
                </h2>
                <button 
                  onClick={() => setShowCalendar(false)}
                  className="text-2xl transition-colors p-2 rounded-full" 
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#ef4444'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--color-text-secondary)'}
                >
                  ❌
                </button>
              </div>
              <CalendarView 
                onDateSelect={(date: string) => {
                  // Можно добавить навигацию к конкретной дате
                  console.log('Selected date:', date);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}