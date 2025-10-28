"use client";

import { useJourneyStore } from '@/lib/journeyStore';
import { useQuranStore } from '@/lib/store';
import { useLocale } from '@/context/LocaleContext';
import { Trophy, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function JourneyAchievements() {
  const { locale } = useLocale();
  const { customButtonColor } = useQuranStore();
  const { achievements, stats } = useJourneyStore();

  const primaryColor = customButtonColor || '#10b981';

  const achievementsList = Object.values(achievements);
  const unlockedCount = achievementsList.filter(a => a.unlockedAt).length;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Trophy className="w-7 h-7" style={{ color: primaryColor }} />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fixed-text)' }}>
            {locale === 'en' ? 'Achievements' : 'Достижения'}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
            <div
              className="h-full transition-all duration-1000 rounded-full"
              style={{
                width: `${(unlockedCount / achievementsList.length) * 100}%`,
                backgroundColor: primaryColor,
              }}
            />
          </div>
          <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--fixed-text-secondary)' }}>
            {unlockedCount}/{achievementsList.length}
          </span>
        </div>
      </div>

      {/* Сетка достижений */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievementsList.map((achievement) => {
          const isUnlocked = !!achievement.unlockedAt;
          const unlockedDate = achievement.unlockedAt 
            ? new Date(achievement.unlockedAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'ru-RU')
            : null;

          return (
            <div
              key={achievement.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 p-6 transition-all",
                isUnlocked ? "hover:scale-105 hover:shadow-xl" : "opacity-60"
              )}
              style={{
                backgroundColor: isUnlocked ? 'var(--fixed-background)' : 'var(--fixed-background-secondary)',
                borderColor: isUnlocked ? primaryColor : 'var(--color-border)',
              }}
            >
              {/* Фоновый градиент для разблокированных */}
              {isUnlocked && (
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}80 100%)`,
                  }}
                />
              )}

              {/* Иконка достижения */}
              <div className="relative flex items-center justify-center mb-4">
                <div
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all",
                    isUnlocked ? "scale-100" : "scale-90 grayscale"
                  )}
                  style={{
                    backgroundColor: isUnlocked ? `${primaryColor}20` : 'var(--color-border)',
                  }}
                >
                  {achievement.icon}
                </div>

                {/* Статус бадж */}
                <div
                  className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2"
                  style={{
                    backgroundColor: isUnlocked ? primaryColor : 'var(--fixed-background-secondary)',
                    borderColor: 'var(--fixed-background)',
                  }}
                >
                  {isUnlocked ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Lock className="w-4 h-4" style={{ color: 'var(--fixed-text-muted)' }} />
                  )}
                </div>
              </div>

              {/* Информация */}
              <div className="space-y-2 text-center">
                <h3 className="font-bold text-lg" style={{ color: 'var(--fixed-text)' }}>
                  {locale === 'en' ? achievement.title.en : achievement.title.ru}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {locale === 'en' ? achievement.description.en : achievement.description.ru}
                </p>

                {/* Дата разблокировки */}
                {isUnlocked && unlockedDate && (
                  <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-xs" style={{ color: 'var(--fixed-text-muted)' }}>
                      {locale === 'en' ? 'Unlocked on' : 'Разблокировано'}: {unlockedDate}
                    </p>
                  </div>
                )}

                {/* Прогресс (для некоторых достижений) */}
                {!isUnlocked && achievement.progress !== undefined && achievement.requirement && (
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--fixed-text-secondary)' }}>
                      <span>{locale === 'en' ? 'Progress' : 'Прогресс'}</span>
                      <span>{achievement.progress}/{achievement.requirement}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${(achievement.progress / achievement.requirement) * 100}%`,
                          backgroundColor: primaryColor,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Эффект сияния для разблокированных */}
              {isUnlocked && (
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 70%)',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Мотивационное сообщение */}
      {unlockedCount < achievementsList.length && (
        <div
          className="p-6 rounded-2xl border-2 text-center"
          style={{
            backgroundColor: `${primaryColor}10`,
            borderColor: primaryColor,
          }}
        >
          <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: primaryColor }} />
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--fixed-text)' }}>
            {locale === 'en' 
              ? `${achievementsList.length - unlockedCount} achievements waiting for you!`
              : `${achievementsList.length - unlockedCount} достижений ждут вас!`
            }
          </p>
          <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en'
              ? 'Keep learning to unlock more achievements'
              : 'Продолжайте учиться, чтобы разблокировать больше достижений'
            }
          </p>
        </div>
      )}

      {/* Все разблокировано! */}
      {unlockedCount === achievementsList.length && (
        <div
          className="p-8 rounded-2xl border-2 text-center"
          style={{
            backgroundColor: `${primaryColor}10`,
            borderColor: primaryColor,
          }}
        >
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
            {locale === 'en' ? 'Master of the Journey!' : 'Мастер путешествия!'}
          </p>
          <p className="text-lg" style={{ color: 'var(--fixed-text)' }}>
            {locale === 'en'
              ? 'You have unlocked all achievements!'
              : 'Вы разблокировали все достижения!'
            }
          </p>
        </div>
      )}
    </div>
  );
}
