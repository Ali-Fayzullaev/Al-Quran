// lib/translations.ts
export type Locale = 'ru' | 'en' | 'uz';

export const translations = {
  ru: {
    // Основные
    title: "Коран AI",
    plannerTitle: "Планировщик изучения",
    welcome: "Добро пожаловать в Коран AI",
    language: "Язык",
    theme: "Тема",
    home: "Главная",
    surahs: "Суры",
    juz: "Джуз",
    search: "Поиск",
    bookmarks: "Закладки",
    settings: "Настройки",
    menu: "Меню",
    close: "Закрыть",
    
    // Навигация
    quranReading: "Чтение Корана",
    journey: "Путешествие",
    aiHelperNav: "AI Помощник",
    duaDhikriNav: "Дуа и Зикр",
    feedback: "Обратная связь",
    
    // Категории
    main: "Основное",
    learning: "Обучение", 
    tools: "Инструменты",
    settingsCategory: "Настройки",
    
    // Дополнительные ключи
    inTheNameOfAllah: "Во имя Аллаха",
    islamicLearningPlatform: "Платформа изучения ислама",
    themes: "Темы",
    quiz: "Викторина",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    
    // Live Streams
    liveStreams: {
      nav: "Духовный центр"
    },
    
    // Mosque Finder
    mosqueFinder: "Поиск мечетей",
    
    // Home page
    bestQuranExperience: "Лучший опыт изучения Корана",
    heroDescription: "Изучайте Священный Коран с переводами, толкованиями и аудио на русском, английском и узбекском языках",
    searchPlaceholder: "Поиск сур, аятов или слов...",
    verseOfTheDay: "Аят дня",
    verse: "Аят",
    page: "Страница",
    verses: "Аяты",
    pages: "Страницы",
    exploreKnowledge: "Исследуйте знания",
    accessCompleteQuran: "Получите доступ к полному Корану с переводами",
    holyQuran: "Священный Коран",
    holyQuranDescription: "Читайте полный текст Корана с переводами",
    startReading: "Начать чтение",
    hadithCollections: "Коллекции хадисов",
    hadithDescription: "Изучайте хадисы от великих ученых",
    dailyDuas: "Ежедневные дуа",
    dailyDuasDescription: "Изучайте и практикуйте ежедневные молитвы",
    comingSoon: "Скоро",
    popularSurahs: "Популярные суры",
    mostReadChapters: "Наиболее читаемые главы Корана",
    viewAllSurahs: "Посмотреть все суры",
    findNearbyMosques: "Найдите мечети рядом с временем молитв",
    findNow: "Найти сейчас",

    // Additional keys for dua-dhikr pages
    saved: "Сохраненные",
    arabicText: "Арабский текст",
    arabicTextDesc: "Оригинальный арабский текст с правильным произношением",
    translations: "Переводы",
    translationsDesc: "Доступно на русском языке с подробными объяснениями",
    benefits: "Польза",
    benefitsDesc: "Узнайте о духовной пользе каждого дуа",
    morning: "Утром",
    evening: "Вечером",
    afterPrayer: "После намаза",
    daily: "Ежедневно",
    back: "Назад",
    loading: "Загрузка...",
    errorLoadingDuas: "Ошибка при загрузке дуа",
    noDuasFound: "Дуа не найдены",
    selectLanguage: "Выберите язык",
    totalDuas: "Всего дуа",
    duasCount: "Дуа",

    // AI Helper
    arabicTitle: "مساعد القرآن الذكي",
    smartQuranAssistant: "Умный помощник по Корану",
    aiHelperSubtitle: "Задавайте вопросы о Коране, исламе и религиозной практике. Получайте мудрые ответы с ссылками на священные тексты.",
    popularQuestions: "Популярные вопросы:",
    startConversation: "Начните разговор, задав вопрос или выбрав один из предложенных",
    askQuestion: "Введите ваш вопрос...",
    send: "Отправить",
    clearChat: "Очистить чат",
    thinking: "Думаю...",
    disclaimer: "Этот AI-помощник предоставляет информацию в образовательных целях. По важным религиозным вопросам консультируйтесь с квалифицированными учеными.",
    complexQuestion: "Сложный вопрос",
    complexQuestionDesc: "Наши ученые лично рассмотрят и ответят на ваш вопрос с подробным объяснением",
    yourContact: "Ваш контакт (телефон или email)",
    yourQuestion: "Ваш вопрос",
    submitQuestion: "Отправить вопрос",
    responseTime: "Мы ответим в течение 1-7 дней, ИншаАллах",
    questionSent: "Ваш вопрос успешно отправлен!",
    thankYou: "Спасибо за ваш вопрос. Наши ученые рассмотрят его и скоро ответят.",
    backToChat: "Назад к чату",
    contactPlaceholder: "Введите номер телефона или email",
    questionPlaceholder: "Опишите ваш вопрос подробно...",
    hadithQuote: "Каждый сын Адама совершает ошибки, но лучшие из совершающих ошибки - те, кто раскаивается.",
    cancel: "Отмена",
    sendingMessage: "Отправляем...",
    pleaseWait: "Подождите",
    
    // Dua Dhikr
    DuaDhikr: {
      title: "Дуа и Зикр",
      subtitle: "Священные молитвы и поминания Аллаха",
      viewAll: "Смотреть все",
      categories: {
        "morning-dhikr": "Утренний зикр",
        "evening-dhikr": "Вечерний зикр",
        "dhikr-after-salah": "Зикр после намаза",
        "daily-dua": "Ежедневные дуа",
        "selected-dua": "Избранные дуа"
      },
      descriptions: {
        "morning-dhikr": "Поминания Аллаха для начала дня с благословением",
        "evening-dhikr": "Вечерние зикры для защиты и умиротворения",
        "dhikr-after-salah": "Зикры и дуа после завершения намаза",
        "daily-dua": "Повседневные молитвы для всех жизненных ситуаций",
        "selected-dua": "Особые дуа от Корана и Сунны"
      }
    },
    
    // Предустановленные вопросы
    presetQuestion1: "Что означает Аль-Фатиха?",
    presetQuestion2: "Как правильно совершать намаз?", 
    presetQuestion3: "В чем мудрость поста в Рамадан?",
    presetQuestion4: "Что говорит Коран о терпении?",
    presetQuestion5: "Объясните значение 99 имен Аллаха",
    presetQuestion6: "Что такое Таухид в исламе?",
    presetQuestion7: "Какие дуа рекомендуется читать ежедневно?",
    presetQuestion8: "Расскажите о Пророке Мухаммаде (мир ему)",
    
    // Planner
    planner: {
      title: "Планировщик изучения Корана",
      subtitle: "Создавайте персональные планы изучения и отслеживайте свой прогресс",
      createPlan: "Создать план",
      myPlans: "Мои планы",
      todayTasks: "Задачи на сегодня",
      completed: "Выполнено",
      skip: "Пропустить",
      skipped: "Пропущено",
      pending: "Не выполнено",
      active: "Активный",
      paused: "Приостановлен",
      cancelled: "Отменен",
      statistics: "Статистика",
      currentStreak: "Текущая серия",
      longestStreak: "Лучшая серия",
      totalAyahs: "Всего аятов",
      totalTime: "Всего времени"
    }
  },
  
  en: {
    // Основные
    title: "Quran AI",
    plannerTitle: "Study Planner",
    welcome: "Welcome to Quran AI",
    language: "Language", 
    theme: "Theme",
    home: "Home",
    surahs: "Surahs",
    juz: "Juz",
    search: "Search",
    bookmarks: "Bookmarks",
    settings: "Settings",
    menu: "Menu",
    close: "Close",
    
    // Навигация
    quranReading: "Quran Reading",
    journey: "Journey",
    aiHelperNav: "AI Helper",
    duaDhikriNav: "Dua & Dhikr",
    feedback: "Feedback",
    
    // Категории
    main: "Main",
    learning: "Learning",
    tools: "Tools", 
    settingsCategory: "Settings",
    
    // Дополнительные ключи
    inTheNameOfAllah: "In the name of Allah",
    islamicLearningPlatform: "Islamic Learning Platform",
    themes: "Themes",
    quiz: "Quiz",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    
    // Live Streams
    liveStreams: {
      nav: "Spiritual Center"
    },
    
    // Mosque Finder
    mosqueFinder: "Find Mosques",
    
    // Home page
    bestQuranExperience: "Best Quran Learning Experience",
    heroDescription: "Study the Holy Quran with translations, interpretations and audio in Russian, English and Uzbek languages",
    searchPlaceholder: "Search surahs, verses or words...",
    verseOfTheDay: "Verse of the Day",
    verse: "Verse",
    page: "Page",
    verses: "Verses",
    pages: "Pages",
    exploreKnowledge: "Explore Knowledge",
    accessCompleteQuran: "Access the complete Quran with translations",
    holyQuran: "Holy Quran",
    holyQuranDescription: "Read the complete Quran text with translations",
    startReading: "Start Reading",
    hadithCollections: "Hadith Collections",
    hadithDescription: "Study hadiths from great scholars",
    dailyDuas: "Daily Duas",
    dailyDuasDescription: "Learn and practice daily prayers",
    comingSoon: "Coming Soon",
    popularSurahs: "Popular Surahs",
    mostReadChapters: "Most read chapters of the Quran",
    viewAllSurahs: "View All Surahs",
    findNearbyMosques: "Find nearby mosques with prayer times",
    findNow: "Find Now",

    // Additional keys for dua-dhikr pages
    saved: "Saved",
    arabicText: "Arabic Text",
    arabicTextDesc: "Original Arabic text with proper pronunciation",
    translations: "Translations",
    translationsDesc: "Available in English with detailed explanations",
    benefits: "Benefits",
    benefitsDesc: "Learn about the spiritual benefits of each dua",
    morning: "Morning",
    evening: "Evening",
    afterPrayer: "After Prayer",
    daily: "Daily",
    back: "Back",
    loading: "Loading...",
    errorLoadingDuas: "Error loading duas",
    noDuasFound: "No duas found",
    selectLanguage: "Select Language",
    totalDuas: "Total Duas",
    duasCount: "Duas",

    // AI Helper
    arabicTitle: "مساعد القرآن الذكي",
    smartQuranAssistant: "Smart Quran Assistant",
    aiHelperSubtitle: "Ask questions about Quran, Islam and religious practices. Get wise answers with references to sacred texts.",
    popularQuestions: "Popular Questions:",
    startConversation: "Start a conversation by asking a question or selecting one of the suggested ones",
    askQuestion: "Type your question...",
    send: "Send",
    clearChat: "Clear Chat",
    thinking: "Thinking...",
    disclaimer: "This AI assistant provides information for educational purposes. For important religious questions, consult qualified scholars.",
    complexQuestion: "Complex Question",
    complexQuestionDesc: "Our scholars will personally review and answer your question with detailed explanation",
    yourContact: "Your contact (phone or email)",
    yourQuestion: "Your question",
    submitQuestion: "Submit Question",
    responseTime: "We will respond within 1-7 days, InshaAllah",
    questionSent: "Your question has been sent successfully!",
    thankYou: "Thank you for your question. Our scholars will review it and respond soon.",
    backToChat: "Back to Chat",
    contactPlaceholder: "Enter your phone number or email",
    questionPlaceholder: "Describe your question in detail...",
    hadithQuote: "Every son of Adam makes mistakes, but the best of those who make mistakes are those who repent.",
    cancel: "Cancel",
    sendingMessage: "Sending...",
    pleaseWait: "Please wait",
    
    // Dua Dhikr
    DuaDhikr: {
      title: "Dua & Dhikr",
      subtitle: "Sacred prayers and remembrance of Allah",
      viewAll: "View All",
      categories: {
        "morning-dhikr": "Morning Dhikr",
        "evening-dhikr": "Evening Dhikr",
        "dhikr-after-salah": "Dhikr after Salah",
        "daily-dua": "Daily Duas",
        "selected-dua": "Selected Duas"
      },
      descriptions: {
        "morning-dhikr": "Remembrance of Allah to start your day with blessings",
        "evening-dhikr": "Evening dhikrs for protection and tranquility",
        "dhikr-after-salah": "Dhikrs and duas after completing prayer",
        "daily-dua": "Daily prayers for all life situations",
        "selected-dua": "Special duas from Quran and Sunnah"
      }
    },
    
    // Предустановленные вопросы
    presetQuestion1: "What does Al-Fatiha mean?",
    presetQuestion2: "How to perform prayer correctly?",
    presetQuestion3: "What is the wisdom of fasting in Ramadan?",
    presetQuestion4: "What does the Quran say about patience?",
    presetQuestion5: "Explain the meaning of 99 names of Allah",
    presetQuestion6: "What is Tawhid in Islam?",
    presetQuestion7: "What duas are recommended to recite daily?",
    presetQuestion8: "Tell me about Prophet Muhammad (peace be upon him)",
    
    // Planner
    planner: {
      title: "Quran Study Planner",
      subtitle: "Create personalized study plans and track your progress",
      createPlan: "Create Plan",
      myPlans: "My Plans",
      todayTasks: "Today's Tasks", 
      completed: "Completed",
      skip: "Skip",
      skipped: "Skipped",
      pending: "Pending",
      active: "Active",
      paused: "Paused",
      cancelled: "Cancelled",
      statistics: "Statistics",
      currentStreak: "Current Streak",
      longestStreak: "Longest Streak",
      totalAyahs: "Total Ayahs",
      totalTime: "Total Time"
    }
  },
  
  uz: {
    // Основные
    title: "Qur'on AI",
    plannerTitle: "O'rganish rejachisi",
    welcome: "Qur'on AI ga xush kelibsiz",
    language: "Til",
    theme: "Mavzu",
    home: "Bosh sahifa",
    surahs: "Suralar",
    juz: "Juz",
    search: "Qidiruv",
    bookmarks: "Xatcho'plar",
    settings: "Sozlamalar",
    menu: "Menyu",
    close: "Yopish",
    
    // Навигация
    quranReading: "Qur'on o'qish",
    journey: "Sayohat",
    aiHelperNav: "AI Yordamchi",
    duaDhikriNav: "Duo va Zikr",
    feedback: "Fikr-mulohaza",
    
    // Категории
    main: "Asosiy",
    learning: "O'rganish",
    tools: "Vositalar",
    settingsCategory: "Sozlamalar",
    
    // Дополнительные ключи
    inTheNameOfAllah: "Allah nomi bilan",
    islamicLearningPlatform: "Islomni o'rganish platformasi",
    themes: "Mavzular",
    quiz: "Viktorina",
    openMenu: "Menyuni ochish",
    closeMenu: "Menyuni yopish",
    
    // Live Streams
    liveStreams: {
      nav: "Ruhiy markaz"
    },
    
    // Mosque Finder
    mosqueFinder: "Masjid topish",
    
    // Home page
    bestQuranExperience: "Eng yaxshi Qur'on o'rganish tajribasi",
    heroDescription: "Muqaddas Qur'onni rus, ingliz va o'zbek tillarida tarjima, tafsir va audio bilan o'rganing",
    searchPlaceholder: "Suralar, oyatlar yoki so'zlarni qidirish...",
    verseOfTheDay: "Kun oyati",
    verse: "Oyat",
    page: "Sahifa",
    verses: "Oyatlar",
    pages: "Sahifalar",
    exploreKnowledge: "Bilimlarni o'rganing",
    accessCompleteQuran: "Tarjimalar bilan to'liq Qur'ondan foydalaning",
    holyQuran: "Muqaddas Qur'on",
    holyQuranDescription: "To'liq Qur'on matnini tarjimalar bilan o'qing",
    startReading: "O'qishni boshlash",
    hadithCollections: "Hadis to'plamlari",
    hadithDescription: "Buyuk olimlardan hadislarni o'rganing",
    dailyDuas: "Kundalik duolar",
    dailyDuasDescription: "Kundalik duolarni o'rganing va amal qiling",
    comingSoon: "Tez orada",
    popularSurahs: "Mashhur suralar",
    mostReadChapters: "Qur'onning eng ko'p o'qiladigan suralari",
    viewAllSurahs: "Barcha suralarni ko'rish",
    findNearbyMosques: "Namaz vaqtlari bilan yaqin masjidlarni toping",
    findNow: "Hozir topish",

    // Additional keys for dua-dhikr pages
    saved: "Saqlangan",
    arabicText: "Arab matni",
    arabicTextDesc: "To'g'ri talaffuz bilan asl arab matni",
    translations: "Tarjimalar",
    translationsDesc: "Batafsil tushuntirishlar bilan o'zbek tilida",
    benefits: "Foyda",
    benefitsDesc: "Har bir duoning ma'naviy foydasi haqida bilib oling",
    morning: "Ertalab",
    evening: "Kechqurun",
    afterPrayer: "Namozdan keyin",
    daily: "Kundalik",
    back: "Orqaga",
    loading: "Yuklanmoqda...",
    errorLoadingDuas: "Duolarni yuklashda xatolik",
    noDuasFound: "Duolar topilmadi",
    selectLanguage: "Tilni tanlang",
    totalDuas: "Jami duolar",
    duasCount: "Duolar",

    // AI Helper
    arabicTitle: "مساعد القرآن الذكي",
    smartQuranAssistant: "Aqlli Qur'on yordamchisi",
    aiHelperSubtitle: "Qur'on, Islam va diniy amallar haqida savollar bering. Muqaddas matnlarga havolalar bilan dono javoblarni oling.",
    popularQuestions: "Mashhur savollar:",
    startConversation: "Savol berish yoki taklif qilinganlardan birini tanlash orqali suhbatni boshlang",
    askQuestion: "Savolingizni yozing...",
    send: "Yuborish",
    clearChat: "Chatni tozalash",
    thinking: "O'ylayapman...",
    disclaimer: "Ushbu AI yordamchi ta'lim maqsadlari uchun ma'lumot beradi. Muhim diniy savollar bo'yicha malakali ulamo bilan maslahatlashing.",
    complexQuestion: "Murakkab savol",
    complexQuestionDesc: "Ulamolarimiz shaxsan ko'rib chiqadi va savolingizga batafsil tushuntirish bilan javob beradi",
    yourContact: "Aloqa ma'lumotlaringiz (telefon yoki email)",
    yourQuestion: "Savolingiz",
    submitQuestion: "Savol yuborish",
    responseTime: "1-7 kun ichida javob beramiz, InshaAlloh",
    questionSent: "Savolingiz muvaffaqiyatli yuborildi!",
    thankYou: "Savolingiz uchun rahmat. Ulamolarimiz uni ko'rib chiqib, tez orada javob berishadi.",
    backToChat: "Chatga qaytish",
    contactPlaceholder: "Telefon raqam yoki emailingizni kiriting",
    questionPlaceholder: "Savolingizni batafsil yozing...",
    hadithQuote: "Odam o'g'li xato qiladi, lekin xato qiluvchilarning eng yaxshilari tavba qiluvchilardir.",
    cancel: "Bekor qilish",
    sendingMessage: "Yuborilmoqda...",
    pleaseWait: "Iltimos kuting",
    
    // Dua Dhikr
    DuaDhikr: {
      title: "Duo va Zikr",
      subtitle: "Allohni eslash va muqaddas duolar",
      viewAll: "Barchasini ko'rish",
      categories: {
        "morning-dhikr": "Ertalabki zikr",
        "evening-dhikr": "Kechqurungi zikr",
        "dhikr-after-salah": "Namozdan keyin zikr",
        "daily-dua": "Kundalik duolar",
        "selected-dua": "Tanlangan duolar"
      },
      descriptions: {
        "morning-dhikr": "Kunni barakah bilan boshlash uchun Allohni eslash",
        "evening-dhikr": "Himoya va xotirjamlik uchun kechki zikrlar",
        "dhikr-after-salah": "Namozdan keyin qilinadigan zikr va duolar",
        "daily-dua": "Hayotning barcha holatlari uchun kundalik duolar",
        "selected-dua": "Qur'on va Sunnatdan maxsus duolar"
      }
    },
    
    // Предустановленные вопросы
    presetQuestion1: "Al-Fotiha nima degani?",
    presetQuestion2: "Namozni qanday to'g'ri o'qish kerak?",
    presetQuestion3: "Ramazon ro'zasining hikmati nimada?",
    presetQuestion4: "Qur'on sabr haqida nima deydi?",
    presetQuestion5: "Allohning 99 ismining ma'nosini tushuntiring",
    presetQuestion6: "Islamda Tavhid nima?",
    presetQuestion7: "Har kuni qanday duolarni o'qish tavsiya etiladi?",
    presetQuestion8: "Payg'ambar Muhammad (s.a.v.) haqida gapirib bering",
    
    // Planner
    planner: {
      title: "Qur'on o'rganish rejachisi",
      subtitle: "Shaxsiy o'rganish rejalarini yarating va taraqqiyotingizni kuzatib boring",
      createPlan: "Reja yaratish",
      myPlans: "Mening rejalarim",
      todayTasks: "Bugungi vazifalar",
      completed: "Bajarildi",
      skip: "O'tkazib yuborish",
      skipped: "O'tkazib yuborildi",
      pending: "Bajarilmadi",
      active: "Faol",
      paused: "To'xtatilgan",
      cancelled: "Bekor qilingan",
      statistics: "Statistika",
      currentStreak: "Joriy ketma-ketlik",
      longestStreak: "Eng uzun ketma-ketlik",
      totalAyahs: "Jami oyatlar",
      totalTime: "Jami vaqt"
    }
  }
} as const;

// Вспомогательные типы
export type TranslationKey = keyof typeof translations.ru;
export type NestedTranslationKey = {
  [K in TranslationKey]: typeof translations.ru[K] extends object 
    ? `${K}.${keyof typeof translations.ru[K] & string}`
    : K;
}[TranslationKey];

// Функция для получения перевода с поддержкой вложенных ключей
export function getTranslation(locale: Locale, key: string): string {
  const localeTranslations = translations[locale] || translations.ru;
  
  // Поддержка вложенных ключей типа "DuaDhikr.categories.morning-dhikr"
  if (key.includes('.')) {
    const keyParts = key.split('.');
    let current: any = localeTranslations;
    
    // Проходимся по всем частям ключа
    for (const part of keyParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        console.warn(`Translation key not found: ${key} at part: ${part}`);
        return key; // Если любая часть не найдена, возвращаем исходный ключ
      }
    }
    
    // Убеждаемся, что финальное значение - это строка
    if (typeof current === 'string') {
      return current;
    } else {
      console.error(`Translation value is not a string for key: ${key}`, current);
      return key;
    }
  }
  
  // Обычный ключ
  const value = (localeTranslations as any)[key];
  return typeof value === 'string' ? value : key;
}