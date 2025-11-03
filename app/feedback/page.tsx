"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

interface FeedbackForm {
  type: FeedbackType;
  title: string;
  description: string;
}

export default function FeedbackPage() {
  const { locale } = useLocale();
  const [form, setForm] = useState<FeedbackForm>({
    type: 'bug',
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    en: {
      title: "Feedback & Support",
      arabicTitle: "الملاحظات والدعم",
      subtitle: "Help us improve by reporting bugs or suggesting new features",
      bugReport: "🐛 Bug Report",
      featureRequest: "✨ Feature Request", 
      improvement: "🔧 Improvement",
      other: "💬 Other",
      feedbackType: "Feedback Type",
      issueTitle: "Issue/Suggestion Title",
      description: "Detailed Description",
      submitFeedback: "Submit Feedback",
      successTitle: "Thank you for your feedback!",
      successMessage: "We have received your message and will review it soon. Your input helps us make the site better!",
      backToSite: "Back to Site",
      descriptionPlaceholder: "Please describe the issue or your suggestion in detail...",
      titlePlaceholder: "Brief summary of the issue or request",
    },
    ru: {
      title: "Обратная связь и поддержка",
      arabicTitle: "الملاحظات والدعم", 
      subtitle: "Помогите нам улучшить сайт, сообщив об ошибках или предложив новые функции",
      bugReport: "🐛 Сообщить об ошибке",
      featureRequest: "✨ Предложить функцию",
      improvement: "🔧 Улучшение",
      other: "💬 Другое",
      feedbackType: "Тип обращения",
      issueTitle: "Заголовок проблемы/предложения",
      description: "Подробное описание",
      submitFeedback: "Отправить отзыв",
      successTitle: "Спасибо за ваш отзыв!",
      successMessage: "Мы получили ваше сообщение и скоро его рассмотрим. Ваши замечания помогают нам делать сайт лучше!",
      backToSite: "Вернуться на сайт",
      descriptionPlaceholder: "Пожалуйста, опишите проблему или ваше предложение подробно...",
      titlePlaceholder: "Краткое описание проблемы или запроса",
    }
  };

  const currentTranslations = translations[locale as keyof typeof translations] || translations.ru;

  const handleInputChange = (field: keyof FeedbackForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const submitFeedback = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError(locale === 'en' ? 'Please fill in all required fields' : 'Пожалуйста, заполните все обязательные поля');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const typeEmoji = form.type === 'bug' ? '🐛' : form.type === 'feature' ? '✨' : form.type === 'improvement' ? '🔧' : '💬';
      
      const message = `${typeEmoji} Новое обращение от пользователя:

🏷️ Тип: ${currentTranslations[form.type as keyof typeof currentTranslations]}

📋 Заголовок: ${form.title}

📝 Описание:
${form.description}

⏰ Время: ${new Date().toLocaleString('ru-RU')}
🌐 Язык интерфейса: ${locale === 'en' ? 'Английский' : 'Русский'}`;

      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка отправки');
      }

      setIsSuccess(true);
      setForm({
        type: 'bug',
        title: '',
        description: ''
      });

    } catch (error) {
      setError(locale === 'en' ? 'Failed to send feedback. Please try again.' : 'Не удалось отправить отзыв. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen py-8"
      style={{ 
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)'
      }}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          <h1 
            className="text-4xl font-bold mb-6"
            style={{ color: 'var(--color-primary)' }}
          >
            {currentTranslations.title}
          </h1>

          <p 
            className="max-w-2xl mx-auto leading-relaxed mb-8 text-lg"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {currentTranslations.subtitle}
          </p>
        </div>

        {isSuccess ? (
          // Страница успеха
          <div 
            className="max-w-2xl mx-auto text-center p-8 rounded-2xl shadow-lg"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
              {currentTranslations.successTitle}
            </h2>
            
            <p 
              className="mb-8 text-lg"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {currentTranslations.successMessage}
            </p>

            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 text-white rounded-lg transition-colors font-medium"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {currentTranslations.backToSite}
            </button>
          </div>
        ) : (
          <div className="p-8 rounded-2xl shadow-lg border"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="space-y-6">
              {/* Тип обращения */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-3"
                  style={{ color: 'var(--color-text)' }}
                >
                  {currentTranslations.feedbackType}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['bug', 'feature', 'improvement', 'other'] as FeedbackType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleInputChange('type', type)}
                      className={`p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                        form.type === type ? 'border-current' : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: form.type === type ? 'var(--color-secondary)' : 'var(--color-muted)',
                        color: form.type === type ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        borderColor: form.type === type ? 'var(--color-primary)' : 'var(--color-border)'
                      }}
                    >
                      {type === 'bug' ? currentTranslations.bugReport : 
                        type === 'feature' ? currentTranslations.featureRequest :
                        type === 'improvement' ? currentTranslations.improvement :
                        currentTranslations.other}
                    </button>
                  ))}
                </div>
              </div>

              {/* Заголовок */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {currentTranslations.issueTitle} *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={currentTranslations.titlePlaceholder}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as React.CSSProperties}
                  required
                />
              </div>

              {/* Описание */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {currentTranslations.description} *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={currentTranslations.descriptionPlaceholder}
                  rows={6}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as React.CSSProperties}
                  required
                />
              </div>

              {/* Ошибка */}
              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Кнопка отправки */}
              <button
                onClick={submitFeedback}
                disabled={isSubmitting || !form.title.trim() || !form.description.trim()}
                className="w-full px-8 py-4 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 text-lg"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{locale === 'en' ? 'Sending...' : 'Отправляем...'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {currentTranslations.submitFeedback}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}