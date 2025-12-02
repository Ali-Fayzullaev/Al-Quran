// Утилита для управления настройками PDF viewer
interface PDFViewerSettings {
  soundEnabled: boolean;
  lastPage: number;
  lastBook: string | null;
  preferredScale: number;
  showTutorial: boolean;
}

const DEFAULT_SETTINGS: PDFViewerSettings = {
  soundEnabled: true,
  lastPage: 0,
  lastBook: null,
  preferredScale: 2.0,
  showTutorial: true
};

export class SettingsManager {
  private static STORAGE_KEY = 'muallim-sani-pdf-settings';

  static getSettings(): PDFViewerSettings {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Ошибка при чтении настроек:', error);
    }

    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings: Partial<PDFViewerSettings>): void {
    if (typeof window === 'undefined') return;

    try {
      const currentSettings = this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.warn('Ошибка при сохранении настроек:', error);
    }
  }

  static saveSoundPreference(enabled: boolean): void {
    this.saveSettings({ soundEnabled: enabled });
  }

  static saveLastPosition(bookId: string, page: number): void {
    this.saveSettings({ lastBook: bookId, lastPage: page });
  }

  static getLastPosition(): { bookId: string | null; page: number } {
    const settings = this.getSettings();
    return { bookId: settings.lastBook, page: settings.lastPage };
  }

  static shouldShowTutorial(): boolean {
    return this.getSettings().showTutorial;
  }

  static markTutorialAsShown(): void {
    this.saveSettings({ showTutorial: false });
  }

  static clearSettings(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Ошибка при очистке настроек:', error);
    }
  }
}