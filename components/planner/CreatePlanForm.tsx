// components/planner/CreatePlanForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  StudyGoal, 
  StudySchedule, 
  DEFAULT_AYAHS_PER_DAY, 
  DEFAULT_DAYS_PER_WEEK,
  MAX_AYAHS_PER_DAY,
  MIN_AYAHS_PER_DAY,
  MAX_DAYS_PER_WEEK,
  MIN_DAYS_PER_WEEK
} from '../../lib/plannerTypes';
import { 
  getAllSurahsForPlanner, 
  countAyahsInSurahs,
  getRecommendedSurahsForBeginners,
  getEstimatedReadingTime,
  getSurahDifficulty
} from '../../lib/api';
import { plannerStore } from '../../lib/plannerStore';
import { ApiSurah } from '../../lib/api';
import CustomColorSettings from '../CustomColorSettings';

interface CreatePlanFormProps {
  onPlanCreated: (planId: string) => void;
  onCancel: () => void;
}

export default function CreatePlanForm({ onPlanCreated, onCancel }: CreatePlanFormProps) {
  // Состояние формы
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<StudyGoal>({
    type: 'surah',
    surahs: []
  });
  const [schedule, setSchedule] = useState<StudySchedule>({
    ayahsPerDay: DEFAULT_AYAHS_PER_DAY,
    daysPerWeek: DEFAULT_DAYS_PER_WEEK,
    activeDays: [1, 2, 3, 4, 5], // Понедельник-Пятница
    startDate: new Date().toISOString().split('T')[0],
    estimatedEndDate: ''
  });

  // Данные
  const [surahs, setSurahs] = useState<ApiSurah[]>([]);
  const [loading, setLoading] = useState(false);
  const [estimatedDays, setEstimatedDays] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [totalAyahs, setTotalAyahs] = useState(0);

  // Загрузка сур при монтировании
  useEffect(() => {
    const loadSurahs = async () => {
      try {
        const surahsData = await getAllSurahsForPlanner();
        setSurahs(surahsData);
      } catch (error) {
        console.error('Error loading surahs:', error);
      }
    };
    
    loadSurahs();
  }, []);

  // Пересчет при изменении цели или расписания
  useEffect(() => {
    const calculateEstimates = async () => {
      if (goal.surahs && goal.surahs.length > 0) {
        const ayahCount = await countAyahsInSurahs(goal.surahs);
        setTotalAyahs(ayahCount);
        
        const days = Math.ceil(ayahCount / schedule.ayahsPerDay);
        const weeks = Math.ceil(days / schedule.daysPerWeek);
        setEstimatedDays(days);
        
        const time = getEstimatedReadingTime(ayahCount);
        setEstimatedTime(time);

        // Обновляем дату окончания
        const startDate = new Date(schedule.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (weeks * 7));
        setSchedule(prev => ({
          ...prev,
          estimatedEndDate: endDate.toISOString().split('T')[0]
        }));
      }
    };

    calculateEstimates();
  }, [goal, schedule.ayahsPerDay, schedule.daysPerWeek, schedule.startDate]);

  const handleGoalTypeChange = (type: StudyGoal['type']) => {
    setGoal(prev => ({
      type,
      surahs: type === 'surah' || type === 'multiple_surahs' ? [] : prev.surahs,
      juzs: type === 'juz' ? [] : prev.juzs
    }));
  };

  const handleSurahSelection = (surahNumber: number) => {
    const currentSurahs = goal.surahs || [];
    
    if (goal.type === 'surah') {
      // Для одной суры - заменяем выбор
      setGoal(prev => ({ ...prev, surahs: [surahNumber] }));
    } else if (goal.type === 'multiple_surahs') {
      // Для множественных сур - добавляем/удаляем
      const isSelected = currentSurahs.includes(surahNumber);
      const newSurahs = isSelected 
        ? currentSurahs.filter(s => s !== surahNumber)
        : [...currentSurahs, surahNumber].sort((a, b) => a - b);
      
      setGoal(prev => ({ ...prev, surahs: newSurahs }));
    }
  };

  const handleQuickStart = (type: 'beginner' | 'short' | 'medium') => {
    const recommended = getRecommendedSurahsForBeginners();
    
    switch (type) {
      case 'beginner':
        setGoal({
          type: 'multiple_surahs',
          surahs: recommended.slice(0, 5)
        });
        setTitle('План для начинающих');
        setDescription('Изучение коротких сур для начинающих');
        break;
      case 'short':
        setGoal({
          type: 'multiple_surahs', 
          surahs: recommended.slice(0, 10)
        });
        setTitle('Короткий план изучения');
        setDescription('Изучение популярных коротких сур');
        break;
      case 'medium':
        setGoal({
          type: 'surah',
          surahs: [2] // Аль-Бакара
        });
        setTitle('Изучение суры Аль-Бакара');
        setDescription('Систематическое изучение самой длинной суры');
        break;
    }
    setStep(2);
  };

  const handleActiveDaysChange = (day: number) => {
    const newActiveDays = schedule.activeDays.includes(day)
      ? schedule.activeDays.filter(d => d !== day)
      : [...schedule.activeDays, day].sort();
    
    if (newActiveDays.length >= 1) {
      setSchedule(prev => ({
        ...prev,
        activeDays: newActiveDays,
        daysPerWeek: newActiveDays.length
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const plan = plannerStore.createStudyPlan(title, goal, schedule, description);
      onPlanCreated(plan.id);
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Ошибка при создании плана. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const weekDays = [
    { id: 0, name: 'Воскресенье', short: 'Вс' },
    { id: 1, name: 'Понедельник', short: 'Пн' },
    { id: 2, name: 'Вторник', short: 'Вт' },
    { id: 3, name: 'Среда', short: 'Ср' },
    { id: 4, name: 'Четверг', short: 'Чт' },
    { id: 5, name: 'Пятница', short: 'Пт' },
    { id: 6, name: 'Суббота', short: 'Сб' }
  ];

  const isValidPlan = title.trim() && 
    ((goal.surahs && goal.surahs.length > 0) || (goal.juzs && goal.juzs.length > 0)) &&
    schedule.ayahsPerDay >= MIN_AYAHS_PER_DAY &&
    schedule.activeDays.length >= 1;

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Скрытый компонент для инициализации цветовых настроек */}
      <div style={{ display: 'none' }}>
        <CustomColorSettings />
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Создать план изучения Корана
        </h2>
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                   style={{ 
                     backgroundColor: step >= stepNum ? 'var(--color-primary)' : 'var(--color-muted)',
                     color: step >= stepNum ? 'white' : 'var(--color-text-secondary)'
                   }}>
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div className="w-12 h-0.5" style={{ 
                  backgroundColor: step > stepNum ? 'var(--color-primary)' : 'var(--color-muted)'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Шаг 1: Быстрый старт или выбор типа цели */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Выберите способ создания плана</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => handleQuickStart('beginner')}
                className="p-4 border-2 border-dashed rounded-lg transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.borderColor = 'var(--color-primary)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.borderColor = 'var(--color-border)'}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🌱</div>
                  <h4 className="font-semibold" style={{ color: 'var(--color-text)' }}>Для начинающих</h4>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>5 коротких сур</p>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickStart('short')}
                className="p-4 border-2 border-dashed rounded-lg transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.borderColor = 'var(--color-primary)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.borderColor = 'var(--color-border)'}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="font-semibold" style={{ color: 'var(--color-text)' }}>Быстрый план</h4>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>10 популярных сур</p>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickStart('medium')}
                className="p-4 border-2 border-dashed rounded-lg transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.borderColor = 'var(--color-primary)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.borderColor = 'var(--color-border)'}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📖</div>
                  <h4 className="font-semibold" style={{ color: 'var(--color-text)' }}>Средний план</h4>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Сура Аль-Бакара</p>
                </div>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--color-primary)' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-dark)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)'}
              >
                Создать индивидуальный план
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Шаг 2: Основная информация и цель */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Основная информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Название плана *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    borderWidth: '1px'
                  }}
                  placeholder="Мой план изучения Корана"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Описание (опционально)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    borderWidth: '1px'
                  }}
                  placeholder="Краткое описание плана"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Цель изучения</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <button
                onClick={() => handleGoalTypeChange('surah')}
                className="p-3 rounded-lg border-2 transition-colors"
                style={{
                  borderColor: goal.type === 'surah' ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: goal.type === 'surah' ? 'var(--color-muted)' : 'transparent'
                }}
              >
                <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Одна сура</div>
              </button>
              
              <button
                onClick={() => handleGoalTypeChange('multiple_surahs')}
                className="p-3 rounded-lg border-2 transition-colors"
                style={{
                  borderColor: goal.type === 'multiple_surahs' ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: goal.type === 'multiple_surahs' ? 'var(--color-muted)' : 'transparent'
                }}
              >
                <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Несколько сур</div>
              </button>
              
              <button
                onClick={() => handleGoalTypeChange('juz')}
                className="p-3 rounded-lg border-2 transition-colors"
                style={{
                  borderColor: goal.type === 'juz' ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: goal.type === 'juz' ? 'var(--color-muted)' : 'transparent'
                }}
              >
                <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Джуз</div>
              </button>
              
              <button
                onClick={() => handleGoalTypeChange('complete_quran')}
                className="p-3 rounded-lg border-2 transition-colors"
                style={{
                  borderColor: goal.type === 'complete_quran' ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: goal.type === 'complete_quran' ? 'var(--color-muted)' : 'transparent'
                }}
              >
                <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Весь Коран</div>
              </button>
            </div>

            {/* Выбор сур */}
            {(goal.type === 'surah' || goal.type === 'multiple_surahs') && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Выберите {goal.type === 'surah' ? 'суру' : 'суры'} *
                </label>
                <div className="max-h-60 overflow-y-auto rounded-lg p-3" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {surahs.map((surah) => {
                      const isSelected = goal.surahs?.includes(surah.number) || false;
                      const difficulty = getSurahDifficulty(surah.numberOfAyahs);
                      
                      return (
                        <button
                          key={surah.number}
                          onClick={() => handleSurahSelection(surah.number)}
                          className="p-2 text-left rounded transition-colors"
                          style={{
                            borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                            backgroundColor: isSelected ? 'var(--color-muted)' : 'transparent',
                            borderWidth: '1px'
                          }}
                          onMouseEnter={(e) => !isSelected && ((e.target as HTMLElement).style.borderColor = 'var(--color-text-secondary)')}
                          onMouseLeave={(e) => !isSelected && ((e.target as HTMLElement).style.borderColor = 'var(--color-border)')}
                        >
                          <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                            {surah.number}. {surah.englishName}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {surah.numberOfAyahs} аятов • {difficulty === 'easy' ? '🟢' : difficulty === 'medium' ? '🟡' : '🔴'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {goal.surahs && goal.surahs.length > 0 && (
                  <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--color-text)' }}>
                      <strong>Выбрано:</strong> {goal.surahs.length} {goal.surahs.length === 1 ? 'сура' : 'сур'}
                      {totalAyahs > 0 && (
                        <span className="ml-2">• {totalAyahs} аятов • ~{estimatedTime} мин чтения</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 rounded-lg transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                borderWidth: '1px',
                color: 'var(--color-text)'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-muted)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              Назад
            </button>
            
            <button
              onClick={() => setStep(3)}
              disabled={!goal.surahs?.length && goal.type !== 'complete_quran'}
              className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onMouseEnter={(e) => !e.currentTarget.disabled && ((e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-dark)')}
              onMouseLeave={(e) => !e.currentTarget.disabled && ((e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)')}
            >
              Далее
            </button>
          </div>
        </div>
      )}

      {/* Шаг 3: Расписание */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Настройка расписания</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Аятов в день: {schedule.ayahsPerDay}
                </label>
                <input
                  type="range"
                  min={MIN_AYAHS_PER_DAY}
                  max={MAX_AYAHS_PER_DAY}
                  value={schedule.ayahsPerDay}
                  onChange={(e) => setSchedule(prev => ({
                    ...prev, 
                    ayahsPerDay: Number(e.target.value)
                  }))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ backgroundColor: 'var(--color-muted)' }}
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>{MIN_AYAHS_PER_DAY}</span>
                  <span>{MAX_AYAHS_PER_DAY}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Дата начала</label>
                <input
                  type="date"
                  value={schedule.startDate}
                  onChange={(e) => setSchedule(prev => ({
                    ...prev, 
                    startDate: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Активные дни недели</label>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => handleActiveDaysChange(day.id)}
                    className={`p-2 text-center rounded-lg border-2 transition-colors ${
                      schedule.activeDays.includes(day.id)
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] dark:bg-[var(--color-primary-dark)] text-white'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-xs font-medium">{day.short}</div>
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Выбрано: {schedule.activeDays.length} {schedule.activeDays.length === 1 ? 'день' : 'дней'} в неделю
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Назад
            </button>
            
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2 bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Далее
            </button>
          </div>
        </div>
      )}

      {/* Шаг 4: Подтверждение */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Подтверждение плана</h3>
            
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Основная информация</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Название:</strong> {title}</div>
                    {description && <div><strong>Описание:</strong> {description}</div>}
                    <div><strong>Тип цели:</strong> {
                      goal.type === 'surah' ? 'Одна сура' :
                      goal.type === 'multiple_surahs' ? 'Несколько сур' :
                      goal.type === 'juz' ? 'Джуз' : 'Весь Коран'
                    }</div>
                    {goal.surahs && goal.surahs.length > 0 && (
                      <div><strong>Суры:</strong> {goal.surahs.join(', ')}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Расписание и прогноз</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Аятов в день:</strong> {schedule.ayahsPerDay}</div>
                    <div><strong>Дней в неделю:</strong> {schedule.daysPerWeek}</div>
                    <div><strong>Дата начала:</strong> {new Date(schedule.startDate).toLocaleDateString('ru-RU')}</div>
                    <div><strong>Ориентировочное окончание:</strong> {new Date(schedule.estimatedEndDate).toLocaleDateString('ru-RU')}</div>
                    <div><strong>Общее количество аятов:</strong> {totalAyahs}</div>
                    <div><strong>Ожидаемая длительность:</strong> {estimatedDays} дней</div>
                    <div><strong>Общее время чтения:</strong> ~{estimatedTime} минут</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Назад
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!isValidPlan || loading}
              className="px-8 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Создание...' : 'Создать план'}
            </button>
          </div>
        </div>
      )}

      {/* Кнопка отмены */}
      <div className="mt-6 pt-6 border-t">
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}