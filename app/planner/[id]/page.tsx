'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudyPlan, DailyTask } from '../../../lib/plannerTypes';
import { plannerStore } from '../../../lib/plannerStore';
import { getAyahsRange, getSurahInfoForPlanner } from '../../../lib/api';
import { ApiVerse } from '../../../lib/api';
import { useLocale } from '../../../context/LocaleContext';
import ProgressVisualization from '../../../components/planner/ProgressVisualization';
import CalendarView from '../../../components/planner/CalendarView';
import CustomColorSettings from '../../../components/CustomColorSettings';

interface PlanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PlanDetailPage({ params }: PlanDetailPageProps) {
  const router = useRouter();
  const { locale, t } = useLocale();
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
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [readingCounter, setReadingCounter] = useState(0);

  useEffect(() => {
    loadPlanDetails();
  }, [resolvedParams.id]);

  // Закрытие dropdown при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionsDropdown) {
        setShowActionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsDropdown]);

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
      plannerStore.completeTask(plan.id, taskDate, 5, t('planDetailPage.completedFromPlanPage'));
      await loadPlanDetails(); // Обновляем данные
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleSkipTask = async (taskDate: string) => {
    if (!plan) return;
    
    try {
      plannerStore.skipTask(plan.id, taskDate, t('planDetailPage.skippedFromPlanPage'));
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
        alert(t('planDetailPage.errorUpdating'));
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      alert(t('planDetailPage.errorUpdating'));
    }
  };

  const incrementReadingCounter = () => {
    setReadingCounter(prev => prev + 1);
    
    // Добавляем анимацию
    const counterElement = document.querySelector('.reading-counter');
    if (counterElement) {
      counterElement.classList.add('counter-animate');
      setTimeout(() => {
        counterElement.classList.remove('counter-animate');
      }, 300);
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
            {t('planDetailPage.planNotFound')}
          </h2>
          <Link href="/planner" className="text-green-500 hover:underline">
            {t('planDetailPage.returnToPlanner')}
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
    <div className="min-h-screen py-8" style={{ 
      background: `linear-gradient(135deg, 
        color-mix(in srgb, var(--color-primary) 5%, var(--color-background)) 0%,
        var(--color-background) 50%,
        color-mix(in srgb, var(--color-primary) 3%, var(--color-background)) 100%)`
    }}>
      {/* Скрытый компонент для инициализации цветовых настроек */}
      <div style={{ display: 'none' }}>
        <CustomColorSettings />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок с навигацией */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/planner"
                className="flex items-center transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--color-text)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--color-text-secondary)'}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('planDetailPage.backToPlanner')}
              </Link>
            </div>
            
            {/* Кнопки действий - адаптивные */}
            <div className="flex items-center space-x-3">
              {/* Десктоп версия */}
              <div className="hidden md:flex space-x-3">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-dark)'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{t('planDetailPage.calendar')}</span>
                </button>
                
                <button
                  onClick={exportPlanData}
                  className="px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-dark)'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{t('planDetailPage.export')}</span>
                </button>
                
                <button
                  onClick={() => setShowEditForm(!showEditForm)}
                  className="px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2"
                  style={{ backgroundColor: '#f59e0b' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#d97706'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#f59e0b'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>{t('planDetailPage.edit')}</span>
                </button>
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>{t('planDetailPage.delete')}</span>
                </button>
              </div>

              {/* Мобильная версия - Dropdown */}
              <div className="md:hidden relative">
                <button
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: 'var(--color-background-secondary)', 
                    color: 'var(--color-text)' 
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-muted)'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-background-secondary)'}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {showActionsDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl z-50" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowCalendar(!showCalendar);
                          setShowActionsDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left rounded flex items-center space-x-2 transition-colors"
                        style={{ color: 'var(--color-text)' }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-muted)'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{t('planDetailPage.calendar')}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          exportPlanData();
                          setShowActionsDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left rounded flex items-center space-x-2 transition-colors"
                        style={{ color: 'var(--color-text)' }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-muted)'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{t('planDetailPage.export')}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowEditForm(!showEditForm);
                          setShowActionsDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left rounded flex items-center space-x-2 transition-colors"
                        style={{ color: 'var(--color-text)' }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-muted)'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>{t('planDetailPage.edit')}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowActionsDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left rounded flex items-center space-x-2 transition-colors text-red-600"
                        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-muted)'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>{t('planDetailPage.delete')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl p-8 shadow-xl planner-card-animated" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
            {showEditForm ? (
              /* Форма редактирования */
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center" style={{ color: 'var(--color-text)' }}>
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('planDetailPage.editPlan')}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="editTitle" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                      {t('planDetailPage.planTitle')}
                    </label>
                    <input
                      id="editTitle"
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      style={{ 
                        backgroundColor: 'var(--color-background)', 
                        borderColor: 'var(--color-border)', 
                        color: 'var(--color-text)',
                        borderWidth: '1px'
                      }}
                      placeholder="Введите название плана"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="editDescription" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                      {t('planDetailPage.planDescription')}
                    </label>
                    <textarea
                      id="editDescription"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      style={{ 
                        backgroundColor: 'var(--color-background)', 
                        borderColor: 'var(--color-border)', 
                        color: 'var(--color-text)',
                        borderWidth: '1px'
                      }}
                      placeholder="Добавьте описание плана..."
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editTitle.trim()}
                    className="px-6 py-3 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && ((e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-dark)')}
                    onMouseLeave={(e) => !e.currentTarget.disabled && ((e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('planDetailPage.saveChanges')}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditTitle(plan.title);
                      setEditDescription(plan.description || '');
                    }}
                    className="px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                    style={{ 
                      borderColor: 'var(--color-border)', 
                      borderWidth: '1px',
                      color: 'var(--color-text-secondary)' 
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-muted)'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{t('planDetailPage.cancel')}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Обычное отображение */
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    {plan.title}
                  </h1>
                  {plan.description && (
                    <p className="text-lg mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      {plan.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <span className="flex items-center">
                      <span style={{ color: 'var(--color-text-secondary)' }}>Создан:</span>
                      <span className="ml-2 font-medium" style={{ color: 'var(--color-text)' }}>
                        {new Date(plan.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </span>
                    <span className="flex items-center">
                      <span style={{ color: 'var(--color-text-secondary)' }}>Статус:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                        plan.status === 'active' ? 'bg-green-100 text-green-800' :
                        plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        plan.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {plan.status === 'active' ? t('plannerDashboard.status.active') :
                         plan.status === 'completed' ? t('plannerDashboard.status.completed') :
                         plan.status === 'paused' ? t('plannerDashboard.status.paused') : t('plannerDashboard.status.cancelled')}
                      </span>
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-[var(--color-primary)]">
                    {plan.completionPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>выполнено</div>
                </div>
              </div>
            )}

            {/* Прогресс-бар */}
            <div className="mt-6">
              <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--color-muted)' }}>
                <div 
                  className="bg-[var(--color-primary)] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${plan.completionPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                <span>{completedTasks} из {totalTasks} дней</span>
                <span>Серия: {plan.currentStreak} дней</span>
              </div>
            </div>
          </div>
        </div>

        {/* Задача на сегодня */}
        {todayTask && (
          <div className="mb-8">
            <div className=" rounded-xl p-8  shadow-xl" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">📖 {t('planDetailPage.todaysTask')}</h2>
                <div className="text-lg font-medium">
                  {new Date().toLocaleDateString('ru-RU')}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                <div className="text-xl font-semibold mb-2">
                  {t('planDetailPage.surah')} {todayTask.surahNumber}, {t('planDetailPage.verses')} {todayTask.fromAyah}-{todayTask.toAyah}
                </div>
                <div>
                  Количество аятов: {todayTask.ayahCount}
                </div>
              </div>

              {/* Арабский текст аятов */}
              {todayAyahs.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-center flex items-center justify-center">
                    <span className="mr-2">📜</span>
                    Аяты для изучения
                    <span className="ml-2">🕌</span>
                  </h3>
                  
                  <div className="space-y-6">
                    {todayAyahs.map((ayah, index) => (
                      <div key={index} className=" rounded-lg p-6 border border-white/10">
                        {/* Заголовок аята */}
                        <div className="text-center mb-4">
                          <span className="inline-flex items-center justify-center w-10 h-10 bg-white/20 text-white rounded-full font-bold">
                            {ayah.numberInSurah}
                          </span>
                          <div className="text-sm opacity-75 mt-1">
                            Аят {ayah.numberInSurah} • Джуз {ayah.juz}
                          </div>
                        </div>
                        
                        {/* Арабский текст */}
                        <div className=" rounded-lg p-6 mb-4">
                          <div className="quran-text quran-text-animated text-center  text-3xl leading-loose">
                            {ayah.text}
                          </div>
                        </div>
                        
                        {/* Разделитель */}
                        {index < todayAyahs.length - 1 && (
                          <div className="flex justify-center mt-6">
                            <div className="w-12 h-1  rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className=" text-sm opacity-75 italic">
                      🌙 "И читай Коран размеренным чтением" (Коран 73:4)
                    </p>
                  </div>
                </div>
              )}
              {/* Счетчик чтения */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">📊 Счетчик чтения</h3>
                  <div className="text-2xl font-bold reading-counter">
                    {readingCounter} {readingCounter === 1 ? 'раз' : readingCounter > 1 && readingCounter < 5 ? 'раза' : 'раз'}
                  </div>
                </div>
                  <button
                    onClick={incrementReadingCounter}
                    className="w-full text-white rounded-lg font-bold py-4 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 planner-button-animated"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-dark)'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)'}
                >
                  <span className="text-xl mr-2">📖</span>
                  +1 Прочитал
                </button>
                <p className="text-center text-blue-100 text-sm mt-3 opacity-75">
                  💡 Нажимайте каждый раз после прочтения аятов
                </p>
              </div>

              {!todayTask.completed && !todayTask.skipped && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleCompleteTask(todayTask.date)}
                    className="flex-1 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-dark)'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('planDetailPage.markCompleted')}</span>
                  </button>
                  
                  <button
                    onClick={() => handleSkipTask(todayTask.date)}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    <span>{t('planDetailPage.skip')}</span>
                  </button>
                </div>
              )}

              {todayTask.completed && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 text-center">
                  <div className="text-lg font-semibold flex items-center justify-center space-x-2">
                    <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('planDetailPage.alreadyCompleted')}</span>
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
                  <div className="text-lg font-semibold">⏭ {t('planDetailPage.skipped')}</div>
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
          <div className="rounded-xl p-6 shadow-xl planner-card-animated" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              📅 {t('planDetailPage.upcomingTasks')}
            </h3>
            <div className="space-y-4">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task, index) => (
                  <div key={index} className="rounded-lg p-4 transition-colors" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                          {new Date(task.date).toLocaleDateString('ru-RU')}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {t('planDetailPage.surah')} {task.surahNumber}, {t('planDetailPage.verses')} {task.fromAyah}-{task.toAyah} ({task.ayahCount} {t('planDetailPage.verses')})
                        </div>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(task.date).toLocaleDateString('ru-RU', { weekday: 'short' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                  <div className="text-4xl mb-4">🎉</div>
                  <p>{t('planDetailPage.allTasksCompleted')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Модальное окно подтверждения удаления */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="rounded-lg p-6 max-w-md w-full mx-4 planner-card-animated" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', borderWidth: '1px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                {t('planDetailPage.confirmDelete')}
              </h3>
              <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                {t('planDetailPage.deleteConfirmMessage')}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg transition-colors"
                  style={{ 
                    borderColor: 'var(--color-border)', 
                    borderWidth: '1px', 
                    color: 'var(--color-text)' 
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-muted)'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                >
                  {t('planDetailPage.cancel')}
                </button>
                <button
                  onClick={handleDeletePlan}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {t('planDetailPage.delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}