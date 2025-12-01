import { MuallamSaniProfile, LearningLevel, Achievement, StudyStats, Quiz } from '@/types/muallim-sani';

const STORAGE_KEY = 'muallam-sani-profile';
const ACHIEVEMENTS_KEY = 'muallam-sani-achievements';

class MuallamSaniStore {
  private static instance: MuallamSaniStore;

  static getInstance(): MuallamSaniStore {
    if (!MuallamSaniStore.instance) {
      MuallamSaniStore.instance = new MuallamSaniStore();
    }
    return MuallamSaniStore.instance;
  }

  // Профиль пользователя
  getProfile(): MuallamSaniProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const profile = localStorage.getItem(STORAGE_KEY);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  }

  saveProfile(profile: MuallamSaniProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  createProfile(name: string): MuallamSaniProfile {
    const profile: MuallamSaniProfile = {
      userId: this.generateId(),
      profile: {
        name,
        avatar: 'default',
        joinedDate: new Date(),
        dailyGoal: 30,
        preferredTime: 'evening'
      },
      progress: {
        currentLevel: 'alifba',
        completedLessons: [],
        unlockedLevels: ['alifba'], // Первый уровень разблокирован по умолчанию
        scores: {},
        achievements: [],
        streak: 0,
        lastStudyDate: new Date()
      },
      settings: {
        language: 'ru',
        audioEnabled: false,
        animations: true,
        difficulty: 'medium',
        vibrationEnabled: false
      }
    };
    
    this.saveProfile(profile);
    return profile;
  }

  // Управление прогрессом
  updateProgress(lessonId: string, score: number, timeSpent: number): void {
    const profile = this.getProfile();
    if (!profile) return;

    if (!profile.progress.scores[lessonId]) {
      profile.progress.scores[lessonId] = {
        attempts: 0,
        bestScore: 0,
        lastScore: 0,
        timeSpent: 0
      };
    }

    const lessonProgress = profile.progress.scores[lessonId];
    lessonProgress.attempts += 1;
    lessonProgress.lastScore = score;
    lessonProgress.bestScore = Math.max(lessonProgress.bestScore, score);
    lessonProgress.timeSpent += timeSpent;

    // Отмечаем урок как завершенный если набрано достаточно баллов
    if (score >= 70 && !profile.progress.completedLessons.includes(lessonId)) {
      profile.progress.completedLessons.push(lessonId);
      
      // Разблокировать следующий уровень
      this.unlockNextLevel(lessonId, profile);
    }

    // Обновляем текущий уровень
    profile.progress.currentLevel = this.getCurrentLevel(profile);

    // Обновляем streak
    this.updateStreak(profile);

    this.saveProfile(profile);
    this.checkAchievements(profile);
  }

  // Разблокировка следующего уровня
  private unlockNextLevel(completedLevelId: string, profile: MuallamSaniProfile): void {
    const levels = this.getLearningLevels();
    const currentLevelIndex = levels.findIndex(l => l.id === completedLevelId);
    
    if (currentLevelIndex !== -1 && currentLevelIndex < levels.length - 1) {
      const nextLevel = levels[currentLevelIndex + 1];
      if (!profile.progress.unlockedLevels) {
        profile.progress.unlockedLevels = ['alifba']; // Первый уровень всегда разблокирован
      }
      
      if (!profile.progress.unlockedLevels.includes(nextLevel.id)) {
        profile.progress.unlockedLevels.push(nextLevel.id);
      }
    }
  }

  // Получение текущего уровня
  private getCurrentLevel(profile: MuallamSaniProfile): string {
    const levels = this.getLearningLevels();
    
    // Находим последний завершенный уровень
    for (let i = levels.length - 1; i >= 0; i--) {
      if (profile.progress.completedLessons.includes(levels[i].id)) {
        // Если это не последний уровень, возвращаем следующий
        if (i < levels.length - 1) {
          return levels[i + 1].id;
        }
        // Если последний уровень завершен, остаемся на нем
        return levels[i].id;
      }
    }
    
    // Если ничего не завершено, возвращаем первый уровень
    return levels[0].id;
  }

  updateStreak(profile: MuallamSaniProfile): void {
    const today = new Date();
    const lastStudy = new Date(profile.progress.lastStudyDate);
    
    const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Сегодня уже учились
      return;
    } else if (daysDiff === 1) {
      // Учились вчера - продолжаем streak
      profile.progress.streak += 1;
    } else {
      // Перерыв больше дня - сбрасываем streak
      profile.progress.streak = 1;
    }
    
    profile.progress.lastStudyDate = today;
  }

  // Достижения
  checkAchievements(profile: MuallamSaniProfile): void {
    const achievements = this.getAvailableAchievements();
    
    achievements.forEach(achievement => {
      if (!profile.progress.achievements.includes(achievement.id)) {
        if (this.checkAchievementCondition(achievement, profile)) {
          profile.progress.achievements.push(achievement.id);
          achievement.isUnlocked = true;
          achievement.unlockedDate = new Date();
          this.saveAchievement(achievement);
        }
      }
    });
    
    this.saveProfile(profile);
  }

  checkAchievementCondition(achievement: Achievement, profile: MuallamSaniProfile): boolean {
    switch (achievement.id) {
      case 'first-lesson':
        return profile.progress.completedLessons.length >= 1;
      case 'perfect-score':
        return Object.values(profile.progress.scores).some(score => score.bestScore === 100);
      case 'week-streak':
        return profile.progress.streak >= 7;
      case 'alifba-master':
        return this.isLevelCompleted('alifba', profile);
      case 'tajwid-expert':
        return this.isLevelCompleted('complete', profile);
      default:
        return false;
    }
  }

  isLevelCompleted(levelId: string, profile: MuallamSaniProfile): boolean {
    const level = this.getLearningLevels().find(l => l.id === levelId);
    if (!level) return false;
    
    return level.lessons.every(lesson => 
      profile.progress.completedLessons.includes(lesson.id)
    );
  }

  // Статистика
  getStats(): StudyStats {
    const profile = this.getProfile();
    if (!profile) {
      return {
        totalTimeSpent: 0,
        lessonsCompleted: 0,
        averageScore: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalQuizzes: 0,
        perfectScores: 0,
        weeklyProgress: Array(7).fill(0)
      };
    }

    const scores = Object.values(profile.progress.scores);
    const totalQuizzes = scores.reduce((sum, score) => sum + score.attempts, 0);
    const totalTimeSpent = scores.reduce((sum, score) => sum + score.timeSpent, 0);
    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score.bestScore, 0) / scores.length 
      : 0;
    const perfectScores = scores.filter(score => score.bestScore === 100).length;

    return {
      totalTimeSpent,
      lessonsCompleted: profile.progress.completedLessons.length,
      averageScore: Math.round(averageScore),
      currentStreak: profile.progress.streak,
      bestStreak: profile.progress.streak, // TODO: track best streak separately
      totalQuizzes,
      perfectScores,
      weeklyProgress: this.getWeeklyProgress(profile)
    };
  }

  getWeeklyProgress(profile: MuallamSaniProfile): number[] {
    // TODO: Implement weekly progress tracking
    return Array(7).fill(0);
  }

  // Вспомогательные методы
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveAchievement(achievement: Achievement): void {
    if (typeof window === 'undefined') return;
    try {
      const achievements = this.getAllAchievements();
      const index = achievements.findIndex(a => a.id === achievement.id);
      if (index >= 0) {
        achievements[index] = achievement;
      } else {
        achievements.push(achievement);
      }
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievement:', error);
    }
  }

  getAllAchievements(): Achievement[] {
    if (typeof window === 'undefined') return [];
    try {
      const achievements = localStorage.getItem(ACHIEVEMENTS_KEY);
      return achievements ? JSON.parse(achievements) : this.getDefaultAchievements();
    } catch (error) {
      console.error('Error loading achievements:', error);
      return this.getDefaultAchievements();
    }
  }

  getAvailableAchievements(): Achievement[] {
    return this.getDefaultAchievements();
  }

  private getDefaultAchievements(): Achievement[] {
    return [
      {
        id: 'first-lesson',
        name: 'Первый урок',
        description: 'Завершите свой первый урок',
        icon: '🎯',
        color: '#10B981',
        condition: 'complete-first-lesson',
        points: 10,
        isUnlocked: false
      },
      {
        id: 'perfect-score',
        name: 'Совершенное произношение',
        description: 'Получите 100% за экзамен',
        icon: '⭐',
        color: '#F59E0B',
        condition: 'score-100',
        points: 25,
        isUnlocked: false
      },
      {
        id: 'week-streak',
        name: 'Неделя усердия',
        description: 'Учитесь 7 дней подряд',
        icon: '🔥',
        color: '#EF4444',
        condition: 'streak-7',
        points: 50,
        isUnlocked: false
      },
      {
        id: 'alifba-master',
        name: 'Мастер алфавита',
        description: 'Завершите уровень Алифба',
        icon: '📚',
        color: '#8B5CF6',
        condition: 'complete-alifba',
        points: 100,
        isUnlocked: false
      },
      {
        id: 'tajwid-expert',
        name: 'Знаток таджвида',
        description: 'Завершите весь курс',
        icon: '👑',
        color: '#F97316',
        condition: 'complete-all',
        points: 500,
        isUnlocked: false
      }
    ];
  }

  getLearningLevels(): LearningLevel[] {
    return [
      {
        id: 'alifba',
        nameRu: 'Алифба',
        nameEn: 'Alifba', 
        nameUz: 'Alifbo',
        description: 'Изучение арабского алфавита и основ произношения',
        icon: '🔤',
        color: '#3B82F6',
        lessons: [],
        order: 1,
        isLocked: false,
        pdfPath: '/muallim_sani/alifba_end.pdf'
      },
      {
        id: 'all-letters',
        nameRu: 'Все буквы',
        nameEn: 'All Letters',
        nameUz: 'Barcha harflar',
        description: 'Практика всех арабских букв в разных позициях',
        icon: '📝',
        color: '#10B981',
        lessons: [],
        order: 2,
        isLocked: true,
        pdfPath: '/muallim_sani/all_letters_end.pdf'
      },
      {
        id: 'mad-tabii',
        nameRu: 'Мад табии',
        nameEn: 'Mad Tabii',
        nameUz: 'Mad tabii',
        description: 'Изучение мад табии (естественного удлинения)',
        icon: '↔️',
        color: '#8B5CF6',
        lessons: [],
        order: 3,
        isLocked: true,
        pdfPath: '/muallim_sani/mad_tabiy_end.pdf'
      },
      {
        id: 'tanvin',
        nameRu: 'Танвин',
        nameEn: 'Tanvin',
        nameUz: 'Tanvin',
        description: 'Изучение танвина (нунации) и его правил',
        icon: '🎵',
        color: '#F59E0B',
        lessons: [],
        order: 4,
        isLocked: true,
        pdfPath: '/muallim_sani/letters_with_tanvin_end.pdf'
      },
      {
        id: 'tashdid',
        nameRu: 'Ташдид',
        nameEn: 'Tashdid',
        nameUz: 'Tashdid',
        description: 'Изучение ташдида (удвоения согласных)',
        icon: '🔄',
        color: '#EF4444',
        lessons: [],
        order: 5,
        isLocked: true,
        pdfPath: '/muallim_sani/letters_with_tashdid_end.pdf'
      },
      {
        id: 'complete',
        nameRu: 'Полный курс',
        nameEn: 'Complete Course',
        nameUz: 'To\'liq kurs',
        description: 'Полный курс Муаллим Сани с продвинутым таджвидом',
        icon: '🎓',
        color: '#F97316',
        lessons: [],
        order: 6,
        isLocked: true,
        pdfPath: '/muallim_sani/all_muallim_sani_end.pdf'
      }
    ];
  }

  // Генератор тестов (упрощенный - только 3 типа вопросов)
  generateQuiz(levelId: string): Quiz {
    const questions = this.generateQuestions(levelId);
    return {
      id: this.generateId(),
      levelId,
      questions,
      timeLimit: 300, // 5 минут
      passingScore: 70,
      createdAt: new Date()
    };
  }

  private generateQuestions(levelId: string): any[] {
    // Упрощенная генерация вопросов - 3 основных типа
    const questionTypes = ['multiple-choice', 'true-false', 'fill-blank'];
    const questions = [];

    for (let i = 0; i < 5; i++) {
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      questions.push({
        id: this.generateId(),
        type,
        question: this.getQuestionByType(type, levelId),
        options: type === 'multiple-choice' ? this.getOptionsForLevel(levelId) : undefined,
        correctAnswer: this.getCorrectAnswerByType(type, levelId),
        points: 20,
        explanation: 'Объяснение правильного ответа'
      });
    }

    return questions;
  }

  private getQuestionByType(type: string, levelId: string): string {
    const questions = {
      'multiple-choice': [
        'Какая буква называется Алиф?',
        'Что означает танвин?',
        'Как произносится буква Ба?'
      ],
      'true-false': [
        'Алиф - первая буква арабского алфавита',
        'Танвин добавляет звук "н" к концу слова',
        'Ташдид удваивает согласную'
      ],
      'fill-blank': [
        'Дополните: Алиф, Ба, ___',
        'Танвин обозначается символами: ___',
        'Мад табии - это ___ удлинение'
      ]
    };

    const typeQuestions = questions[type as keyof typeof questions] || questions['multiple-choice'];
    return typeQuestions[Math.floor(Math.random() * typeQuestions.length)];
  }

  private getOptionsForLevel(levelId: string): string[] {
    return ['Вариант А', 'Вариант Б', 'Вариант В', 'Вариант Г'];
  }

  private getCorrectAnswerByType(type: string, levelId: string): string {
    switch (type) {
      case 'multiple-choice':
        return 'Вариант А';
      case 'true-false':
        return 'true';
      case 'fill-blank':
        return 'правильный ответ';
      default:
        return 'Вариант А';
    }
  }

  // Сброс данных
  resetAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACHIEVEMENTS_KEY);
  }
}

export const muallamSaniStore = MuallamSaniStore.getInstance();
export default muallamSaniStore;