import { MuallamSaniProfile, LearningLevel, Achievement, StudyStats, Quiz, AchievementNotification } from '@/types/muallim-sani';

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
      const parsedProfile = profile ? JSON.parse(profile) : null;
      
      // Инициализируем totalPoints и levelProgress для существующих профилей
      if (parsedProfile) {
        if (typeof parsedProfile.progress.totalPoints === 'undefined') {
          parsedProfile.progress.totalPoints = 0;
        }
        if (!parsedProfile.progress.levelProgress) {
          parsedProfile.progress.levelProgress = {};
        }
        this.saveProfile(parsedProfile);
      }
      
      return parsedProfile;
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
        lastStudyDate: new Date(),
        totalPoints: 0,
        levelProgress: {}
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

    // НОВАЯ ЛОГИКА: Всегда обновляем список завершенных уроков с актуальным прогрессом
    // Удаляем урок из завершенных если он там был
    const completedIndex = profile.progress.completedLessons.indexOf(lessonId);
    if (completedIndex > -1) {
      profile.progress.completedLessons.splice(completedIndex, 1);
    }
    
    // Добавляем урок в завершенные ТОЛЬКО если набрано 70% или больше
    if (score >= 70) {
      profile.progress.completedLessons.push(lessonId);
      // Разблокировать следующий уровень только при успешном прохождении
      this.unlockNextLevel(lessonId, profile);
    }

    // Обновляем levelProgress
    if (!profile.progress.levelProgress) {
      profile.progress.levelProgress = {};
    }
    
    // Для уровня используем лучший результат как прогресс
    profile.progress.levelProgress[lessonId] = lessonProgress.bestScore;

    // Обновляем текущий уровень
    profile.progress.currentLevel = this.getCurrentLevel(profile);

    // Обновляем streak только при успешном прохождении
    if (score >= 70) {
      this.updateStreak(profile);
    }

    this.saveProfile(profile);
  }

  // Получить прогресс урока (процент от лучшего результата)
  getLessonProgress(lessonId: string): number {
    const profile = this.getProfile();
    if (!profile || !profile.progress.scores[lessonId]) {
      return 0;
    }
    
    return profile.progress.scores[lessonId].bestScore;
  }

  // Проверить завершен ли урок (70% или больше)
  isLessonCompleted(lessonId: string): boolean {
    const progress = this.getLessonProgress(lessonId);
    return progress >= 70;
  }

  // Получить детальную статистику урока
  getLessonStats(lessonId: string) {
    const profile = this.getProfile();
    if (!profile || !profile.progress.scores[lessonId]) {
      return {
        attempts: 0,
        bestScore: 0,
        lastScore: 0,
        timeSpent: 0,
        completed: false,
        progress: 0
      };
    }

    const lessonData = profile.progress.scores[lessonId];
    return {
      attempts: lessonData.attempts,
      bestScore: lessonData.bestScore,
      lastScore: lessonData.lastScore,
      timeSpent: lessonData.timeSpent,
      completed: lessonData.bestScore >= 70,
      progress: lessonData.bestScore
    };
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

    // Сравниваем календарные дни, а не разницу в миллисекундах — иначе результат
    // зависит от времени суток занятия (напр. 23:00 -> 06:00 через два дня даёт
    // всего ~31ч и ошибочно засчитывается как "занимался вчера").
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastStudyMidnight = new Date(lastStudy.getFullYear(), lastStudy.getMonth(), lastStudy.getDate());
    const daysDiff = Math.round((todayMidnight.getTime() - lastStudyMidnight.getTime()) / (1000 * 60 * 60 * 24));

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

  // Достижения - проверка только после завершения теста
  checkAchievementsAfterCompletion(profile: MuallamSaniProfile, completedLessonId?: string, testScore?: number): AchievementNotification[] {
    const achievements = this.getAvailableAchievements();
    const newAchievements: AchievementNotification[] = [];
    
    achievements.forEach(achievement => {
      if (!profile.progress.achievements.includes(achievement.id)) {
        if (this.checkAchievementCondition(achievement, profile, completedLessonId, testScore)) {
          profile.progress.achievements.push(achievement.id);
          profile.progress.totalPoints = (profile.progress.totalPoints || 0) + achievement.points;
          achievement.isUnlocked = true;
          achievement.unlockedDate = new Date();
          
          const notification = this.createAchievementNotification(achievement);
          newAchievements.push(notification);
          
          this.saveAchievement(achievement);
        }
      }
    });
    
    this.saveProfile(profile);
    return newAchievements;
  }

  createAchievementNotification(achievement: Achievement): AchievementNotification {
    const praises = {
      'first-lesson': 'Отлично! Вы сделали первый шаг в изучении Корана! 🎉',
      'perfect-score': 'Потрясающе! Ваше произношение безупречно! ⭐',
      'week-streak': 'Невероятно! Ваша постоянность впечатляет! 🔥',
      'alifba-master': 'Браво! Вы освоили арабский алфавит! 📚',
      'tajwid-expert': 'Машааллах! Вы стали настоящим знатоком таджвида! 👑'
    };

    return {
      id: achievement.id,
      achievement,
      message: `Получено достижение: ${achievement.name}`,
      praise: praises[achievement.id as keyof typeof praises] || 'Великолепная работа!',
      points: achievement.points,
      timestamp: new Date()
    };
  }

  checkAchievementCondition(achievement: Achievement, profile: MuallamSaniProfile, completedLessonId?: string, testScore?: number): boolean {
    switch (achievement.id) {
      case 'first-lesson':
        // Только если сейчас завершили первый урок
        return !!completedLessonId && profile.progress.completedLessons.length === 1;
      case 'perfect-score':
        // Только если сейчас получили 100% за тест
        return testScore === 100;
      case 'week-streak':
        // Достигли streak в 7+ дней (>=, а не ===, чтобы не пропустить
        // достижение, если проверка не сработала ровно на 7-й день)
        return profile.progress.streak >= 7;
      case 'alifba-master':
        // Только если сейчас завершили последний урок уровня Алифба
        return this.isLevelCompleted('alifba', profile) && !!completedLessonId;
      case 'tajwid-expert':
        // Только если завершили весь курс
        return this.isAllLevelsCompleted(profile) && !!completedLessonId;
      default:
        return false;
    }
  }

  isLevelCompleted(levelId: string, profile: MuallamSaniProfile): boolean {
    const level = this.getLearningLevels().find(l => l.id === levelId);
    if (!level) return false;
    
    // Инициализируем levelProgress если не существует
    if (!profile.progress.levelProgress) {
      profile.progress.levelProgress = {};
    }
    
    // Для Алифба проверяем завершение уровня по прогрессу
    if (levelId === 'alifba') {
      return (profile.progress.levelProgress[levelId] || 0) === 100;
    }
    
    // Для других уровней можно добавить другую логику
    return (profile.progress.levelProgress[levelId] || 0) === 100;
  }

  isAllLevelsCompleted(profile: MuallamSaniProfile): boolean {
    const levels = this.getLearningLevels();
    return levels.every(level => this.isLevelCompleted(level.id, profile));
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