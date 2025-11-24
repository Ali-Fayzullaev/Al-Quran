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

// Увеличиваем минимальную задержку между запросами для соблюдения лимитов Google Gemini
const MIN_REQUEST_DELAY = 10000; // 10 секунд между запросами (безопасный интервал)
const MAX_RETRIES = 2; // Уменьшаем количество попыток
const INITIAL_RETRY_DELAY = 5000; // Увеличиваем начальную задержку до 5 секунд

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
  const { locale, t } = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitEndTime, setRateLimitEndTime] = useState<number | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState("");

  // Состояние для формы сложных вопросов
  const [showComplexForm, setShowComplexForm] = useState(false);
  const [complexQuestion, setComplexQuestion] = useState("");
  const [contact, setContact] = useState("");
  const [isSubmittingComplex, setIsSubmittingComplex] = useState(false);
  const [complexFormSuccess, setComplexFormSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastRequestTime = useRef<number>(0);

  // Оптимизированный скролл без анимации
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Предустановленные вопросы
  const presetQuestions = [
    t('presetQuestion1'),
    t('presetQuestion2'), 
    t('presetQuestion3'),
    t('presetQuestion4'),
    t('presetQuestion5'),
    t('presetQuestion6'),
    t('presetQuestion7'),
    t('presetQuestion8')
  ];

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

  // Функция для ожидания с exponential backoff
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Функция для выполнения запроса с более консервативным rate limiting
  const makeAPIRequest = async (requestBody: any, retries = 0): Promise<any> => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    
    // Проверяем минимальную задержку между запросами
    if (timeSinceLastRequest < MIN_REQUEST_DELAY) {
      const waitTime = MIN_REQUEST_DELAY - timeSinceLastRequest;
      console.log(`Waiting ${waitTime}ms before making request (rate limiting)`);
      
      // Показываем пользователю, что нужно подождать
      setIsRateLimited(true);
      setRateLimitEndTime(now + waitTime);
      setRateLimitMessage(
        locale === "en" 
          ? `Please wait ${Math.ceil(waitTime / 1000)} seconds before making a request.` 
          : `Подождите ${Math.ceil(waitTime / 1000)} секунд перед отправкой запроса.`
      );
      
      await sleep(waitTime);
      
      // Сбрасываем rate limit после ожидания
      setIsRateLimited(false);
      setRateLimitEndTime(null);
      setRateLimitMessage("");
    }

    lastRequestTime.current = Date.now();

    try {
      console.log(`Making API request (attempt ${retries + 1}/${MAX_RETRIES + 1})`);
      
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log(`API response status: ${response.status}`);

      if (response.status === 429) {
        console.log('Rate limit hit, status 429');
        
        // Rate limit exceeded
        if (retries < MAX_RETRIES) {
          const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
          console.log(`Rate limited. Retrying in ${retryDelay}ms... (attempt ${retries + 1}/${MAX_RETRIES})`);
          
          // Устанавливаем состояние rate limit с более длительным ожиданием
          const waitUntil = Date.now() + retryDelay;
          setIsRateLimited(true);
          setRateLimitEndTime(waitUntil);
          setRateLimitMessage(
            locale === "en" 
              ? `Rate limited. Retrying in ${Math.ceil(retryDelay / 1000)} seconds...` 
              : `Превышен лимит. Повторная попытка через ${Math.ceil(retryDelay / 1000)} секунд...`
          );
          
          await sleep(retryDelay);
          return makeAPIRequest(requestBody, retries + 1);
        } else {
          // Все попытки исчерпаны - блокируем на более длительное время
          console.log('All retry attempts exhausted');
          setIsRateLimited(true);
          setRateLimitEndTime(Date.now() + 300000); // Блокируем на 5 минут
          setRateLimitMessage(
            locale === "en"
              ? "API rate limit exceeded. Please wait 5 minutes before trying again."
              : "Превышен лимит запросов API. Подождите 5 минут перед следующей попыткой."
          );
          throw new Error("Rate limit exceeded after maximum retries");
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      // Успешный запрос - сбрасываем rate limit состояние
      setIsRateLimited(false);
      setRateLimitEndTime(null);
      setRateLimitMessage("");

      const result = await response.json();
      console.log('API request successful');
      return result;
    } catch (error) {
      console.error('API request error:', error);
      
      if (retries < MAX_RETRIES && error instanceof Error && !error.message.includes("Rate limit exceeded")) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
        console.log(`Request failed. Retrying in ${retryDelay}ms... (attempt ${retries + 1}/${MAX_RETRIES})`);
        await sleep(retryDelay);
        return makeAPIRequest(requestBody, retries + 1);
      }
      throw error;
    }
  };

  const sendQuestion = useCallback(
    async (questionText: string) => {
      if (!questionText.trim() || isLoading || isRateLimited) return;
  
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
  
      try {
        const requestBody = {
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
        };

        const data = await makeAPIRequest(requestBody);
  
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
        
        let errorMessage: string;
        if (err instanceof Error && err.message.includes("Rate limit exceeded")) {
          errorMessage = rateLimitMessage || (
            locale === "en"
              ? "Too many requests. Please wait before trying again."
              : "Слишком много запросов. Подождите перед следующей попыткой."
          );
        } else {
          errorMessage = locale === "en"
            ? "Sorry, an error occurred. Please try again later."
            : "Извините, произошла ошибка. Попробуйте позже.";
        }
        
        setError(errorMessage);
  
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: errorMessage,
          type: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isRateLimited, locale, generateSystemPrompt, rateLimitMessage]
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
        const now = Date.now();
        if (now >= rateLimitEndTime) {
          setIsRateLimited(false);
          setRateLimitEndTime(null);
          setRateLimitMessage("");
          setError("");
        } else {
          const remainingTime = Math.ceil((rateLimitEndTime - now) / 1000);
          const message = locale === "en" 
            ? `Please wait ${remainingTime} seconds before making another request.`
            : `Подождите ${remainingTime} секунд перед следующим запросом.`;
          setRateLimitMessage(message);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRateLimited, rateLimitEndTime, locale]);

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
            {t('arabicTitle')}
          </h1>

          <p 
            className="text-xl mb-4 font-medium"
            style={{ color: 'var(--color-text)' }}
          >
            {t('smartQuranAssistant')}
          </p>

          <p 
            className="max-w-2xl mx-auto leading-relaxed mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {t('aiHelperSubtitle')}
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
              {t('complexQuestion')}
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
                  {t('questionSent')}
                </h3>
                <p 
                  className="mb-6"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {t('thankYou')}
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
                    ⏰ {t('responseTime')}
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
                  {t('backToChat')}
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <h3 
                    className="text-2xl font-bold mb-2"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    🎓 {t('complexQuestion')}
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {t('complexQuestionDesc')}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {t('yourContact')}
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={t('contactPlaceholder')}
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
                      {t('yourQuestion')}
                    </label>
                    <textarea
                      value={complexQuestion}
                      onChange={(e) => setComplexQuestion(e.target.value)}
                      placeholder={t('questionPlaceholder')}
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
                        ⏰ {t('responseTime')}
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
                      {t('cancel')}
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
                            {t('sendingMessage')}
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
                          {t('submitQuestion')}
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
              {t('popularQuestions')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presetQuestions.map((presetQ, index) => (
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
                  {t('startConversation')}
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
                        {message.timestamp.toLocaleTimeString(locale === "en" ? "en-US" : locale === "ru" ? "ru-RU" : "uz-UZ", { hour: "2-digit", minute: "2-digit" })}
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
                        <span className="text-sm ml-2">{t('thinking')}</span>
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
                placeholder={t('askQuestion')}
                className="w-full p-4 pr-16 border rounded-xl focus:ring-2 focus:outline-none resize-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-background-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  '--tw-ring-color': 'var(--color-primary)'
                } as React.CSSProperties}
                rows={3}
                disabled={isLoading || isRateLimited}
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

            {/* Rate limit предупреждение */}
            {isRateLimited && rateLimitMessage && (
              <div className="text-orange-700 dark:text-orange-400 text-sm bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6z" clipRule="evenodd" />
                  </svg>
                  {rateLimitMessage}
                </div>
              </div>
            )}

            {error && !rateLimitMessage && (
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
                  {t('clearChat')}
                </div>
              </button>

              <button
                type="submit"
                disabled={!question.trim() || isLoading || isRateLimited}
                className="px-8 py-3 text-white rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t('thinking')}</span>
                  </>
                ) : isRateLimited ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{t('pleaseWait')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('send')}</span>
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
            {t('disclaimer')}
            <br />
            <span className="italic">{t('hadithQuote')}</span>
          </p>
        </div>
      </div>
    </div>
  );
}