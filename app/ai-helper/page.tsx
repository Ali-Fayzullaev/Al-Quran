// app/ai-helper/page.tsx
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocale } from "@/context/LocaleContext";

interface Message {
  id: string;
  content: string;
  type: "user" | "ai";
  timestamp: Date;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || "AIzaSyDF_Q-p6-QS93ckwRoiTQNbKE9qw8GNaOc";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const MAX_QUESTION_LENGTH = 500;
const MAX_RESPONSE_LENGTH = 2000;

// Интерфейс для переводов
interface Translations {
  [key: string]: {
    title: string;
    arabicTitle: string;
    subtitle: string;
    popularQuestions: string;
    startConversation: string;
    askQuestion: string;
    send: string;
    clearChat: string;
    thinking: string;
    disclaimer: string;
    complexQuestion: string;
    complexQuestionDesc: string;
    yourContact: string;
    yourQuestion: string;
    submitQuestion: string;
    responseTime: string;
    questionSent: string;
    thankYou: string;
    backToChat: string;
    contactPlaceholder: string;
    questionPlaceholder: string;
    hadithQuote: string;
    presetQuestions: string[];
  };
}

export default function AIHelperPage() {
  const { locale } = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitEndTime, setRateLimitEndTime] = useState<number | null>(null);

