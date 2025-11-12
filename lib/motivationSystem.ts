// Мотивационная система для планировщика изучения Корана

import { 
  Achievement, 
  MotivationalMessage, 
  StudyPlan, 
  ProgressStats 
} from './plannerTypes';

export class MotivationSystem {
  // Предустановленные достижения
  private static achievements: Achievement[] = [
    // Достижения серий
    {
      id: 'streak_7',
      type: 'streak',
      title: 'Неделя дисциплины',
      description: 'Изучайте Коран 7 дней подряд',
      icon: '🔥',
      requirements: { streak: 7 }
    },
    {
      id: 'streak_30',
      type: 'streak', 
      title: 'Месяц постоянства',
      description: 'Сохраняйте серию изучения 30 дней',
      icon: '💪',
      requirements: { streak: 30 }
    },
    {
      id: 'streak_100',
      type: 'streak',
      title: 'Сто дней мастерства',
      description: 'Невероятные 100 дней непрерывного изучения',
      icon: '👑',
      requirements: { streak: 100 }
    },
    {
      id: 'streak_365',
      type: 'streak',
      title: 'Год преданности',
      description: 'Целый год ежедневного изучения Корана',
      icon: '🌟',
      requirements: { streak: 365 }
    },

    // Достижения завершения
    {
      id: 'complete_first_plan',
      type: 'completion',
      title: 'Первый успех',
      description: 'Завершите свой первый план изучения',
      icon: '🎯',
      requirements: { plansCompleted: 1 }
    },
    {
      id: 'complete_5_plans',
      type: 'completion',
      title: 'Целеустремленный',
      description: 'Завершите 5 планов изучения',
      icon: '🏆',
      requirements: { plansCompleted: 5 }
    },
    {
      id: 'complete_10_plans',
      type: 'completion',
      title: 'Мастер планирования',
      description: 'Завершите 10 планов изучения',
      icon: '👨‍🎓',
      requirements: { plansCompleted: 10 }
    },

    // Достижения вех
    {
      id: 'read_100_ayahs',
      type: 'milestone',
      title: 'Первая сотня',
      description: 'Изучите 100 аятов',
      icon: '📖',
      requirements: { ayahsRead: 100 }
    },
    {
      id: 'read_1000_ayahs',
      type: 'milestone',
      title: 'Тысяча аятов',
      description: 'Изучите 1000 аятов Корана',
      icon: '📚',
      requirements: { ayahsRead: 1000 }
    },
    {
      id: 'read_full_quran',
      type: 'milestone',
      title: 'Хатм аль-Коран',
      description: 'Изучите все 6236 аятов Корана',
      icon: '🕌',
      requirements: { ayahsRead: 6236 }
    },

    // Достижения постоянства
    {
      id: 'consistent_week',
      type: 'consistency',
      title: 'Недельная стабильность',
      description: 'Изучайте каждый день недели',
      icon: '⏰',
      requirements: { daysConsistent: 7 }
    },
    {
      id: 'consistent_month',
      type: 'consistency',
      title: 'Месячная стабильность',
      description: 'Изучайте каждый день месяца',
      icon: '📅',
      requirements: { daysConsistent: 30 }
    }
  ];

  // Мотивационные сообщения по контексту
  private static motivationalMessages: MotivationalMessage[] = [
    // Поощрения за серии
    {
      type: 'celebration',
      title: 'Отличное начало! 🌟',
      message: 'Вы начали свою серию изучения Корана. Каждый день приближает вас к духовному росту.',
      triggeredBy: 'streak'
    },
    {
      type: 'celebration',
      title: 'Неделя дисциплины! 🔥',
      message: 'Семь дней подряд! Ваша преданность изучению Корана вдохновляет.',
      triggeredBy: 'streak'
    },
    {
      type: 'celebration',
      title: 'Месяц постоянства! 💪',
      message: 'Тридцать дней непрерывного изучения! Вы формируете прекрасную привычку.',
      triggeredBy: 'streak'
    },

    // Завершение планов
    {
      type: 'celebration',
      title: 'План завершен! 🎉',
      message: 'Поздравляем с завершением плана изучения! Ваша настойчивость достойна восхищения.',
      triggeredBy: 'completion'
    },
    {
      type: 'celebration',
      title: 'Еще одна победа! ✨',
      message: 'Очередной план завершен успешно. Вы показываете удивительную дисциплину.',
      triggeredBy: 'completion'
    },

    // Пропущенные дни
    {
      type: 'encouragement',
      title: 'Не сдавайтесь! 💙',
      message: 'Каждый может пропустить день. Главное - начать снова. Аллах любит постоянные дела.',
      triggeredBy: 'missed_day'
    },
    {
      type: 'reminder',
      title: 'Возвращение к изучению 🌱',
      message: 'Пророк (ﷺ) сказал: "Самые любимые дела для Аллаха - постоянные, даже если они малы."',
      triggeredBy: 'missed_day'
    },

    // Вехи
    {
      type: 'milestone',
      title: 'Важная веха! 🏁',
      message: 'Вы достигли значительного прогресса в изучении Корана. Продолжайте этот благословенный путь.',
      triggeredBy: 'milestone'
    }
  ];

