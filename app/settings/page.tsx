"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useQuranStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Volume2,
  Type,
  Globe,
  Book,
  Trash2,
  RefreshCw,
  Palette,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import ColorPicker from "@/components/ColorPicker";

export default function SettingsPage() {
  const { t, isLoading } = useLocale();
  const {
    audioReciter,
    selectedTranslations,
    setAudioReciter,
    setSelectedTranslations,
    fontSize,
    setFontSize,
    showTranslation,
    showTransliteration,
    toggleTranslation,
    toggleTransliteration,
    bookmarks,
  } = useQuranStore();

  const reciters = [
    { id: "ar.alafasy", name: "Mishary Rashid Alafasy" },
    { id: "ar.abdulbasitmurattal", name: "Abdul Basit Abd us-Samad" },
    { id: "ar.abdurrahmaansudais", name: "Abdul Rahman Al-Sudais" },
    { id: "ar.mahermuaiqly", name: "Maher Al Muaiqly" },
    { id: "ar.husary", name: "Mahmoud Khalil Al-Husary" },
  ];

  const translations = [
    { id: "en.sahih", name: "Sahih International", language: "English" },
    { id: "ru.kuliev", name: "Эльмир Кулиев", language: "Русский" },
    { id: "ru.osmanov", name: "М.-Н. О. Османов", language: "Русский" },
    { id: "en.yusufali", name: "Abdullah Yusuf Ali", language: "English" },
  ];

  const handleClearBookmarks = () => {
    if (window.confirm(t("confirmClearBookmarks"))) {
      // Удаляем все закладки по одной (так как нет clearBookmarks функции)
      bookmarks.forEach((bookmark) => {
        useQuranStore
          .getState()
          .removeBookmark(bookmark.surahNumber, bookmark.verseNumber);
      });
    }
  };

  const handleTranslationChange = (translationId: string) => {
    const currentTranslations = selectedTranslations;
    let newTranslations;

    if (currentTranslations.includes(translationId)) {
      // Удаляем перевод если он уже выбран
      newTranslations = currentTranslations.filter(
        (id) => id !== translationId
      );
    } else {
      // Добавляем перевод
      newTranslations = [...currentTranslations, translationId];
    }

    setSelectedTranslations(newTranslations);
  };

  // Показываем индикатор загрузки если переводы еще загружаются
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Загрузка настроек...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("settings")}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t("settingsDescription")}
        </p>
      </div>

      <div className="grid gap-8">
        {/* Языковые настройки */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("languageAndTheme")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t("selectLanguage")}
              </label>
              <LanguageToggle />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t("theme")}
              </label>
              <ThemeToggle />
            </div>
          </div>
        </section>

        {/* Цветовые настройки */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("colorSettings")}
            </h2>
          </div>

          <div className="space-y-8">
            {/* Тема сайта */}
            <div>
              <ColorPicker 
                type="site" 
                title={t("siteTheme")}
                description="Выберите цветовую схему для интерфейса приложения"
              />
            </div>

            {/* Цвета текста Корана */}
            <div>
              <ColorPicker 
                type="quran" 
                title={t("quranTextColor")}
                description="Настройте цвета для арабского текста и переводов Корана"
              />
            </div>
          </div>
        </section>

        {/* Аудио настройки */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <Volume2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("audioSettings")}
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t("selectReciter")}
            </label>
            <select
              value={audioReciter}
              onChange={(e) => setAudioReciter(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {reciters.map((reciter) => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Настройки отображения */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <Type className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("displaySettings")}
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t("selectTranslation")} ({t("selectMultipleTranslations")})
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {translations.map((translation) => (
                  <label
                    key={translation.id}
                    className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTranslations.includes(translation.id)}
                      onChange={() => handleTranslationChange(translation.id)}
                      className="w-4 h-4 text-green-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-green-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {translation.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {translation.language}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("fontSizeLabel")} {fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="32"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer range-slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    ((fontSize - 12) / (32 - 12)) * 100
                  }%, #e5e7eb ${
                    ((fontSize - 12) / (32 - 12)) * 100
                  }%, #e5e7eb 100%)`,
                }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={toggleTranslation}
                  className="w-4 h-4 text-green-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t("showTranslation")}
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={showTransliteration}
                  onChange={toggleTransliteration}
                  className="w-4 h-4 text-green-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t("showTransliteration")}
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Управление данными */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <Book className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("dataManagement")}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {t("bookmarks")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("bookmarksCount").replace(
                    "{{count}}",
                    bookmarks.length.toString()
                  )}
                </p>
              </div>
              <Button
                onClick={handleClearBookmarks}
                variant="outline"
                size="sm"
                disabled={bookmarks.length === 0}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("clearAll")}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {t("appCache")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("clearCacheDescription")}
                </p>
              </div>
              <Button
                onClick={() => {
                  if (window.confirm(t("confirmClearCache"))) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("clearCache")}
              </Button>
            </div>
          </div>
        </section>

        {/* Информация о приложении */}
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              {t("title")}
            </h3>
            <p className="text-green-600 dark:text-green-400 text-sm">
              {t("appDescription")}
            </p>
            <div className="mt-4 text-xs text-green-500 dark:text-green-500">
              {t("version")}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