  // Состояние для формы сложных вопросов
  const [showComplexForm, setShowComplexForm] = useState(false);
  const [complexQuestion, setComplexQuestion] = useState("");
  const [contact, setContact] = useState("");
  const [isSubmittingComplex, setIsSubmittingComplex] = useState(false);
  const [complexFormSuccess, setComplexFormSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastRequestTime = useRef<number>(0);

  const MIN_REQUEST_DELAY = 2000;

  // Оптимизированный скролл без анимации
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Мемоизированные переводы
  const translations: Translations = useMemo(
    () => ({
      en: {
        title: "Smart Quran Assistant",
        arabicTitle: "مساعد القرآن الذكي",
        subtitle:
          "Ask questions about Quran, Islam and religious practices. Get wise answers with references to sacred texts.",
        popularQuestions: "Popular Questions:",
        startConversation:
          "Start a conversation by asking a question or selecting one of the suggested ones",
        askQuestion: "Ask your question about Quran or Islam...",
        send: "Send",
        clearChat: "Clear Chat",
        thinking: "Thinking...",
        disclaimer:
          "This AI assistant provides information for educational purposes. For important religious questions, consult qualified scholars.",
        complexQuestion: "If you have a complex question...",
        complexQuestionDesc:
          "Our scholars will personally review and answer your question with detailed explanation",
        yourContact: "Your contact (phone or email)",
        yourQuestion: "Your question",
        submitQuestion: "Submit Question",
        responseTime: "We will respond within 1-7 days, InshaAllah",
        questionSent: "Your question has been sent successfully!",
        thankYou:
          "Thank you for your question. Our scholars will review it and respond soon.",
        backToChat: "Back to Chat",
        contactPlaceholder: "Enter your phone number or email",
        questionPlaceholder: "Describe your question in detail...",
        hadithQuote:
          "Every son of Adam makes mistakes, but the best of those who make mistakes are those who repent.",
        presetQuestions: [
          "What does Al-Fatiha mean?",
          "How to perform prayer correctly?",
          "What is the wisdom of fasting in Ramadan?",
          "What does the Quran say about patience?",
          "Explain the meaning of 99 names of Allah",
          "What is Tawhid in Islam?",
          "What duas are recommended to recite daily?",
          "Tell me about Prophet Muhammad (peace be upon him)",
        ],
      },
      ru: {
        title: "Умный помощник по Корану",
        arabicTitle: "مساعد القرآن الذكي",
        subtitle:
          "Задавайте вопросы о Коране, исламе и религиозной практике. Получайте мудрые ответы с ссылками на священные тексты.",
        popularQuestions: "Популярные вопросы:",
        startConversation:
          "Начните разговор, задав вопрос или выбрав один из предложенных",
        askQuestion: "Задайте ваш вопрос о Коране или исламе...",
        send: "Отправить",
        clearChat: "Очистить чат",
        thinking: "Размышляю...",
        disclaimer:
          "Этот AI помощник предоставляет информацию в образовательных целях. Для важных религиозных вопросов обращайтесь к квалифицированным ученым.",
        complexQuestion: "Если у вас сложный вопрос...",
        complexQuestionDesc:
          "Наши ученые лично рассмотрят и ответят на ваш вопрос с подробным объяснением",
        yourContact: "Ваш контакт (телефон или почта)",
        yourQuestion: "Ваш вопрос",
        submitQuestion: "Отправить вопрос",
        responseTime: "Ответим в течение 1-7 дней, иншаАллах",
        questionSent: "Ваш вопрос успешно отправлен!",
        thankYou:
          "Спасибо за ваш вопрос. Наши ученые рассмотрят его и ответят в ближайшее время.",
        backToChat: "Вернуться к чату",
        contactPlaceholder: "Введите номер телефона или email",
        questionPlaceholder: "Опишите ваш вопрос подробно...",
        hadithQuote:
          "Каждый сын Адама совершает ошибки, но лучшие из ошибающихся — кающиеся.",
        presetQuestions: [
          "Что означает Аль-Фатиха?",
          "Как правильно читать намаз?",
          "В чем мудрость поста в Рамадан?",
          "Что говорит Коран о терпении?",
          "Объясни смысл 99 имен Аллаха",
          "Что такое таухид в исламе?",
          "Какие дуа рекомендуется читать ежедневно?",
          "Расскажи о пророке Мухаммаде (мир ему)",
        ],
      },
    }),
    []
  );

  const currentTranslations = translations[locale] || translations.en;

  const generateSystemPrompt = useCallback(() => {
    if (locale === "en") {
      return `You are a knowledgeable Islamic scholar and Quran assistant. Answer questions about the Quran, Islam, and religious practices with wisdom and understanding.

Rules:
1. Always respond with respect and kindness
2. Reference Quranic verses when appropriate
3. Give practical advice on Islamic life
4. Avoid controversial topics and extremism
5. Encourage learning and reflection
6. Respond in English
7. Limit your response to ${MAX_RESPONSE_LENGTH} characters
8. If the question is not related to Islam, politely redirect the conversation to Islamic topics

Remember: knowledge comes from Allah, and we are all learners.`;
    } else {
      return `Ты - знающий исламский ученый и помощник по Корану. Отвечай на вопросы о Коране, исламе и религиозной практике с мудростью и пониманием.

Правила:
1. Всегда отвечай с уважением и добротой
2. Ссылайся на аяты из Корана когда это уместно
3. Давай практические советы по исламской жизни
4. Избегай спорных тем и фанатизма
5. Поощряй изучение и размышление
6. Отвечай на русском языке
7. Ограничь ответ до ${MAX_RESPONSE_LENGTH} символов
8. Если вопрос не связан с исламом, вежливо перенаправь разговор на исламские темы

Помни: знание приходит от Аллаха, и мы все учимся.`;
    }
  }, [locale]);

  const sendQuestion = useCallback(
    async (questionText: string) => {
      if (!questionText.trim() || isLoading || isRateLimited) return;

      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;

      if (timeSinceLastRequest < MIN_REQUEST_DELAY) {
        const waitTime = MIN_REQUEST_DELAY - timeSinceLastRequest;
        setError(
          locale === "en"
            ? `Please wait ${Math.ceil(
                waitTime / 1000
              )} seconds before sending another question.`
            : `Пожалуйста, подождите ${Math.ceil(
                waitTime / 1000
              )} секунд перед отправкой следующего вопроса.`
        );
        return;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        content: questionText,
        type: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setQuestion("");
      setIsLoading(true);
      setError("");
      lastRequestTime.current = now;

      try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${generateSystemPrompt()}\n\n${
                      locale === "en" ? "User question" : "Вопрос пользователя"
                    }: ${questionText}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After");
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
            setIsRateLimited(true);
            setRateLimitEndTime(Date.now() + waitTime);
            throw new Error(
              locale === "en"
                ? `Rate limit exceeded. Please wait ${Math.ceil(
                    waitTime / 1000
                  )} seconds before trying again.`
                : `Превышен лимит запросов. Пожалуйста, подождите ${Math.ceil(
                    waitTime / 1000
                  )} секунд перед повторной попыткой.`
            );
          }
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.candidates?.[0]?.content) {
          throw new Error("Incomplete API response");
        }

        let aiResponse = data.candidates[0].content.parts[0].text;
        if (aiResponse.length > MAX_RESPONSE_LENGTH) {
          aiResponse = aiResponse.substring(0, MAX_RESPONSE_LENGTH) + "...";
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          type: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        console.error("API Error:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : locale === "en"
            ? "Sorry, an error occurred. Please try again."
            : "Извините, произошла ошибка. Попробуйте еще раз.";
        setError(errorMessage);

        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            locale === "en"
              ? "Sorry, I can't answer your question right now. This might be due to high demand. Please try again in a few moments."
              : "Извините, сейчас я не могу ответить на ваш вопрос. Возможно, это связано с высокой нагрузкой. Попробуйте через несколько минут.",
          type: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isRateLimited, locale, generateSystemPrompt]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendQuestion(question);
    },
    [question, sendQuestion]
  );

  const handlePresetQuestion = useCallback(
    (presetQuestion: string) => {
      sendQuestion(presetQuestion);
    },
    [sendQuestion]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError("");
  }, []);

