'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudyPlan, DailyTask } from '../../../lib/plannerTypes';
import { plannerStore } from '../../../lib/plannerStore';
import { getAyahsRange, getSurahInfoForPlanner } from '../../../lib/api';
import { ApiVerse } from '../../../lib/api';
import ProgressVisualization from '../../../components/planner/ProgressVisualization';
import CalendarView from '../../../components/planner/CalendarView';

interface PlanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PlanDetailPage({ params }: PlanDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayTask, setTodayTask] = useState<DailyTask | null>(null);
  const [todayAyahs, setTodayAyahs] = useState<ApiVerse[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    loadPlanDetails();
  }, [resolvedParams.id]);

  const loadPlanDetails = async () => {
    try {
      setLoading(true);
      plannerStore.initialize();
      
      const planData = plannerStore.getStudyPlan(resolvedParams.id);
      if (!planData) {
        router.push('/planner');
        return;
      }

      setPlan(planData);
      setEditTitle(planData.title);
      setEditDescription(planData.description || '');

      // Получаем задачу на сегодня
      const today = new Date().toISOString().split('T')[0];
      const task = planData.tasks.find(t => t.date === today);
      setTodayTask(task || null);

      // Если есть задача на сегодня, загружаем арабский текст
      if (task && !task.completed) {
        const ayahs = await getAyahsRange(task.surahNumber.toString(), task.fromAyah.toString(), task.toAyah.toString());
        setTodayAyahs(ayahs);
      }
    } catch (error) {
      console.error('Error loading plan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskDate: string) => {
    if (!plan) return;
    
    try {
      plannerStore.completeTask(plan.id, taskDate, 5, 'Выполнено со страницы плана');
      await loadPlanDetails(); // Обновляем данные
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleSkipTask = async (taskDate: string) => {
    if (!plan) return;
    
    try {
      plannerStore.skipTask(plan.id, taskDate, 'Пропущено со страницы плана');
      await loadPlanDetails();
    } catch (error) {
      console.error('Error skipping task:', error);
    }
  };

  const handleSaveEdit = () => {
    if (!plan) return;
    
    try {
      const updatedPlan: StudyPlan = {
        ...plan,
        title: editTitle.trim(),
        description: editDescription.trim(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedResult = plannerStore.updateStudyPlan(plan.id, {
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      
      if (updatedResult) {
        setPlan(updatedResult);
        setShowEditForm(false);
      } else {
        alert('Ошибка при обновлении плана');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Ошибка при обновлении плана');
    }
  };

  const handleDeletePlan = () => {
    if (!plan) return;
    
    const success = plannerStore.deleteStudyPlan(plan.id);
    if (success) {
      router.push('/planner');
    }
  };

  const exportPlanData = () => {
    if (!plan) return;
    
    const data = {
      plan,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            План не найден
          </h2>
          <Link href="/planner" className="text-green-500 hover:underline">
            Вернуться к планировщику
          </Link>
        </div>
      </div>
    );
  }

  const completedTasks = plan.tasks.filter(task => task.completed).length;
  const totalTasks = plan.tasks.length;
  const upcomingTasks = plan.tasks
    .filter(task => !task.completed && !task.skipped && new Date(task.date) >= new Date())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок с навигацией */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/planner"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад к планировщику
              </Link>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Календарь</span>
              </button>
              
              <button
                onClick={exportPlanData}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Экспорт</span>
              </button>
              
              <button
                onClick={() => setShowEditForm(!showEditForm)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Редактировать</span>
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Удалить</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            {showEditForm ? (
              /* Форма редактирования */
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Редактировать план
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Название плана
                    </label>
                    <input
                      id="editTitle"
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Введите название плана"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Описание (необязательно)
                    </label>
                    <textarea
                      id="editDescription"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Добавьте описание плана..."
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editTitle.trim()}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Сохранить</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditTitle(plan.title);
                      setEditDescription(plan.description || '');
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Отмена</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Обычное отображение */
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.title}
                  </h1>
                  {plan.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                      {plan.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <span className="flex items-center">
                      <span className="text-gray-500">Создан:</span>
                      <span className="ml-2 font-medium">
                        {new Date(plan.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </span>
                    <span className="flex items-center">
                      <span className="text-gray-500">Статус:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                        plan.status === 'active' ? 'bg-green-100 text-green-800' :
                        plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        plan.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {plan.status === 'active' ? 'Активный' :
                         plan.status === 'completed' ? 'Завершен' :
                         plan.status === 'paused' ? 'Приостановлен' : 'Отменен'}
                      </span>
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-500">
                    {plan.completionPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">выполнено</div>
                </div>
              </div>
            )}

            {/* Прогресс-бар */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${plan.completionPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                <span>{completedTasks} из {totalTasks} дней</span>
                <span>Серия: {plan.currentStreak} дней</span>
              </div>
            </div>
          </div>
        </div>

        {/* Задача на сегодня */}
        {todayTask && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">📖 Задание на сегодня</h2>
                <div className="text-lg font-medium">
                  {new Date().toLocaleDateString('ru-RU')}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                <div className="text-xl font-semibold mb-2">
                  Сура {todayTask.surahNumber}, аяты {todayTask.fromAyah}-{todayTask.toAyah}
                </div>
                <div className="text-blue-100">
                  Количество аятов: {todayTask.ayahCount}
                </div>
              </div>

              {/* Арабский текст аятов */}
              {todayAyahs.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">📜 Аяты для изучения</h3>
                  <div className="space-y-4">
                    {todayAyahs.map((ayah, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-arabic leading-loose mb-2" dir="rtl" lang="ar">
                          {ayah.text}
                        </div>
                        <div className="text-sm text-blue-100 opacity-75">
                          Аят {ayah.numberInSurah}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!todayTask.completed && !todayTask.skipped && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleCompleteTask(todayTask.date)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Отметить как выполненное</span>
                  </button>
                  
                  <button
                    onClick={() => handleSkipTask(todayTask.date)}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    <span>Пропустить сегодня</span>
                  </button>
                </div>
              )}

              {todayTask.completed && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 text-center">
                  <div className="text-lg font-semibold flex items-center justify-center space-x-2">
                    <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Сегодняшнее задание выполнено!</span>
                  </div>
                  {todayTask.completedAt && (
                    <div className="text-sm text-green-200 mt-1">
                      Выполнено в {new Date(todayTask.completedAt).toLocaleTimeString('ru-RU')}
                    </div>
                  )}
                </div>
              )}

              {todayTask.skipped && (
                <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 text-center">
                  <div className="text-lg font-semibold">⏭ Задание пропущено</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Календарь (если включен) */}
        {showCalendar && (
          <div className="mb-8">
            <CalendarView />
          </div>
        )}

        {/* Остальной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Прогресс */}
          <div>
            <ProgressVisualization plan={plan} type="plan" />
          </div>

          {/* Ближайшие задачи */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              📅 Ближайшие задачи
            </h3>
            <div className="space-y-4">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(task.date).toLocaleDateString('ru-RU')}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Сура {task.surahNumber}, аяты {task.fromAyah}-{task.toAyah} ({task.ayahCount} аятов)
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(task.date).toLocaleDateString('ru-RU', { weekday: 'short' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🎉</div>
                  <p>Все задачи выполнены!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Модальное окно подтверждения удаления */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Удалить план?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Вы уверены, что хотите удалить план "{plan.title}"? Это действие нельзя отменить.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeletePlan}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}