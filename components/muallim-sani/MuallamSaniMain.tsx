'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { muallamSaniStore } from '@/lib/muallamSaniStore';
import { MuallamSaniProfile } from '@/types/muallim-sani';
import WelcomeScreen from './WelcomeScreen';
import DashboardScreen from './DashboardScreen';
import LessonScreen from './LessonScreen';
import QuizScreen from './QuizScreen';
import ProfileScreen from './ProfileScreen';
import AchievementsScreen from './AchievementsScreen';

type Screen = 'welcome' | 'dashboard' | 'lesson' | 'quiz' | 'profile' | 'achievements';

interface ScreenState {
  screen: Screen;
  lessonId?: string;
  quizId?: string;
}

export default function MuallamSaniMain() {
  const [profile, setProfile] = useState<MuallamSaniProfile | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>({ screen: 'welcome' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = () => {
      const existingProfile = muallamSaniStore.getProfile();
      setProfile(existingProfile);
      setCurrentScreen({ 
        screen: existingProfile ? 'dashboard' : 'welcome' 
      });
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleCreateProfile = (name: string) => {
    const newProfile = muallamSaniStore.createProfile(name);
    setProfile(newProfile);
    setCurrentScreen({ screen: 'dashboard' });
  };

  const handleScreenChange = (screen: string, data?: any) => {
    setCurrentScreen({ screen: screen as Screen, ...data });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
             style={{ borderColor: 'var(--color-primary)' }}>
        </div>
      </div>
    );
  }

  if (!profile && currentScreen.screen === 'welcome') {
    return (
      <WelcomeScreen 
        onCreateProfile={handleCreateProfile}
        onScreenChange={handleScreenChange}
      />
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Ошибка загрузки профиля
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentScreen.screen === 'dashboard' && (
        <DashboardScreen 
          profile={profile}
          onScreenChange={handleScreenChange}
          onProfileUpdate={setProfile}
        />
      )}
      
      {currentScreen.screen === 'lesson' && currentScreen.lessonId && (
        <LessonScreen 
          profile={profile}
          lessonId={currentScreen.lessonId}
          onScreenChange={handleScreenChange}
          onProfileUpdate={setProfile}
        />
      )}
      
      {currentScreen.screen === 'quiz' && currentScreen.quizId && (
        <QuizScreen 
          profile={profile}
          quizId={currentScreen.quizId}
          onScreenChange={handleScreenChange}
          onProfileUpdate={setProfile}
        />
      )}
      
      {currentScreen.screen === 'profile' && (
        <ProfileScreen 
          profile={profile}
          onScreenChange={handleScreenChange}
          onProfileUpdate={setProfile}
        />
      )}
      
      {currentScreen.screen === 'achievements' && (
        <AchievementsScreen 
          profile={profile}
          onScreenChange={handleScreenChange}
        />
      )}
    </div>
  );
}