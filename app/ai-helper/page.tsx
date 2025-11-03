"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocale } from "@/context/LocaleContext";

interface Message {
  id: string;
  content: string;
  type: "user" | "ai";
  timestamp: Date;
}

const API_KEY = "AIzaSyDF_Q-p6-QS93ckwRoiTQNbKE9qw8GNaOc";
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const MAX_QUESTION_LENGTH = 500;
const MAX_RESPONSE_LENGTH = 2000;

export default function AIHelperPage() {
  const { locale } = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitEndTime, setRateLimitEndTime] = useState<number | null>(null);
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
  const translations = useMemo(() => ({
    en: {
      title: "Smart Quran Assistant",
      arabicTitle: "مساعد القرآن الذكي",
      subtitle: "Ask questions about Quran, Islam and religious practices. Get wise answers with references to sacred texts.",
      popularQuestions: "Popular Questions:",
      startConversation: "Start a conversation by asking a question or selecting one of the suggested ones",
      askQuestion: "Ask your question about Quran or Islam...",
      send: "Send",
      clearChat: "Clear Chat",
      thinking: "Thinking...",
      disclaimer: "This AI assistant provides information for educational purposes. For important religious questions, consult qualified scholars.",
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
      subtitle: "Задавайте вопросы о Коране, исламе и религиозной практике. Получайте мудрые ответы с ссылками на священные тексты.",
      popularQuestions: "Популярные вопросы:",
      startConversation: "Начните разговор, задав вопрос или выбрав один из предложенных",
      askQuestion: "Задайте ваш вопрос о Коране или исламе...",
      send: "Отправить",
      clearChat: "Очистить чат",
      thinking: "Размышляю...",
      disclaimer: "Этот AI помощник предоставляет информацию в образовательных целях. Для важных религиозных вопросов обращайтесь к квалифицированным ученым.",
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
  }), []);

  const currentTranslations = translations[locale as keyof typeof translations] || translations.en;

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

  const sendQuestion = useCallback(async (questionText: string) => {
    if (!questionText.trim() || isLoading || isRateLimited) return;

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;

    if (timeSinceLastRequest < MIN_REQUEST_DELAY) {
      const waitTime = MIN_REQUEST_DELAY - timeSinceLastRequest;
      setError(
        locale === "en"
          ? `Please wait ${Math.ceil(waitTime / 1000)} seconds before sending another question.`
          : `Пожалуйста, подождите ${Math.ceil(waitTime / 1000)} секунд перед отправкой следующего вопроса.`
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
          contents: [{
            parts: [{ text: `${generateSystemPrompt()}\n\n${locale === "en" ? "User question" : "Вопрос пользователя"}: ${questionText}` }],
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
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
              ? `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`
              : `Превышен лимит запросов. Пожалуйста, подождите ${Math.ceil(waitTime / 1000)} секунд перед повторной попыткой.`
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
      const errorMessage = err instanceof Error ? err.message :
        locale === "en" ? "Sorry, an error occurred. Please try again." :
          "Извините, произошла ошибка. Попробуйте еще раз.";
      setError(errorMessage);

      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: locale === "en" ?
          "Sorry, I can't answer your question right now. This might be due to high demand. Please try again in a few moments." :
          "Извините, сейчас я не могу ответить на ваш вопрос. Возможно, это связано с высокой нагрузкой. Попробуйте через несколько минут.",
        type: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isRateLimited, locale, generateSystemPrompt]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(question);
  }, [question, sendQuestion]);

  const handlePresetQuestion = useCallback((presetQuestion: string) => {
    sendQuestion(presetQuestion);
  }, [sendQuestion]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Заголовок без тяжелых анимаций */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-emerald-600 w-20 h-20 rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-emerald-800 dark:text-white mb-3">
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 dark:from-yellow-400 dark:to-amber-500 bg-clip-text text-transparent">
              {currentTranslations.arabicTitle}
            </span>
          </h1>

          <p className="text-xl text-emerald-700 dark:text-gray-300 mb-4 font-medium">
            {currentTranslations.title}
          </p>

          <p className="text-sm text-emerald-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {currentTranslations.subtitle}
          </p>
        </div>

        {/* Предустановленные вопросы */}
        {messages.length === 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-gray-200 mb-6 text-center">
              {currentTranslations.popularQuestions}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentTranslations.presetQuestions.map((presetQ, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetQuestion(presetQ)}
                  disabled={isLoading}
                  className="p-4 text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-emerald-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 leading-relaxed">
                    {presetQ}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Чат сообщения */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg mb-6 min-h-[400px] max-h-[600px] overflow-y-auto border border-emerald-200 dark:border-emerald-800">
          <div className="p-6">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                  </svg>
                </div>
                <p className="text-emerald-700 dark:text-gray-400 text-lg">
                  {currentTranslations.startConversation}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-5 rounded-2xl shadow-lg ${
                        message.type === "user"
                          ? "bg-emerald-600 text-white ml-4 rounded-br-md"
                          : "bg-white dark:bg-gray-700 border border-emerald-200 dark:border-emerald-700 text-emerald-900 dark:text-white mr-4 rounded-bl-md"
                      }`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                        {message.content}
                      </p>
                      <div className={`text-xs mt-3 flex items-center gap-2 ${
                          message.type === "user" ? "text-emerald-100" : "text-emerald-600 dark:text-gray-400"
                        }`}>
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
                    <div className="bg-white dark:bg-gray-700 border border-emerald-200 dark:border-emerald-700 p-5 rounded-2xl mr-4 rounded-bl-md shadow-lg">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
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
        <form onSubmit={handleSubmit} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-emerald-200 dark:border-emerald-800">
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
                placeholder={currentTranslations.askQuestion}
                className="w-full p-4 pr-16 border border-emerald-300 dark:border-emerald-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50 dark:bg-gray-700 text-emerald-900 dark:text-white placeholder-emerald-600 dark:placeholder-gray-400 resize-none transition-colors"
                rows={3}
                disabled={isLoading}
                maxLength={MAX_QUESTION_LENGTH}
              />
              <div className="absolute bottom-3 right-3 text-xs text-emerald-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full border border-emerald-200 dark:border-gray-600">
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
                className="px-4 py-2 text-emerald-700 dark:text-gray-300 hover:text-emerald-900 dark:hover:text-white transition-colors disabled:opacity-50 font-medium"
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
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
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
          <p className="text-xs text-emerald-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            <span className="text-emerald-700 dark:text-emerald-400 text-sm">بِسْمِ اللَّهِ</span>
            <br />
            {currentTranslations.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
