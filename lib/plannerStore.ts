// Хранилище для планировщика изучения Корана с использованием localStorage

import {
  UserProfile,
  StudyPlan,
  ProgressStats,
  Achievement,
  LocalStorageData,
  ExportData,
  DailyTask,
  StudyGoal,
  StudySchedule,
  STORAGE_KEYS,
  DEFAULT_AYAHS_PER_DAY,
  DEFAULT_DAYS_PER_WEEK,
  CalendarDay,
  TaskStatus
} from './plannerTypes';
import { getAllSurahsForPlanner } from './api';

class PlannerStore {
  private version = '1.0.0';

  // Инициализация хранилища
  initialize(): boolean {
    try {
      this.validateLocalStorage();
      this.migrateDataIfNeeded();
      return true;
    } catch (error) {
      console.error('Failed to initialize planner store:', error);
      return false;
    }
  }

  // Проверка доступности localStorage
  private validateLocalStorage(): void {
    if (typeof Storage === 'undefined') {
      throw new Error('localStorage is not supported');
    }

    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      throw new Error('localStorage is not accessible');
    }
  }

  // Миграция данных при обновлении версии
  private migrateDataIfNeeded(): void {
    const storedVersion = localStorage.getItem('quran_planner_version');
    
    if (!storedVersion || storedVersion !== this.version) {
      // Здесь можно добавить логику миграции
      localStorage.setItem('quran_planner_version', this.version);
    }
  }

  // === УПРАВЛЕНИЕ ПРОФИЛЕМ ПОЛЬЗОВАТЕЛЯ ===

  createUserProfile(name: string, preferences: UserProfile['preferences']): UserProfile {
    const profile: UserProfile = {
      id: this.generateId(),
      name,
      createdAt: new Date().toISOString(),
      preferences
    };

    this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
    return profile;
  }

  getUserProfile(): UserProfile | null {
    return this.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  }

  updateUserProfile(updates: Partial<UserProfile>): UserProfile | null {
    const profile = this.getUserProfile();
    if (!profile) return null;

    const updatedProfile = { ...profile, ...updates };
    this.setItem(STORAGE_KEYS.USER_PROFILE, updatedProfile);
    return updatedProfile;
  }

  // === УПРАВЛЕНИЕ ПЛАНАМИ ИЗУЧЕНИЯ ===

  async createStudyPlan(
    title: string,
    goal: StudyGoal,
    schedule: StudySchedule,
    description?: string
  ): Promise<StudyPlan> {
    const profile = this.getUserProfile();
    if (!profile) throw new Error('User profile not found');

    const tasks = await this.generateDailyTasks(goal, schedule);
    
    const plan: StudyPlan = {
      id: this.generateId(),
      userId: profile.id,
      title,
      description,
      goal,
      schedule,
      tasks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      currentStreak: 0,
      longestStreak: 0,
      totalDaysCompleted: 0,
      completionPercentage: 0
    };

    const plans = this.getAllStudyPlans();
    plans.push(plan);
    this.setItem(STORAGE_KEYS.STUDY_PLANS, plans);

    return plan;
  }

  getAllStudyPlans(): StudyPlan[] {
    return this.getItem<StudyPlan[]>(STORAGE_KEYS.STUDY_PLANS) || [];
  }

  getStudyPlan(id: string): StudyPlan | null {
    const plans = this.getAllStudyPlans();
    return plans.find(plan => plan.id === id) || null;
  }

  updateStudyPlan(id: string, updates: Partial<StudyPlan>): StudyPlan | null {
    const plans = this.getAllStudyPlans();
    const planIndex = plans.findIndex(plan => plan.id === id);
    
    if (planIndex === -1) return null;

    plans[planIndex] = {
      ...plans[planIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.setItem(STORAGE_KEYS.STUDY_PLANS, plans);
    return plans[planIndex];
  }

  deleteStudyPlan(id: string): boolean {
    const plans = this.getAllStudyPlans();
    const filteredPlans = plans.filter(plan => plan.id !== id);
    
    if (filteredPlans.length === plans.length) return false;

    this.setItem(STORAGE_KEYS.STUDY_PLANS, filteredPlans);
    return true;
  }

  // === УПРАВЛЕНИЕ ЕЖЕДНЕВНЫМИ ЗАДАЧАМИ ===

  completeTask(planId: string, taskDate: string, timeSpent?: number, notes?: string): StudyPlan | null {
    const plan = this.getStudyPlan(planId);
    if (!plan) return null;

    const taskIndex = plan.tasks.findIndex(task => task.date === taskDate);
    if (taskIndex === -1) return null;

    plan.tasks[taskIndex] = {
      ...plan.tasks[taskIndex],
      completed: true,
      completedAt: new Date().toISOString(),
      timeSpent,
      notes,
      skipped: false
    };

    // Обновляем статистику плана
    const updatedPlan = this.updatePlanStats(plan);
    this.updateStudyPlan(planId, updatedPlan);
    
    // Обновляем общую статистику
    this.updateProgressStats();

    return updatedPlan;
  }

  skipTask(planId: string, taskDate: string, reason?: string): StudyPlan | null {
    const plan = this.getStudyPlan(planId);
    if (!plan) return null;

    const taskIndex = plan.tasks.findIndex(task => task.date === taskDate);
    if (taskIndex === -1) return null;

    plan.tasks[taskIndex] = {
      ...plan.tasks[taskIndex],
      skipped: true,
      notes: reason,
      completed: false
    };

    // Перепланируем следующие задачи
    this.rescheduleRemainingTasks(plan, taskDate);
    
    const updatedPlan = this.updatePlanStats(plan);
    this.updateStudyPlan(planId, updatedPlan);

    return updatedPlan;
  }

  // === ГЕНЕРАЦИЯ ЕЖЕДНЕВНЫХ ЗАДАЧ ===

  private async generateDailyTasks(goal: StudyGoal, schedule: StudySchedule): Promise<DailyTask[]> {
    const tasks: DailyTask[] = [];
    const startDate = new Date(schedule.startDate);
    const ayahsPerDay = schedule.ayahsPerDay;

    // Получаем информацию о том, какие аяты нужно изучить
    const ayahsToStudy = await this.getAyahsFromGoal(goal);
    
    let currentAyahIndex = 0;
    let currentDate = new Date(startDate);
    let daysScheduled = 0;

    while (currentAyahIndex < ayahsToStudy.length) {
      const dayOfWeek = currentDate.getDay();
      
      // Проверяем, является ли этот день активным днем
      if (schedule.activeDays.includes(dayOfWeek)) {
        const remainingAyahs = ayahsToStudy.length - currentAyahIndex;
        const ayahsForToday = Math.min(ayahsPerDay, remainingAyahs);
        
        const todayAyahs = ayahsToStudy.slice(currentAyahIndex, currentAyahIndex + ayahsForToday);
        
        if (todayAyahs.length > 0) {
          const task: DailyTask = {
            date: this.formatDate(currentDate),
            surahNumber: todayAyahs[0].surah,
            fromAyah: todayAyahs[0].ayahInSurah,
            toAyah: todayAyahs[todayAyahs.length - 1].ayahInSurah,
            ayahCount: ayahsForToday,
            completed: false,
            skipped: false
          };
          
          tasks.push(task);
          currentAyahIndex += ayahsForToday;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
      daysScheduled++;

      // Защита от бесконечного цикла
      if (daysScheduled > 3650) { // Максимум 10 лет
        break;
      }
    }

    return tasks;
  }

  private async getAyahsFromGoal(goal: StudyGoal): Promise<Array<{surah: number, ayahInSurah: number}>> {
    const ayahs: Array<{surah: number, ayahInSurah: number}> = [];
    // Один запрос (закешированный на 24ч в lib/api.ts) на все 114 сур вместо
    // отдельного похода за каждой сурой в цикле.
    const surahs = await getAllSurahsForPlanner();
    const ayahCountBySurah = new Map(surahs.map((s) => [s.number, s.numberOfAyahs]));

    const pushSurah = (surahNumber: number) => {
      const ayahCount = ayahCountBySurah.get(surahNumber);
      if (!ayahCount) return;
      for (let i = 1; i <= ayahCount; i++) {
        ayahs.push({ surah: surahNumber, ayahInSurah: i });
      }
    };

    switch (goal.type) {
      case 'surah':
      case 'multiple_surahs':
        goal.surahs?.forEach(pushSurah);
        break;

      case 'juz':
        // Для джузов нужно будет получить информацию из API
        // Пока что упрощенная реализация
        break;

      case 'complete_quran':
        for (let surah = 1; surah <= 114; surah++) {
          pushSurah(surah);
        }
        break;
    }

    return ayahs;
  }

  // === СТАТИСТИКА И ПРОГРЕСС ===

  private updatePlanStats(plan: StudyPlan): StudyPlan {
    const completedTasks = plan.tasks.filter(task => task.completed);
    const totalTasks = plan.tasks.length;
    
    plan.totalDaysCompleted = completedTasks.length;
    plan.completionPercentage = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    // Вычисляем текущую серию
    plan.currentStreak = this.calculateCurrentStreak(plan.tasks);
    plan.longestStreak = Math.max(plan.longestStreak, plan.currentStreak, this.calculateLongestStreak(plan.tasks));
    
    // Обновляем статус плана
    if (plan.completionPercentage === 100) {
      plan.status = 'completed';
    }

    return plan;
  }

  // Группирует задачи по календарной дате (task.date уже в формате YYYY-MM-DD),
  // чтобы несколько задач в один день считались одним днём, а не несколькими
  // отдельными "днями" в серии (streak).
  private groupTasksByDate(tasks: DailyTask[]): Map<string, { completed: boolean; skipped: boolean }> {
    const days = new Map<string, { completed: boolean; skipped: boolean }>();

    for (const task of tasks) {
      const day = days.get(task.date) ?? { completed: false, skipped: true };
      day.completed = day.completed || task.completed;
      day.skipped = day.skipped && task.skipped;
      days.set(task.date, day);
    }

    return days;
  }

  private calculateCurrentStreak(tasks: DailyTask[]): number {
    const days = this.groupTasksByDate(tasks.filter(task => !this.isFutureDate(task.date)));
    const sortedDates = Array.from(days.keys()).sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
    const todayStr = this.formatDate(new Date());

    let streak = 0;

    for (const date of sortedDates) {
      const day = days.get(date)!;

      if (day.completed) {
        streak++;
      } else if (!day.skipped && date < todayStr) {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(tasks: DailyTask[]): number {
    const days = this.groupTasksByDate(tasks);
    const completedDates = Array.from(days.entries())
      .filter(([, day]) => day.completed)
      .map(([date]) => date)
      .sort();

    let longestStreak = 0;
    let currentStreak = 0;
    let previousDate: Date | null = null;

    for (const dateStr of completedDates) {
      const taskDate = new Date(dateStr);

      if (previousDate) {
        const daysDiff = Math.round((taskDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      previousDate = taskDate;
    }

    return Math.max(longestStreak, currentStreak);
  }

  updateProgressStats(): void {
    const plans = this.getAllStudyPlans();
    const completedTasks = plans.flatMap(plan => plan.tasks.filter(task => task.completed));
    
    const stats: ProgressStats = {
      totalPlans: plans.length,
      completedPlans: plans.filter(plan => plan.status === 'completed').length,
      activePlans: plans.filter(plan => plan.status === 'active').length,
      totalAyahsRead: completedTasks.reduce((sum, task) => sum + task.ayahCount, 0),
      totalTimeSpent: completedTasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0),
      currentStreak: this.calculateOverallCurrentStreak(plans),
      longestStreak: Math.max(...plans.map(plan => plan.longestStreak), 0),
      averageSessionTime: this.calculateAverageSessionTime(completedTasks),
      weeklyProgress: this.calculateWeeklyProgress(completedTasks),
      monthlyProgress: this.calculateMonthlyProgress(completedTasks)
    };

    this.setItem(STORAGE_KEYS.PROGRESS_STATS, stats);
  }

  private calculateOverallCurrentStreak(plans: StudyPlan[]): number {
    // Объединяем все задачи и находим общую серию
    const allTasks = plans.flatMap(plan => plan.tasks);
    return this.calculateCurrentStreak(allTasks);
  }

  private calculateAverageSessionTime(tasks: DailyTask[]): number {
    const tasksWithTime = tasks.filter(task => task.timeSpent && task.timeSpent > 0);
    if (tasksWithTime.length === 0) return 0;
    
    const totalTime = tasksWithTime.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
    return totalTime / tasksWithTime.length;
  }

  private calculateWeeklyProgress(tasks: DailyTask[]): ProgressStats['weeklyProgress'] {
    const weeklyMap = new Map<string, { completedDays: number; totalAyahs: number }>();

    tasks.forEach(task => {
      const week = this.getWeekKey(new Date(task.date));
      const current = weeklyMap.get(week) || { completedDays: 0, totalAyahs: 0 };
      
      current.completedDays++;
      current.totalAyahs += task.ayahCount;
      
      weeklyMap.set(week, current);
    });

    return Array.from(weeklyMap.entries()).map(([week, data]) => ({
      week,
      ...data
    }));
  }

  private calculateMonthlyProgress(tasks: DailyTask[]): ProgressStats['monthlyProgress'] {
    const monthlyMap = new Map<string, { completedDays: number; totalAyahs: number }>();

    tasks.forEach(task => {
      const month = this.getMonthKey(new Date(task.date));
      const current = monthlyMap.get(month) || { completedDays: 0, totalAyahs: 0 };
      
      current.completedDays++;
      current.totalAyahs += task.ayahCount;
      
      monthlyMap.set(month, current);
    });

    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      ...data
    }));
  }

  getProgressStats(): ProgressStats | null {
    return this.getItem<ProgressStats>(STORAGE_KEYS.PROGRESS_STATS);
  }

  // === КАЛЕНДАРНЫЙ ПРОСМОТР ===

  getCalendarData(year: number, month: number): CalendarDay[] {
    const plans = this.getAllStudyPlans();
    const allTasks = plans.flatMap(plan => plan.tasks);
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDays: CalendarDay[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = this.formatDate(new Date(year, month, day));
      const dayTasks = allTasks.filter(task => task.date === date);
      
      let status: CalendarDay['status'] = 'future';
      
      if (dayTasks.length > 0) {
        const hasCompleted = dayTasks.some(task => task.completed);
        const hasSkipped = dayTasks.some(task => task.skipped);
        const isPast = new Date(date) < new Date();
        
        if (hasCompleted) {
          status = 'completed';
        } else if (hasSkipped) {
          status = 'skipped';
        } else if (isPast) {
          status = 'pending';
        } else {
          status = 'future';
        }
      }

      const totalAyahs = dayTasks.reduce((sum, task) => sum + (task.completed ? task.ayahCount : 0), 0);
      const totalTime = dayTasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);

      calendarDays.push({
        date,
        status,
        ayahsRead: totalAyahs > 0 ? totalAyahs : undefined,
        timeSpent: totalTime > 0 ? totalTime : undefined,
        tasks: dayTasks
      });
    }

    return calendarDays;
  }

  // === ЭКСПОРТ/ИМПОРТ ДАННЫХ ===

  exportData(): ExportData {
    const userProfile = this.getUserProfile();
    const studyPlans = this.getAllStudyPlans();
    const progressStats = this.getProgressStats();
    const achievements = this.getAllAchievements();

    return {
      version: this.version,
      userProfile: userProfile!,
      studyPlans,
      progressStats: progressStats!,
      achievements,
      exportedAt: new Date().toISOString(),
      appVersion: this.version
    };
  }

  importData(data: ExportData): boolean {
    try {
      // Валидация данных
      if (!data.userProfile || !Array.isArray(data.studyPlans)) {
        throw new Error('Invalid data format');
      }

      // Сохранение данных
      this.setItem(STORAGE_KEYS.USER_PROFILE, data.userProfile);
      this.setItem(STORAGE_KEYS.STUDY_PLANS, data.studyPlans);
      
      if (data.progressStats) {
        this.setItem(STORAGE_KEYS.PROGRESS_STATS, data.progressStats);
      }
      
      if (data.achievements) {
        this.setItem(STORAGE_KEYS.ACHIEVEMENTS, data.achievements);
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('quran_planner_version');
  }

  // === УТИЛИТЫ ===

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private isFutureDate(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    return date > today;
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private getMonthKey(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}`;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }


  private rescheduleRemainingTasks(plan: StudyPlan, skippedDate: string): void {
    // Логика перепланирования оставшихся задач после пропуска
    // Пока упрощенная реализация
  }

  // Методы для работы с localStorage
  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
      throw error;
    }
  }

  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return null;
    }
  }

  // === ДОСТИЖЕНИЯ (базовая реализация) ===

  getAllAchievements(): Achievement[] {
    return this.getItem<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS) || [];
  }

  checkAndUnlockAchievements(): Achievement[] {
    // Логика проверки и разблокировки достижений
    // Будет реализована в следующих этапах
    return [];
  }
}

// Экспортируем единственный экземпляр хранилища
export const plannerStore = new PlannerStore();