  // Проверка rate limit
  useEffect(() => {
    if (isRateLimited && rateLimitEndTime) {
      const timer = setInterval(() => {
        if (Date.now() >= rateLimitEndTime) {
          setIsRateLimited(false);
          setRateLimitEndTime(null);
          setError("");
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRateLimited, rateLimitEndTime]);

  // Функция для отправки сложного вопроса
  const submitComplexQuestion = async () => {
    if (!contact.trim() || !complexQuestion.trim() || isSubmittingComplex)
      return;

    setIsSubmittingComplex(true);

    try {
      const response = await fetch('/api/send-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: contact.trim(),
          question: complexQuestion.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка отправки');
      }

      const result = await response.json();
      console.log('Вопрос успешно отправлен:', result);

      setComplexFormSuccess(true);
      setContact("");
      setComplexQuestion("");
    } catch (error) {
      console.error('Ошибка отправки вопроса:', error);
      setError(
        locale === "en"
          ? "Failed to send question. Please try again."
          : "Не удалось отправить вопрос. Попробуйте еще раз."
      );
    } finally {
      setIsSubmittingComplex(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-text)'
    }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl bb">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-lg"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          <h1 
            className="text-4xl font-bold mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            {currentTranslations.arabicTitle}
          </h1>

          <p 
            className="text-xl mb-4 font-medium"
            style={{ color: 'var(--color-text)' }}
          >
            {currentTranslations.title}
          </p>

          <p 
            className="max-w-2xl mx-auto leading-relaxed mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {currentTranslations.subtitle}
          </p>

          {/* Кнопка для сложных вопросов */}
          <div className="mt-6">
            <button
              onClick={() => setShowComplexForm(!showComplexForm)}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg shadow-lg transition-all duration-200 font-medium hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {currentTranslations.complexQuestion}
            </button>
          </div>
        </div>

        {/* Форма для сложных вопросов */}
        {showComplexForm && (
          <div 
            className="mb-8 rounded-xl p-8 shadow-lg border"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            {complexFormSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                  {currentTranslations.questionSent}
                </h3>
                <p 
                  className="mb-6"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {currentTranslations.thankYou}
                </p>
                <div 
                  className="p-4 rounded-lg border mb-6"
                  style={{ 
                    backgroundColor: 'var(--color-secondary)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  <p className="font-medium">
                    ⏰ {currentTranslations.responseTime}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setComplexFormSuccess(false);
                    setShowComplexForm(false);
                  }}
                  className="px-6 py-3 text-white rounded-lg transition-colors font-medium"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {currentTranslations.backToChat}
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <h3 
                    className="text-2xl font-bold mb-2"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    🎓 {currentTranslations.complexQuestion}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {currentTranslations.complexQuestionDesc}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {currentTranslations.yourContact}
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={currentTranslations.contactPlaceholder}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{ 
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                        '--tw-ring-color': 'var(--color-primary)'
                      } as React.CSSProperties}
                      disabled={isSubmittingComplex}
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {currentTranslations.yourQuestion}
                    </label>
                    <textarea
                      value={complexQuestion}
                      onChange={(e) => setComplexQuestion(e.target.value)}
                      placeholder={currentTranslations.questionPlaceholder}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors"
                      style={{ 
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                        '--tw-ring-color': 'var(--color-primary)'
                      } as React.CSSProperties}
                      rows={6}
                      disabled={isSubmittingComplex}
                    />
                  </div>

                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--color-secondary)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <div 
                      className="flex items-center gap-2"
                      style={{ color: 'var(--color-text)' }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">
                        ⏰ {currentTranslations.responseTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={() => setShowComplexForm(false)}
                      className="px-6 py-3 transition-colors font-medium"
                      style={{ color: 'var(--color-text-secondary)' }}
                      disabled={isSubmittingComplex}
                    >
                      {locale === "en" ? "Cancel" : "Отмена"}
                    </button>
                    <button
                      onClick={submitComplexQuestion}
                      disabled={
                        !contact.trim() ||
                        !complexQuestion.trim() ||
                        isSubmittingComplex
                      }
                      className="px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {isSubmittingComplex ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>
                            {locale === "en" ? "Sending..." : "Отправляем..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                          {currentTranslations.submitQuestion}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Предустановленные вопросы */}
        {messages.length === 0 && !showComplexForm && (
          <div className="mb-8">
            <h3 
              className="text-lg font-semibold mb-6 text-center"
              style={{ color: 'var(--color-text)' }}
            >
              {currentTranslations.popularQuestions}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentTranslations.presetQuestions.map((presetQ, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetQuestion(presetQ)}
                  disabled={isLoading}
                  className="p-4 text-left rounded-xl shadow-lg border transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  <span className="group-hover:opacity-80 leading-relaxed">
                    {presetQ}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Чат сообщения */}
        <div 
          className="rounded-xl shadow-lg mb-6 min-h-[400px] max-h-[600px] overflow-y-auto border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="p-6">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: 'var(--color-muted)' }}
                >
                  <svg 
                    className="w-10 h-10" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                  </svg>
                </div>
                <p 
                  className="text-lg"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {currentTranslations.startConversation}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div 
                      className={`max-w-[85%] p-5 rounded-2xl shadow-lg ${
                        message.type === "user"
                          ? "text-white ml-4 rounded-br-md"
                          : "border mr-4 rounded-bl-md"
                      }`}
                      style={message.type === "user" ? 
                        { backgroundColor: 'var(--color-primary)' } : 
                        { 
                          backgroundColor: 'var(--color-surface)', 
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)'
                        }
                      }
                    >
                      <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                        {message.content}
                      </p>
                      <div className={`text-xs mt-3 flex items-center gap-2 ${
                          message.type === "user" ? "text-white/70" : ""
                        }`}
                        style={message.type === "ai" ? { color: 'var(--color-text-secondary)' } : {}}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {message.timestamp.toLocaleTimeString(locale === "en" ? "en-US" : "ru-RU", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Индикатор загрузки */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div 
                      className="border p-5 rounded-2xl mr-4 rounded-bl-md shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <div 
                        className="flex items-center gap-2"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                        <span className="text-sm ml-2">{currentTranslations.thinking}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Форма ввода */}
        <form 
          onSubmit={handleSubmit} 
          className="rounded-xl shadow-lg p-6 border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
                placeholder={currentTranslations.askQuestion}
                className="w-full p-4 pr-16 border rounded-xl focus:ring-2 focus:outline-none resize-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-background-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  '--tw-ring-color': 'var(--color-primary)'
                } as React.CSSProperties}
                rows={3}
                disabled={isLoading}
                maxLength={MAX_QUESTION_LENGTH}
              />
              <div 
                className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-full border"
                style={{
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                {question.length}/{MAX_QUESTION_LENGTH}
              </div>
            </div>

            {error && (
              <div className="text-red-700 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={clearChat}
                className="px-4 py-2 transition-colors disabled:opacity-50 font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
                disabled={isLoading || messages.length === 0}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {currentTranslations.clearChat}
                </div>
              </button>

              <button
                type="submit"
                disabled={!question.trim() || isLoading}
                className="px-8 py-3 text-white rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{currentTranslations.thinking}</span>
                  </>
                ) : (
                  <>
                    <span>{currentTranslations.send}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Дисклеймер */}
        <div className="mt-8 text-center">
          <p 
            className="text-xs max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span 
              className="text-sm font-arabic"
              style={{ color: 'var(--color-text)' }}
            >
              بِسْمِ اللَّهِ
            </span>
            <br />
            {currentTranslations.disclaimer}
            <br />
            <span className="italic">{currentTranslations.hadithQuote}</span>
          </p>
        </div>
      </div>
    </div>
  );
}