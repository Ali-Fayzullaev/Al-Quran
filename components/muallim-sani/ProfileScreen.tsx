'use client';

import React, { useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { MuallamSaniProfile } from '@/types/muallim-sani';
import { muallamSaniStore } from '@/lib/muallamSaniStore';

interface ProfileScreenProps {
  profile: MuallamSaniProfile;
  onScreenChange: (screen: string) => void;
  onProfileUpdate: (profile: MuallamSaniProfile) => void;
}

export default function ProfileScreen({ profile, onScreenChange, onProfileUpdate }: ProfileScreenProps) {
  const { t, locale } = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const stats = muallamSaniStore.getStats();
  
  const handleSaveProfile = () => {
    muallamSaniStore.saveProfile(editedProfile);
    onProfileUpdate(editedProfile);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const getStudyLevel = () => {
    const completed = stats.lessonsCompleted;
    if (completed === 0) return { level: 'Новичок', color: '#6B7280', icon: '🌱' };
    if (completed < 5) return { level: 'Ученик', color: '#3B82F6', icon: '📚' };
    if (completed < 15) return { level: 'Знаток', color: '#10B981', icon: '🎓' };
    if (completed < 30) return { level: 'Мастер', color: '#F59E0B', icon: '🏆' };
    return { level: 'Эксперт', color: '#8B5CF6', icon: '👑' };
  };

  const studyLevel = getStudyLevel();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Заголовок */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => onScreenChange('dashboard')}
          className="mr-4 p-2 rounded-lg hover:opacity-70 transition-opacity"
          style={{ backgroundColor: 'var(--color-background-secondary)' }}
        >
          ← Назад
        </button>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
          👤 Профиль
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Карточка профиля */}
          <div 
            className="rounded-2xl p-6"
            style={{ 
              backgroundColor: 'var(--color-background-secondary)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                Основная информация
              </h2>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                style={{ 
                  backgroundColor: isEditing ? '#6B7280' : 'var(--color-primary)',
                  color: 'white'
                }}
              >
                {isEditing ? '❌ Отмена' : '✏️ Редактировать'}
              </button>
            </div>

            <div className="space-y-4">
              {/* Имя */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Имя
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.profile.name}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      profile: { ...editedProfile.profile, name: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  />
                ) : (
                  <p className="text-lg" style={{ color: 'var(--color-text)' }}>
                    {profile.profile.name}
                  </p>
                )}
              </div>

              {/* Ежедневная цель */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Ежедневная цель (минут)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedProfile.profile.dailyGoal}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      profile: { ...editedProfile.profile, dailyGoal: parseInt(e.target.value) || 30 }
                    })}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    min="10"
                    max="180"
                  />
                ) : (
                  <p className="text-lg" style={{ color: 'var(--color-text)' }}>
                    {profile.profile.dailyGoal} минут
                  </p>
                )}
              </div>

              {/* Предпочтительное время */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Предпочтительное время обучения
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.profile.preferredTime}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      profile: { 
                        ...editedProfile.profile, 
                        preferredTime: e.target.value as 'morning' | 'afternoon' | 'evening'
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  >
                    <option value="morning">Утро</option>
                    <option value="afternoon">День</option>
                    <option value="evening">Вечер</option>
                  </select>
                ) : (
                  <p className="text-lg" style={{ color: 'var(--color-text)' }}>
                    {profile.profile.preferredTime === 'morning' ? 'Утро' :
                     profile.profile.preferredTime === 'afternoon' ? 'День' : 'Вечер'}
                  </p>
                )}
              </div>

              {/* Дата начала */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Начало обучения
                </label>
                <p className="text-lg" style={{ color: 'var(--color-text)' }}>
                  {new Date(profile.profile.joinedDate).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#10B981', color: 'white' }}
                >
                  ✅ Сохранить
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#6B7280', color: 'white' }}
                >
                  ❌ Отмена
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Боковая панель со статистикой */}
        <div className="space-y-6">
          {/* Уровень обучения */}
          <div 
            className="rounded-2xl p-6 text-center"
            style={{ 
              backgroundColor: 'var(--color-background-secondary)',
              borderColor: studyLevel.color,
              borderWidth: '2px'
            }}
          >
            <div className="text-4xl mb-3">{studyLevel.icon}</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: studyLevel.color }}>
              {studyLevel.level}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Основано на прогрессе обучения
            </p>
            
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                {stats.lessonsCompleted}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Уроков завершено
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div 
            className="rounded-2xl p-6"
            style={{ 
              backgroundColor: 'var(--color-background-secondary)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px'
            }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
              📊 Статистика
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--color-text)' }}>Время изучения</span>
                <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                  {Math.floor(stats.totalTimeSpent / 60)}ч {stats.totalTimeSpent % 60}м
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--color-text)' }}>Средний балл</span>
                <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                  {stats.averageScore}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--color-text)' }}>Текущая серия</span>
                <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                  {stats.currentStreak} дней
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--color-text)' }}>Идеальных оценок</span>
                <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                  {stats.perfectScores}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--color-text)' }}>Тестов пройдено</span>
                <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                  {stats.totalQuizzes}
                </span>
              </div>
            </div>
          </div>

          {/* Достижения */}
          <div 
            className="rounded-2xl p-6"
            style={{ 
              backgroundColor: 'var(--color-background-secondary)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                🏆 Достижения
              </h3>
              <button
                onClick={() => onScreenChange('achievements')}
                className="text-sm px-3 py-1 rounded-lg hover:opacity-90 transition-opacity"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                Все
              </button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                {profile.progress.achievements.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                из {muallamSaniStore.getAvailableAchievements().length} получено
              </div>
              
              <div className="mt-4 w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${(profile.progress.achievements.length / muallamSaniStore.getAvailableAchievements().length) * 100}%`,
                    backgroundColor: 'var(--color-primary)'
                  }}
                />
              </div>
            </div>

            {/* Последние достижения */}
            {profile.progress.achievements.length > 0 && (
              <div className="mt-4">
                <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Последние:
                </div>
                <div className="flex gap-2">
                  {profile.progress.achievements.slice(-3).map((achievementId, index) => {
                    const achievement = muallamSaniStore.getAvailableAchievements()
                      .find(a => a.id === achievementId);
                    
                    if (!achievement) return null;
                    
                    return (
                      <div 
                        key={index}
                        className="text-center p-2 rounded-lg"
                        style={{ backgroundColor: 'var(--color-background)' }}
                        title={achievement.name}
                      >
                        <div className="text-2xl">{achievement.icon}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Действия */}
          <div className="space-y-3">
            <button
              onClick={() => onScreenChange('achievements')}
              className="w-full py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
            >
              🏆 Посмотреть достижения
            </button>
            
            <button
              onClick={() => onScreenChange('dashboard')}
              className="w-full py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)',
                borderWidth: '1px'
              }}
            >
              🏠 Вернуться к дашборду
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}