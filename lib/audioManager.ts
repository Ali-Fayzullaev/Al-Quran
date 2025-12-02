// Утилита для управления звуками в PDF viewer
export class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private isLoaded: boolean = false;

  constructor(audioPath: string = '/flip.mp3') {
    if (typeof window !== 'undefined') {
      this.initializeAudio(audioPath);
    }
  }

  private async initializeAudio(audioPath: string) {
    try {
      this.audio = new Audio(audioPath);
      this.audio.preload = 'auto';
      this.audio.volume = 0.25;
      
      // Предзагружаем аудио
      await this.audio.load();
      this.isLoaded = true;
      
      console.log('🎵 Аудио файл успешно загружен');
    } catch (error) {
      console.warn('⚠️ Не удалось загрузить аудио файл:', error);
    }
  }

  public play(): void {
    if (!this.audio || !this.isEnabled || !this.isLoaded) return;

    try {
      this.audio.currentTime = 0;
      this.audio.play().catch((error) => {
        console.log('Звук не может быть воспроизведен:', error);
      });
    } catch (error) {
      console.warn('Ошибка воспроизведения звука:', error);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  public isAudioLoaded(): boolean {
    return this.isLoaded;
  }

  public destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }
}