  // Проверка и разблокировка достижений
  static checkAchievements(stats: ProgressStats): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of this.achievements) {
      // Проверяем, не было ли достижение уже разблокировано
      if (achievement.unlockedAt) continue;

      let shouldUnlock = false;

      switch (achievement.type) {
        case 'streak':
          if (achievement.requirements.streak && 
              stats.currentStreak >= achievement.requirements.streak) {
            shouldUnlock = true;
          }
          break;
        
        case 'completion':
          if (achievement.requirements.plansCompleted &&
              stats.completedPlans >= achievement.requirements.plansCompleted) {
            shouldUnlock = true;
          }
          break;

        case 'milestone':
          if (achievement.requirements.ayahsRead &&
              stats.totalAyahsRead >= achievement.requirements.ayahsRead) {
            shouldUnlock = true;
          }
          break;

        case 'consistency':
          // Простая логика для постоянства - можно улучшить
          if (achievement.requirements.daysConsistent &&
              stats.currentStreak >= achievement.requirements.daysConsistent) {
            shouldUnlock = true;
          }
          break;
      }

      if (shouldUnlock) {
        achievement.unlockedAt = new Date().toISOString();
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  // Получение мотивационного сообщения
  static getMotivationalMessage(
    context: 'streak_start' | 'streak_continue' | 'plan_complete' | 'missed_day' | 'milestone_reached',
    value?: number
  ): MotivationalMessage {
    switch (context) {
      case 'streak_start':
        return {
          type: 'encouragement',
          title: 'Начните свой путь! 🌟',
          message: 'Каждое великое путешествие начинается с одного шага. Начните изучение Корана сегодня!',
          triggeredBy: 'streak'
        };

      case 'streak_continue':
        if (value === 7) {
          return this.motivationalMessages.find(m => m.title.includes('Неделя дисциплины'))!;
        } else if (value === 30) {
          return this.motivationalMessages.find(m => m.title.includes('Месяц постоянства'))!;
        } else if (value && value > 0) {
          return {
            type: 'celebration',
            title: `${value} дней подряд! 🔥`,
            message: `Ваша серия в ${value} дней показывает истинную преданность. Да благословит Аллах ваши усилия.`,
            triggeredBy: 'streak'
          };
        }
        return this.motivationalMessages.find(m => m.title.includes('Отличное начало'))!;

      case 'plan_complete':
        return {
          type: 'celebration',
          title: 'План успешно завершен! 🎉',
          message: 'Машаа Аллах! Вы показали прекрасную дисциплину и завершили план изучения.',
          triggeredBy: 'completion'
        };

      case 'missed_day':
        return this.motivationalMessages.find(m => m.triggeredBy === 'missed_day')!;

      case 'milestone_reached':
        return {
          type: 'milestone',
          title: 'Важная веха достигнута! 🏁',
          message: 'Субхан Аллах! Вы достигли важной вехи в изучении Корана. Продолжайте этот благословенный путь.',
          triggeredBy: 'milestone'
        };

      default:
        return {
          type: 'encouragement',
          title: 'Продолжайте изучение! 📖',
          message: 'Коран - это руководство к свету. Каждый аят приближает вас к Аллаху.',
          triggeredBy: 'streak'
        };
    }
  }

  // Получение совета дня
  static getDailyTip(): string {
    const tips = [
      "Лучшее время для чтения Корана - после фаджр намаза, когда ум наиболее ясен.",
      "Читайте Коран с размышлением (тадаббур), а не только ради завершения.",
      "Делайте дуа перед чтением: 'Раббана афтах калбана ли фахми китабика'.",
      "Изучайте значение аятов, которые вы читаете каждый день.",
      "Постоянство важнее количества - лучше читать мало, но регулярно.",
      "Читайте Коран в состоянии вуду для большей духовной пользы.",
      "Найдите тихое место для чтения, где ничто не будет отвлекать.",
      "Используйте тасбих для подсчета прочитанных аятов или страниц.",
      "Читайте с правильным произношением (таджвид), даже если медленно.",
      "Размышляйте над аятами - какие уроки Аллах хочет вам передать?"
    ];

    const today = new Date();
    const dayIndex = today.getDate() % tips.length;
    return tips[dayIndex];
  }

  // Получение всех доступных достижений
  static getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  // Получение разблокированных достижений
  static getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(achievement => achievement.unlockedAt);
  }

  // Получение прогресса к следующему достижению
  static getNextAchievementProgress(stats: ProgressStats): {
    achievement: Achievement;
    progress: number;
    remaining: number;
  } | null {
    const lockedAchievements = this.achievements.filter(a => !a.unlockedAt);
    
    for (const achievement of lockedAchievements) {
      let progress = 0;
      let total = 0;

      switch (achievement.type) {
        case 'streak':
          if (achievement.requirements.streak) {
            progress = stats.currentStreak;
            total = achievement.requirements.streak;
          }
          break;
        
        case 'completion':
          if (achievement.requirements.plansCompleted) {
            progress = stats.completedPlans;
            total = achievement.requirements.plansCompleted;
          }
          break;

        case 'milestone':
          if (achievement.requirements.ayahsRead) {
            progress = stats.totalAyahsRead;
            total = achievement.requirements.ayahsRead;
          }
          break;
      }

      if (total > 0 && progress < total) {
        const progressPercentage = (progress / total) * 100;
        return {
          achievement,
          progress: progressPercentage,
          remaining: total - progress
        };
      }
    }

    return null;
  }

  // Получение мотивационных фактов о Коране
  static getQuranFact(): string {
    const facts = [
      "В Коране 114 сур, 6236 аятов и более 77,000 слов.",
      "Коран был ниспослан на протяжении 23 лет.",
      "Самая длинная сура - Аль-Бакара (286 аятов).",
      "Самая короткая сура - Аль-Каусар (3 аята).",
      "В Коране упоминается 25 пророков (мир им всем).",
      "Сура Аль-Фатиха называется 'Матерью Корана'.",
      "Басмала встречается в Коране 114 раз.",
      "Коран - единственная священная книга, сохранившаяся в первозданном виде.",
      "Каждую букву Корана наизусть знают миллионы людей по всему миру.",
      "Чтение одной буквы Корана приносит 10 добрых дел."
    ];

    const randomIndex = Math.floor(Math.random() * facts.length);
    return facts[randomIndex];
  }
}