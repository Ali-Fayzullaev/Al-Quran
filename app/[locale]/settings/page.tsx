'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-sm text-muted-foreground">Перенаправление...</span>
    </div>
  );
}
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all",
                  activeTab === id
                    ? "theme-bg-primary text-white shadow-lg"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Color Themes */}
        {activeTab === 'theme' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {locale === 'en' ? 'Appearance' : 'Внешний вид'}
              </h2>
            </div>

            <div className="space-y-8">
              {/* Dark Mode */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                  {locale === 'en' ? 'Display Mode' : 'Режим отображения'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'light', icon: Sun, label: t('lightMode') },
                    { id: 'dark', icon: Moon, label: t('darkMode') },
                    { id: 'system', icon: Monitor, label: t('systemMode') }
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setTheme(id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all border",
                        theme === id
                          ? "bg-green-500 text-white shadow-lg border-green-500"
                          : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{label}</span>
                      {theme === id && <Check size={16} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Site Color Theme */}
              <SiteColorThemeSelector
                title={t('siteTheme') || 'Цветовая тема сайта'}
                description="Выберите основную цветовую схему для интерфейса сайта"
              />

              {/* Quran Text Color Scheme */}
              <div>
                <ColorPicker
                  type="quran"
                  title={t('quranTextColor')}
                  description="Настройте цвета для арабского текста и переводов Корана"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Audio Settings */}
        {activeTab === 'audio' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <Headphones className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('audioSettings')}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reciter Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {t('selectReciterQari')}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllReciters(!showAllReciters)}
                    className="text-xs"
                  >
                    {showAllReciters 
                      ? (locale === 'en' ? 'Show Popular' : 'Популярные')
                      : (locale === 'en' ? 'Show All' : 'Все')
                    }
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={locale === 'en' ? 'Search reciters...' : 'Поиск чтецов...'}
                    value={reciterSearch}
                    onChange={(e) => setReciterSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Reciters List */}
                <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                  {filteredReciters.map((reciter) => (
                    <div
                      key={reciter.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer",
                        audioReciter === reciter.id
                          ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      )}
                      onClick={() => setAudioReciter(reciter.id)}
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{reciter.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{reciter.country}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {audioReciter === reciter.id && (
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (previewAudio === reciter.id && isPlaying) {
                              stopPreview();
                            } else {
                              previewReciter(reciter.id);
                            }
                          }}
                          className="p-1"
                        >
                          {previewAudio === reciter.id && isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio Controls */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('volume')}: {Math.round(audioVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('speed')}: {audioSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.25"
                    value={audioSpeed}
                    onChange={(e) => setAudioSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {t('autoplayNext')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {locale === 'en' ? 'Automatically play next verse' : 'Автоматически воспроизводить следующий аят'}
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      autoPlay ? "theme-bg-primary" : "bg-gray-300 dark:bg-gray-600"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        autoPlay ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Translation Settings */}
        {activeTab === 'translation' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <Languages className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('selectTranslations')}
              </h2>
            </div>

            {/* Quick Language Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">
                {locale === 'en' ? 'Quick Setup' : 'Быстрая настройка'}
              </h3>
              <div className="flex gap-2 flex-wrap">
                {[
                  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
                  { code: 'en', label: 'English', flag: '🇺🇸' },
                  { code: 'ar', label: 'العربية', flag: '🇸🇦' }
                ].map(({ code, label, flag }) => (
                  <Button
                    key={code}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickTranslations(code)}
                    className="flex items-center gap-2"
                  >
                    <span>{flag}</span>
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={locale === 'en' ? 'Search translations...' : 'Поиск переводов...'}
                value={translationSearch}
                onChange={(e) => setTranslationSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Translations by Language */}
            <div className="max-h-96 overflow-y-auto space-y-4">
              {Object.entries(filteredTranslationsByLanguage).map(([language, translations]) => (
                <div key={language} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 capitalize">
                    {language === 'arabic' ? 'العربية' : 
                     language === 'russian' ? 'Русский' :
                     language === 'english' ? 'English' : language}
                  </h4>
                  <div className="space-y-2">
                    {translations.map((translation) => (
                      <label
                        key={translation.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTranslations.includes(translation.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTranslations([...selectedTranslations, translation.id]);
                            } else {
                              setSelectedTranslations(selectedTranslations.filter(id => id !== translation.id));
                            }
                          }}
                          className="w-4 h-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{translation.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{translation.language}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reading Settings */}
        {activeTab === 'reading' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <Type className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('displaySettings')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('fontSizeLabel')} {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Display Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {t('showTranslation')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {locale === 'en' ? 'Show verse translations' : 'Показывать переводы аятов'}
                    </p>
                  </div>
                  <button
                    onClick={toggleTranslation}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      showTranslation ? "theme-bg-primary" : "bg-gray-300 dark:bg-gray-600"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        showTranslation ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {t('showTransliteration')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {locale === 'en' ? 'Show Arabic transliteration' : 'Показывать транслитерацию'}
                    </p>
                  </div>
                  <button
                    onClick={toggleTransliteration}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      showTransliteration ? "theme-bg-primary" : "bg-gray-300 dark:bg-gray-600"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        showTransliteration ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center gap-4"
      >
        <Button
          onClick={resetSettings}
          variant="outline"
          className="flex items-center gap-2 px-6 py-3"
        >
          <RotateCcw size={18} />
          {t('resetToDefault')}
        </Button>
        
        <Button className="flex items-center gap-2 theme-btn-primary px-6 py-3">
          <Save size={18} />
          {locale === 'en' ? 'Settings Saved' : 'Настройки сохранены'}
        </Button>
      </motion.div>

      {/* Settings Info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
        <div className="flex items-center justify-center gap-2 mb-2">
          <SettingsIcon className="w-4 h-4" />
          <span className="font-medium">
            {locale === 'en' ? 'Auto-Save Enabled' : 'Автосохранение включено'}
          </span>
        </div>
        <p>
          {locale === 'en' 
            ? 'All settings are automatically saved to your device and will persist across sessions.'
            : 'Все настройки автоматически сохраняются на вашем устройстве и сохранятся между сессиями.'
          }
        </p>
      </div>
    </div>
  );
}