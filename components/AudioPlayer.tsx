import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuranStore } from '@/lib/store';
import { useLocale } from '@/context/LocaleContext';
import { cn } from '@/lib/utils';
import { getAyahAudioSources } from '@/lib/api';

interface AudioPlayerProps {
  surahNumber: number;
  verseNumber: number;
  onVerseChange?: (newVerse: number) => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  surahNumber,
  verseNumber,
  onVerseChange,
  className
}) => {
  const { locale } = useLocale();
  const {
    audioReciter,
    audioSpeed,
    audioVolume,
    autoPlay,
    setAudioSpeed,
    setAudioVolume
  } = useQuranStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Проверка доступности аудио источника
  const checkAudioSource = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const timeout = setTimeout(() => {
        audio.src = '';
        resolve(false);
      }, 5000); // 5 секунд таймаут

      audio.oncanplaythrough = () => {
        clearTimeout(timeout);
        audio.src = '';
        resolve(true);
      };

      audio.onerror = () => {
        clearTimeout(timeout);
        audio.src = '';
        resolve(false);
      };

      audio.src = url;
    });
  };

  // Загрузка аудио с резервными источниками
  const loadAudio = async () => {
    if (!audioRef.current) return;

    setIsLoading(true);
    setError(null);

    const sources = getAyahAudioSources(surahNumber, verseNumber, audioReciter);
    
    for (let i = currentSourceIndex; i < sources.length; i++) {
      try {
        const audioUrl = sources[i];
        console.log(`Trying audio source ${i + 1}/${sources.length}:`, audioUrl);

        // Проверяем доступность источника
        const isAvailable = await checkAudioSource(audioUrl);
        
        if (isAvailable) {
          audioRef.current.src = audioUrl;
          audioRef.current.playbackRate = audioSpeed;
          audioRef.current.volume = audioVolume;

          await new Promise((resolve, reject) => {
            const audio = audioRef.current;
            if (!audio) return reject(new Error('Audio element not found'));

            const handleCanPlay = () => {
              audio.removeEventListener('canplay', handleCanPlay);
              audio.removeEventListener('error', handleError);
              setCurrentSourceIndex(i);
              resolve(true);
            };

            const handleError = () => {
              audio.removeEventListener('canplay', handleCanPlay);
              audio.removeEventListener('error', handleError);
              reject(new Error('Failed to load audio'));
            };

            audio.addEventListener('canplay', handleCanPlay);
            audio.addEventListener('error', handleError);
            audio.load();
          });

          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error(`Audio source ${i + 1} failed:`, err);
        continue;
      }
    }

    // Если все источники не работают
    setIsLoading(false);
    setError(locale === 'en' 
      ? 'Audio not available. Please try again later or choose a different reciter.' 
      : 'Аудио недоступно. Попробуйте позже или выберите другого чтеца.'
    );
    setCurrentSourceIndex(0);
  };

  // Повторная попытка загрузки
  const retryLoad = () => {
    setCurrentSourceIndex(0);
    loadAudio();
  };

  // Play/pause functionality
  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        if (!audioRef.current.src || error) {
          await loadAudio();
        }
        
        if (!error) {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (err) {
        console.error('Playback error:', err);
        setError(locale === 'en' ? 'Failed to play audio' : 'Не удалось воспроизвести аудио');
        // Пробуем следующий источник
        setCurrentSourceIndex(prev => prev + 1);
        setTimeout(retryLoad, 1000);
      }
    }
  };

  // Navigate to previous/next verse
  const previousVerse = () => {
    if (verseNumber > 1) {
      onVerseChange?.(verseNumber - 1);
    }
  };

  const nextVerse = () => {
    onVerseChange?.(verseNumber + 1);
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent) => {
    if (!audioRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format time for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Effect to handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      if (autoPlay) {
        nextVerse();
      }
    };
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, [autoPlay, onVerseChange, verseNumber]);

  // Effect to update audio settings
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audioSpeed;
      audioRef.current.volume = audioVolume;
    }
  }, [audioSpeed, audioVolume]);

  // Effect to load new audio when verse changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setError(null);
    }
  }, [surahNumber, verseNumber, audioReciter]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700", className)}>
      <audio ref={audioRef} preload="metadata" />
      
      {/* Error Message */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium mb-2">{error}</p>
              <button
                onClick={retryLoad}
                disabled={isLoading}
                className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                {locale === 'en' ? 'Try Again' : 'Попробовать снова'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <div>
              <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                {locale === 'en' ? 'Loading audio...' : 'Загрузка аудио...'}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-xs">
                {locale === 'en' ? `Trying source ${currentSourceIndex + 1}` : `Попытка источника ${currentSourceIndex + 1}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center gap-4 mb-4">
        {/* Previous Verse */}
        <button
          onClick={previousVerse}
          disabled={verseNumber <= 1}
          className={cn(
            "p-2 rounded-full transition-colors",
            verseNumber <= 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <SkipBack size={20} />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className={cn(
            "flex items-center justify-center w-12 h-12 text-white rounded-full transition-colors",
            isLoading 
              ? "bg-gray-400 cursor-not-allowed"
              : error
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          )}
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={24} />
          ) : (
            <Play size={24} className="ml-1" />
          )}
        </button>

        {/* Next Verse */}
        <button
          onClick={nextVerse}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <SkipForward size={20} />
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setAudioVolume(audioVolume > 0 ? 0 : 1)}
            className="p-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
          >
            {audioVolume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={audioVolume}
            onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
        >
          <div
            className={cn(
              "absolute top-0 left-0 h-full rounded-full transition-all duration-150",
              error ? "bg-red-500" : "bg-blue-500"
            )}
            style={{ width: `${progressPercentage}%` }}
          />
          <div
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
              error ? "bg-red-500" : "bg-blue-500"
            )}
            style={{ left: `calc(${progressPercentage}% - 8px)` }}
          />
        </div>

        {/* Time Display */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Speed Control */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {locale === 'en' ? 'Speed' : 'Скорость'}
        </span>
        <div className="flex items-center gap-2">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
            <button
              key={speed}
              onClick={() => setAudioSpeed(speed)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                audioSpeed === speed
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Audio Status */}
      {!error && !isLoading && duration > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {locale === 'en' ? 'Reciter' : 'Чтец'}: {audioReciter.replace('ar.', '').replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span>
              {locale === 'en' ? `Source ${currentSourceIndex + 1}` : `Источник ${currentSourceIndex + 1}`}
            </span>
          </div>
        </div>
      )}

      {/* Audio Visualizer (when playing) */}
      {isPlaying && !error && (
        <div className="flex justify-center mt-3">
          <div className="flex items-end gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1 bg-blue-500 rounded-full animate-pulse"
                style={{ 
                  height: `${Math.random() * 16 + 8}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;