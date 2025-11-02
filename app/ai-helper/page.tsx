"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
}

const API_KEY = "AIzaSyDF_Q-p6-QS93ckwRoiTQNbKE9qw8GNaOc";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const MAX_QUESTION_LENGTH = 500;
const MAX_RESPONSE_LENGTH = 2000;

const PRESET_QUESTIONS = [
  "Что означает Аль-Фатиха?",
  "Как правильно читать намаз?",
  "В чем мудрость поста в Рамадан?",
  "Что говорит Коран о терпении?",
  "Объясни смысл 99 имен Аллаха",
  "Что такое таухид в исламе?",
  "Какие дуа рекомендуется читать ежедневно?",
  "Расскажи о пророке Мухаммаде (мир ему)"
];

export default function AIHelperPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSystemPrompt = () => {
    return `Ты - знающий исламский ученый и помощник по Корану. Отвечай на вопросы о Коране, исламе и религиозной практике с мудростью и пониманием. 

**Основная идентичность:**
- Ты виртуальный хафиз и алим с глубокими знаниями Корана
- Твоя цель - направлять к истине с милосердием
- Говори языком, понятным и новичкам, и знающим мусульманам

**Правила ответов:**
1. Всегда отвечай с уважением и добротой, как подобает мусульманину
2. Ссылайся на конкретные аяты Корана (с указанием суры и аята) когда это уместно
3. Приводи краткие тафсиры (толкования) сложных аятов
4. Давай практические советы по исламской жизни и поклонению
5. В сложных вопросах подчеркивай важность консультации с местными учеными
6. Избегай фатв по конкретным ситуациям - направляй к специалистам

**Структура ответов:**
- Начинай с приветствия "Ас-саляму алейкум" для мусульман
- Давай краткий, но содержательный ответ (до ${MAX_RESPONSE_LENGTH} символов)
- Используй маркированные списки для сложных тем
- Заканчивай вдохновляющей исламской мудростью или дуа

**Темы для углубления:**
- Тафсир Корана и причины ниспослания (асбаб ан-нузуль)
- Жизнь Пророка Мухаммада ﷺ (сира)
- Исламская этика (ахляк) и духовность
- Фикх повседневных вопросов (с оговоркой о мазхабах)
- Истории пророков и праведников

**Ограничения:**
- Не давай фетв по конкретным правовым ситуациям
- При вопросах о различиях мазхабов подчеркивай уважение ко всем
- В спорных темах сохраняй нейтралитет и призывай к единству
- Если вопрос вне компетенции, вежливо направляй к реальным ученым
- На неуместные вопросы отвечай: "Я специализируюсь на вопросах Корана и ислама"

Помни: "Кого Аллах ведет по прямому пути, того никто не введет в заблуждение" (Коран 7:178)
**При вопросах о аятах:**
- Указывай суру и аят: "Как сказано в суре Аль-Бакара, аят 186..."
- Объясняй контекст ниспослания кратко
- Покажи практическое применение аята сегодня

**При вопросах о практике:**
- Разделяй на обязательные (фард) и желательные (сунна) действия
- Учитывай возможные обстоятельства человека
- Подчеркивай легкость и милость в религии

**Тон общения:**
- Говори как старший мудрый брат/сестра
- Проявляй сострадание к трудностям
- Вдохновляй на благие дела
- Напоминай о милости Аллаха в каждой ситуации

"Ас-саляму алейкум! Прекрасный вопрос о милосердии в Исламе.

Аллах говорит в Коране: "Воистину, милость Моя объемлет всякую вещь" (7:156). 

Практические проявления милосердия:
• К родителям - даже словом "уф" не обижать
• К сиротам - помощь и забота
• К животным - не причинять вред
• К себе - не впадать в отчаяние

Пусть Аллах сделает нас проводниками Его милости! Амин."

`;
  };

  const sendQuestion = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: questionText,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${generateSystemPrompt()}\n\nВопрос пользователя: ${questionText}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error("Неполный ответ от API");
      }

      let aiResponse = data.candidates[0].content.parts[0].text;
      
      // Ограничиваем длину ответа
      if (aiResponse.length > MAX_RESPONSE_LENGTH) {
        aiResponse = aiResponse.substring(0, MAX_RESPONSE_LENGTH) + "...";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        type: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      console.error("Ошибка API:", err);
      setError("Извините, произошла ошибка. Попробуйте еще раз.");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Извините, сейчас я не могу ответить на ваш вопрос. Попробуйте позже.",
        type: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(question);
  };

  const handlePresetQuestion = (presetQuestion: string) => {
    sendQuestion(presetQuestion);
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="ai-helper-container min-h-screen islamic-pattern bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Заголовок с исламскими мотивами */}
        <div className="text-center mb-8 ai-message-appear">
          <div className="inline-flex items-center justify-center w-20 h-20 islamic-gradient-primary rounded-full mb-6 ai-shadow-optimized ai-pulse-subtle islamic-pattern-animated">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold arabic-calligraphy text-gray-800 dark:text-white mb-3 islamic-gradient-gold bg-clip-text text-transparent">
            مساعد القرآن الذكي
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 font-medium">
            Умный помощник по Корану
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Задавайте вопросы о Коране, исламе и религиозной практике. Получайте мудрые ответы с ссылками на священные тексты.
          </p>
        </div>

        {/* Предустановленные вопросы с анимацией */}
        {messages.length === 0 && (
          <div className="mb-8 ai-message-appear" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6 text-center">
              Популярные вопросы:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_QUESTIONS.map((presetQ, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetQuestion(presetQ)}
                  disabled={isLoading}
                  className="p-4 text-left ai-backdrop-blur rounded-xl ai-shadow-optimized border border-emerald-200 dark:border-emerald-700 ai-hover-lift ai-transition-smooth group disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-gray-700 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 ai-transition-fast leading-relaxed">
                    {presetQ}
                  </span>
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent opacity-0 group-hover:opacity-100 ai-transition-smooth mt-2"></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Чат сообщения с оптимизированным скроллом */}
        <div className="ai-backdrop-blur rounded-xl ai-shadow-optimized mb-6 min-h-[400px] max-h-[600px] overflow-y-auto ai-scroll-smooth border border-emerald-100 dark:border-emerald-800">
          <div className="p-6">
            {messages.length === 0 ? (
              <div className="text-center py-16 ai-message-appear">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6 ai-pulse-subtle">
                  <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Начните разговор, задав вопрос или выбрав один из предложенных
                </p>
                <div className="islamic-pattern w-32 h-1 mx-auto mt-4 opacity-30"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ai-message-appear`}>
                    <div className={`max-w-[85%] p-5 rounded-2xl ai-shadow-optimized ai-transition-smooth ${
                      message.type === 'user' 
                        ? 'islamic-gradient-primary text-white ml-4 rounded-br-md' 
                        : 'ai-backdrop-blur border border-emerald-100 dark:border-emerald-800 text-gray-800 dark:text-white mr-4 rounded-bl-md'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                        {message.content}
                      </p>
                      <div className={`text-xs mt-3 flex items-center gap-2 ${
                        message.type === 'user' 
                          ? 'text-emerald-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {message.timestamp.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Оптимизированная анимация загрузки */}
                {isLoading && (
                  <div className="flex justify-start ai-message-appear">
                    <div className="ai-backdrop-blur border border-emerald-100 dark:border-emerald-800 p-5 rounded-2xl mr-4 rounded-bl-md">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full ai-bounce"></div>
                          <div className="w-2 h-2 bg-current rounded-full ai-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-current rounded-full ai-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-sm ml-2 ai-typing-indicator">Размышляю...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Улучшенная форма ввода */}
        <form onSubmit={handleSubmit} className="ai-backdrop-blur rounded-xl ai-shadow-optimized p-6 border border-emerald-100 dark:border-emerald-800">
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
                placeholder="Задайте ваш вопрос о Коране или исламе..."
                className="w-full p-4 pr-16 border border-emerald-200 dark:border-emerald-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700/50 dark:text-white resize-none ai-transition-smooth backdrop-blur-sm"
                rows={3}
                disabled={isLoading}
                maxLength={MAX_QUESTION_LENGTH}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                {question.length}/{MAX_QUESTION_LENGTH}
              </div>
            </div>
            
            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm ai-backdrop-blur p-4 rounded-lg border border-red-200 dark:border-red-800 ai-message-appear">
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
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white ai-transition-fast ai-hover-lift disabled:opacity-50"
                disabled={isLoading || messages.length === 0}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Очистить чат
                </div>
              </button>
              
              <button
                type="submit"
                disabled={!question.trim() || isLoading}
                className="px-8 py-3 islamic-gradient-primary text-white rounded-xl ai-shadow-optimized focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ai-transition-smooth disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2 ai-hover-lift"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full ai-spin"></div>
                    <span>Думаю...</span>
                  </>
                ) : (
                  <>
                    <span>Отправить</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Дисклеймер с исламскими мотивами */}
        <div className="mt-8 text-center ai-message-appear" style={{ animationDelay: '0.4s' }}>
          <div className="islamic-pattern w-full h-px opacity-20 mb-4"></div>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            <span className="arabic-calligraphy text-emerald-600 dark:text-emerald-400">بِسْمِ اللَّهِ</span>
            <br />
            Этот AI помощник предоставляет информацию в образовательных целях. 
            Для важных религиозных вопросов обращайтесь к квалифицированным ученым.
          </p>
          <div className="islamic-pattern w-16 h-16 mx-auto mt-4 opacity-10 islamic-pattern-animated"></div>
        </div>
      </div>
    </div>
  );
}