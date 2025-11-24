'use client';

import { StudyPlan, ProgressStats } from '../../lib/plannerTypes';
import { useLocale } from '../../context/LocaleContext';

interface ProgressVisualizationProps {
  plan?: StudyPlan;
  stats?: ProgressStats | null;
  type: 'plan' | 'overall';
}

export default function ProgressVisualization({ plan, stats, type }: ProgressVisualizationProps) {
  if (type === 'plan' && plan) {
    return <PlanProgressCard plan={plan} />;
  }
  
  if (type === 'overall' && stats) {
    return <OverallProgressCard stats={stats} />;
  }

  return null;
}

function PlanProgressCard({ plan }: { plan: StudyPlan }) {
  const { locale, t } = useLocale();
  const completedTasks = plan.tasks.filter(task => task.completed).length;
  const totalTasks = plan.tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const getStatusColor = (status: StudyPlan['status']) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'completed': return 'text-blue-500';
      case 'paused': return 'text-yellow-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: StudyPlan['status']) => {
    switch (status) {
      case 'active': return t('planner.statusActive');
      case 'completed': return t('planner.statusCompleted');
      case 'paused': return t('planner.statusPaused');
      case 'cancelled': return t('planner.statusCancelled');
      default: return t('planner.statusUnknown');
    }
  };

  return (
    <div className=" rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {plan.title}
          </h3>
          <p className="text-sm text-gray-500">
            {t('planner.createdOn')} {new Date(plan.createdAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : locale === 'uz' ? 'uz-UZ' : 'en-US')}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
          {getStatusText(plan.status)}
        </div>
      </div>

      {plan.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
      )}

      {/* Прогресс-бар */}
      <div className="mb-4">
        <div className="flex justify-between text-sm  mb-2">
          <span>{t('planner.completionProgress')}</span>
          <span>{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-[var(--color-primary)] h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{completedTasks}</div>
          <div className="text-sm text-gray-500">{t('planner.completed')}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">{plan.currentStreak}</div>
          <div className="text-sm text-gray-500">{t('planner.streak')}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-500">{totalTasks}</div>
          <div className="text-sm text-gray-500">{t('planner.totalDays')}</div>
        </div>
      </div>
    </div>
  );
}

function OverallProgressCard({ stats }: { stats: ProgressStats }) {
  const { t } = useLocale();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {t('planner.overallStatistics')}
      </h3>

      {/* Основные метрики */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-500 mb-1">{stats.activePlans}</div>
          <div className="text-sm text-gray-500">{t('planner.activePlans')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-500 mb-1">{stats.completedPlans}</div>
          <div className="text-sm text-gray-500">{t('planner.completedPlans')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-500 mb-1">{stats.totalAyahsRead}</div>
          <div className="text-sm text-gray-500">{t('planner.studiedAyahs')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-500 mb-1">{Math.round(stats.totalTimeSpent)}</div>
          <div className="text-sm text-gray-500">{t('planner.minutesStudied')}</div>
        </div>
      </div>

      {/* Серии */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.currentStreak}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">{t('planner.currentStreak')}</div>
            </div>
            <div className="text-2xl">🔥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.longestStreak}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">{t('planner.bestStreak')}</div>
            </div>
            <div className="text-2xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Среднее время */}
      {stats.averageSessionTime > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {t('planner.averageSessionTime')}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.averageSessionTime.toFixed(1)} {t('planner.minutes')}
              </div>
            </div>
            <div className="text-2xl">⏱️</div>
          </div>
        </div>
      )}
    </div>
  );
}