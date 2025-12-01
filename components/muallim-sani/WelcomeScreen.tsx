'use client';

import React, { useState } from 'react';
import { useLocale } from '@/context/LocaleContext';

interface WelcomeScreenProps {
  onCreateProfile: (name: string) => void;
  onScreenChange: (screen: string) => void;
}

export default function WelcomeScreen({ onCreateProfile, onScreenChange }: WelcomeScreenProps) {
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  // Русскоязычная версия
  const welcomeText = {
    title: 'Муаллим Сани',
    subtitle: 'Интерактивная система обучения таджвиду',
    description: 'Изучайте чтение Корана с пошаговыми уроками, интерактивными упражнениями и персонализированными экзаменами.',
    features: [
      'Пошаговые интерактивные уроки',
      'Отслеживание персонального прогресса',
      'Система достижений с наградами',
      'Адаптивная система тестирования',
      'PDF учебные материалы'
    ],
    startButton: 'Начать обучение',
    nameLabel: 'Введите ваше имя',
    continueButton: 'Продолжить'
  };

  const handleStartLearning = () => {
    setShowNameInput(true);
  };

  const handleSubmitName = () => {
    if (name.trim()) {
      onCreateProfile(name.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Главный заголовок */}
      <div className="mb-8">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          {welcomeText.title}
        </h1>
        <p className="text-xl mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {welcomeText.subtitle}
        </p>
      </div>

      {/* Описание */}
      <div 
        className="rounded-2xl p-8 mb-8" 
        style={{ 
          backgroundColor: 'var(--color-background-secondary)', 
          borderColor: 'var(--color-border)', 
          borderWidth: '1px' 
        }}
      >
        <p className="text-lg mb-6" style={{ color: 'var(--color-text)' }}>
          {welcomeText.description}
        </p>

        {/* Возможности */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {welcomeText.features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center p-4 rounded-lg"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div className="text-2xl mr-3">
                {['✨', '🎧', '📊', '🏆', '🧠'][index]}
              </div>
              <span style={{ color: 'var(--color-text)' }}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Уровни обучения */}
      <div 
        className="rounded-2xl p-8 mb-8"
        style={{ 
          backgroundColor: 'var(--color-background-secondary)', 
          borderColor: 'var(--color-border)', 
          borderWidth: '1px' 
        }}
      >
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
          Программа обучения
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Алифба', desc: 'Арабский алфавит', icon: '🔤', color: '#3B82F6' },
            { name: 'Все буквы', desc: 'Характеристики букв', icon: '📝', color: '#10B981' },
            { name: 'Танвин', desc: 'Буквы с огласовками', icon: '🎵', color: '#F59E0B' },
            { name: 'Ташдид', desc: 'Удвоение букв', icon: '🔄', color: '#EF4444' },
            { name: 'Мад табии', desc: 'Удлинение', icon: '↔️', color: '#8B5CF6' },
            { name: 'Полный курс', desc: 'Весь таджвид', icon: '🎓', color: '#F97316' }
          ].map((level, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-background)',
                borderColor: level.color,
                borderWidth: '2px'
              }}
            >
              <div className="text-3xl mb-2">{level.icon}</div>
              <h3 className="font-bold mb-1" style={{ color: level.color }}>
                {level.name}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {level.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопка начала или ввод имени */}
      {!showNameInput ? (
        <button
          onClick={handleStartLearning}
          className="bg-primary text-white px-12 py-4 rounded-xl text-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {welcomeText.startButton}
        </button>
      ) : (
        <div 
          className="max-w-md mx-auto p-6 rounded-xl"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)', 
            borderWidth: '1px' 
          }}
        >
          <label className="block text-lg font-medium mb-4" style={{ color: 'var(--color-text)' }}>
            {welcomeText.nameLabel}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border text-lg mb-4"
            style={{ 
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
            placeholder="Ваше имя"
            maxLength={50}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmitName();
              }
            }}
          />
          <button
            onClick={handleSubmitName}
            disabled={!name.trim()}
            className="w-full py-3 rounded-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'white'
            }}
          >
            {welcomeText.continueButton}
          </button>
        </div>
      )}

      {/* Статистика */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {[
          { label: 'Уроков', value: '50+', icon: '📖' },
          { label: 'Упражнений', value: '200+', icon: '💪' },
          { label: 'Достижений', value: '25', icon: '🏆' },
          { label: 'Языков', value: '3', icon: '🌍' }
        ].map((stat, index) => (
          <div key={index} className="p-4">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}