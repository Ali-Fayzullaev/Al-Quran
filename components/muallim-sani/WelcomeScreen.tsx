'use client';

import React, { useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { BookOpen, User, ChevronRight, GraduationCap, Target, Award, Globe, Sparkles, Headphones, BarChart3, Trophy, Brain, Type, FileText, Music, RotateCcw, MoveHorizontal, Star, Play } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Главный заголовок */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center shadow-2xl">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
          {welcomeText.title}
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          {welcomeText.subtitle}
        </p>
      </div>

      {/* Описание и возможности */}
      <div 
        className="rounded-3xl p-6 sm:p-8 lg:p-10 mb-12 sm:mb-16 shadow-xl border-2" 
        style={{ 
          borderColor: 'var(--color-primary)',
          background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background) 100%)'
        }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            🎆 Почему Муаллим Сани?
          </h2>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text)' }}>
            {welcomeText.description}
          </p>
        </div>

        {/* Возможности */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {welcomeText.features.map((feature, index) => {
            const icons = [Sparkles, Headphones, BarChart3, Trophy, Brain];
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
            const IconComponent = icons[index];
            return (
              <div 
                key={index}
                className="flex items-center p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                style={{ backgroundColor: 'var(--color-background)', border: '2px solid var(--color-border)' }}
              >
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mr-4 shadow-lg"
                  style={{ backgroundColor: colors[index] }}
                >
                  <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <span className="font-medium text-sm sm:text-base" style={{ color: 'var(--color-text)' }}>
                  {feature}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Программа обучения */}
      <div 
        className="rounded-3xl p-6 sm:p-8 lg:p-10 mb-12 sm:mb-16 shadow-xl border-2"
        style={{ 
          backgroundColor: 'var(--color-background-secondary)', 
          borderColor: 'var(--color-primary)',
          background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background) 100%)'
        }}
      >
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 mr-3 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
              Программа обучения
            </h2>
          </div>
          <p className="text-base sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Последовательные уровни для изучения таджвида
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { name: 'Алифба', desc: 'Арабский алфавит', IconComponent: Type, color: '#3B82F6' },
            { name: 'Все буквы', desc: 'Характеристики букв', IconComponent: FileText, color: '#10B981' },
            { name: 'Танвин', desc: 'Буквы с огласовками', IconComponent: Music, color: '#F59E0B' },
            { name: 'Ташдид', desc: 'Удвоение букв', IconComponent: RotateCcw, color: '#EF4444' },
            { name: 'Мад табии', desc: 'Удлинение', IconComponent: MoveHorizontal, color: '#8B5CF6' },
            { name: 'Полный курс', desc: 'Весь таджвид', IconComponent: GraduationCap, color: '#F97316' }
          ].map((level, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl border-2 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer relative overflow-hidden"
              style={{ 
                backgroundColor: 'var(--color-background)',
                borderColor: level.color
              }}
            >
              {/* Градиентный фон при наведении */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${level.color} 0%, transparent 100%)` }}
              ></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: level.color }}
                  >
                    <level.IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: level.color }}></div>
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-opacity-90 transition-all" style={{ color: level.color }}>
                  {level.name}
                </h3>
                <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  {level.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопка начала или ввод имени */}
      <div className="text-center mb-12 sm:mb-16">
        {!showNameInput ? (
          <button
            onClick={handleStartLearning}
            className="group relative px-10 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-3xl overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%)',
              color: 'white'
            }}
          >
            {/* Мерцающий эффект */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 ease-out"></div>
            
            <div className="flex items-center justify-center space-x-3 relative z-10">
              <Play className="w-6 h-6" />
              <span>{welcomeText.startButton}</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ) : (
          <div 
            className="max-w-lg mx-auto p-6 sm:p-8 rounded-2xl shadow-xl border-2"
            style={{ 
              backgroundColor: 'var(--color-background-secondary)',
              borderColor: 'var(--color-primary)'
            }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <label className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {welcomeText.nameLabel}
              </label>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border-2 text-lg font-medium mb-6 focus:outline-none focus:ring-4 transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--color-background)',
                borderColor: name.trim() ? 'var(--color-primary)' : 'var(--color-border)',
                color: 'var(--color-text)',
                boxShadow: name.trim() ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
              }}
              placeholder="Введите ваше имя..."
              maxLength={50}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  handleSubmitName();
                }
              }}
            />
            <button
              onClick={handleSubmitName}
              disabled={!name.trim()}
              className="group w-full py-4 rounded-xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden relative"
              style={{ 
                background: name.trim() ? 'linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%)' : '#9CA3AF',
                color: 'white'
              }}
            >
              {/* Мерцающий эффект для активной кнопки */}
              {name.trim() && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 ease-out"></div>
              )}
              
              <div className="flex items-center justify-center space-x-2 relative z-10">
                <span>{welcomeText.continueButton}</span>
                {name.trim() && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {[
          { label: 'Уроков', value: '50+', IconComponent: BookOpen, color: '#3B82F6' },
          { label: 'Упражнений', value: '200+', IconComponent: Target, color: '#10B981' },
          { label: 'Достижений', value: '25', IconComponent: Award, color: '#F59E0B' },
          { label: 'Языков', value: '3', IconComponent: Globe, color: '#8B5CF6' }
        ].map((stat, index) => (
          <div 
            key={index} 
            className="text-center p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            style={{ backgroundColor: 'var(--color-background-secondary)', border: '2px solid var(--color-border)' }}
          >
            <div className="flex justify-center mb-4">
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: stat.color }}
              >
                <stat.IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-sm sm:text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}