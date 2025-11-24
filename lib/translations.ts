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
      nav: "Духовный центр",
      title: "Прямые трансляции",
      subtitle: "Посмотрите прямые трансляции из самых священных мест Ислама, включая Масджид аль-Харам в Мекке и Масджид ан-Набави в Медине.",
      holyPlacesTitle: "🕌 Святые места",
      holyPlacesDescription: "Прямые трансляции из самых священных мест ислама",
      status: {
        live: "ПРЯМОЙ ЭФИР",
        offline: "ОФЛАЙН",
        official: "ОФИЦИАЛЬНО",
        lastUpdated: "ПОСЛЕДНЕЕ ОБНОВЛЕНИЕ",
        liveSignal: "Прямой сигнал",
        waiting: "Ожидание сигнала",
        currentViewers: "Зрителей сейчас"
      },
      actions: {
        refresh: "Обновить",
        refreshing: "Обновление...",
        openYoutube: "Открыть в YouTube"
      },
      locations: {
        mecca: {
          title: "Масджид аль-Харам, Мекка",
          description: "Прямая трансляция из самой священной мечети Ислама, окружающей Каабу. Наблюдайте за молитвами, Тавафом и другими ритуалами."
        },
        medina: {
          title: "Масджид ан-Набави, Медина",
          description: "Прямая трансляция из Мечети Пророка в Медине, где похоронен Пророк Мухаммад (мир ему). Посещайте молитвы и ритуалы."
        }
      }
    },
    
    // Prayer Times Display
    prayerTimes: {
      title: "Время намазов",
      subtitle: "Точное расписание молитв с учетом вашего местоположения",
      loading: "Определение времени намазов...",
      error: "Произошла ошибка при загрузке времени намазов",
      locationError: "Не удалось определить координаты",
      updated: "Обновлено",
      refresh: "Обновить",
      gps: "GPS",
      searchPlaceholder: "Поиск города...",
      searching: "Поиск...",
      find: "Найти",
      searchingCities: "Поиск городов...",
      noResults: 'Города не найдены для "{query}"',
      tryEnglish: "Попробуйте английские названия: Moscow, London, Istanbul, Dubai, Almaty",
      quickTests: "Быстрые тесты:",
      nextPrayer: "Следующий намаз",
      tomorrowPrayer: "Завтрашний намаз",
      timeLeft: "Осталось времени",
      hours: "часов",
      minutes: "минут",
      seconds: "секунд",
      tryAgain: "Попробовать снова",
      calculationMethod: "Метод расчета",
      detectLocation: "Определить местоположение",
      calculationInfo: "Информация о расчетах",
      info: {
        location: "Время рассчитывается с учетом вашего местоположения",
        method: "Используется метод расчета для вашего региона",
        autoUpdate: "Время обновляется автоматически",
        search: "Поиск доступен по названию города"
      },
      prayers: {
        fajr: "Фаджр",
        sunrise: "Восход",
        dhuhr: "Зухр",
        asr: "Аср",
        maghrib: "Магриб",
        isha: "Иша"
      },
      prayersEn: {
        fajr: "Fajr",
        sunrise: "Sunrise",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha"
      },
      cities: {
        moscow: "Москва",
        london: "Лондон",
        dubai: "Дубай",
        almaty: "Алматы"
      }
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
    waitingContent: "Пожалуйста, подождите, пока мы подготавливаем контент",
    retry: "Повторить",
    backToCategories: "Вернуться к категориям",

    sortBy: "Сортировать по",
    newest: "Новые",
    oldest: "Старые",
    category: "Категория",
    clearAll: "Очистить все",
    exportDuas: "Экспорт дуа",
    importDuas: "Импорт дуа",
    
    // Saved duas page
    savedDuas: "Сохраненные дуа",
    favoriteDuas: "любимых дуа",
    backToDuas: "Назад к дуа",
    export: "Экспорт",
    import: "Импорт",
    searchSavedDuas: "Поиск в сохраненных дуа...",
    allCategories: "Все категории",
    byDate: "По дате",
    byTitle: "По названию",
    byCategory: "По категории",
    copy: "Копировать",
    delete: "Удалить",
    notes: "Заметки",
    source: "Источник",

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
      },
      languageIndicator: "РУС",
      loadingContent: "Пожалуйста, подождите, пока мы подготавливаем контент",
      retry: "Повторить",
      backToCategories: "Вернуться к категориям",
      sortDefault: "По умолчанию",
      sortAlphabetical: "А-Я",
      progress: "Прогресс",
      categoryCompleted: "🎉 Категория завершена!",
      allDuasCompleted: "Все {total} дуа прочитаны! Машаллах!",
      remainingDuas: "Осталось {remaining} из {total} дуа",
      completed: "Завершено",
      remaining: "Осталось",
      almostDone: "🔥 Почти готово! Осталось {remaining} дуа!",
      globalSettings: "Глобальные настройки отображения",
      globalSettingsDescription: "Настройте какие поля будут показаны по умолчанию во всех карточках дуа.",
      transliteration: "Транслитерация",
      notes: "Заметки",
      benefits: "Польза",
      source: "Источник",
      defaultHidden: "По умолчанию скрыто",
      defaultVisible: "По умолчанию видимо",
      settings: "Настройки",
      searchPlaceholder: "Поиск дуа...",
      tip: "Совет",
      tipText: "Каждая карточка дуа имеет свои настройки. Нажмите на шестерёнку в карточке чтобы настроить отображение.",
      languageIndicatorText: "РУС",
      noResults: "Дуа не найдены",
      noResultsDescription: "Попробуйте изменить поисковые запросы или фильтры",
      clearSearch: "Очистить поиск",
      loadMoreDuas: "Загрузить больше дуа",
      statusReady: "🏆 Готово",
      statusAlmostDone: "🔥 Скоро",
      statusInProgress: "⚡ Идёт",
      statusStart: "📚 Начать"
    },
    
    // Переводы названий сур
    surahTranslations: {
      "Al-Fatiha": "Открывающая",
      "Al-Baqarah": "Корова",
      "Al-Kahf": "Пещера",
      "Ya-Sin": "Я Син",
      "Ar-Rahman": "Милостивый",
      "Al-Mulk": "Власть"
    },
    
    // Переводы для списка сур
    surahsList: {
      loading: "Загрузка сур...",
      error: "Ошибка загрузки сур",
      refreshPage: "Пожалуйста, обновите страницу",
      title: "Суры Священного Корана",
      description: "Полное собрание 114 сур Священного Корана с переводом на русский язык",
      searchPlaceholder: "Поиск сур...",
      filterAll: "Все",
      filterMeccan: "Мекканские",
      filterMedinan: "Мединские",
      sortNumber: "Номер",
      sortName: "Название",
      sortVerses: "Аяты",
      sortRevelation: "Откровение",
      verses: "аятов",
      noResults: "Суры не найдены",
      noResultsDesc: "Попробуйте с другими ключевыми словами поиска"
    },
    
    // Переводы для Quran Reader
    quranReader: {
      audioNotAvailableReciter: "Аудио недоступно для этого чтеца",
      audioNotAvailable: "Аудио недоступно",
      errorLoadingSurah: "Ошибка загрузки данных суры",
      loadingQuran: "Загрузка Корана...",
      preparingVerses: "Подготовка аятов для чтения",
      verses: "аятов",
      prev: "Пред",
      audio: "Аудио",
      next: "След",
      translation: "Перевод",
      settings: "Настройки"
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
    waitingContent: "Please wait while we prepare the content",
    retry: "Retry",
    backToCategories: "Back to Categories",

    sortBy: "Sort by",
    newest: "Newest",
    oldest: "Oldest",
    category: "Category",
    clearAll: "Clear All",
    exportDuas: "Export Duas",
    importDuas: "Import Duas",
    
    // Saved duas page
    savedDuas: "Saved Duas",
    favoriteDuas: "favorite duas",
    backToDuas: "Back to Duas",
    export: "Export",
    import: "Import",
    searchSavedDuas: "Search in saved duas...",
    allCategories: "All Categories",
    byDate: "By Date",
    byTitle: "By Title",
    byCategory: "By Category",
    copy: "Copy",
    delete: "Delete",
    notes: "Notes",
    source: "Source",

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
      },
      languageIndicator: "ENG",
      loadingContent: "Please wait while we prepare the content",
      retry: "Retry",
      backToCategories: "Back to Categories",
      sortDefault: "Default",
      sortAlphabetical: "A-Z",
      progress: "Progress",
      categoryCompleted: "🎉 Category Completed!",
      allDuasCompleted: "All {total} duas completed! Mashallah!",
      remainingDuas: "{remaining} out of {total} duas remaining",
      completed: "Completed",
      remaining: "Remaining",
      almostDone: "🔥 Almost done! {remaining} duas left!",
      globalSettings: "Global Display Settings",
      globalSettingsDescription: "Configure which fields will be shown by default in all dua cards.",
      transliteration: "Transliteration",
      notes: "Notes",
      benefits: "Benefits",
      source: "Source",
      defaultHidden: "Hidden by default",
      defaultVisible: "Visible by default",
      settings: "Settings",
      searchPlaceholder: "Search duas...",
      tip: "Tip",
      tipText: "Each dua card has its own settings. Click on the gear icon in the card to configure display.",
      languageIndicatorText: "ENG",
      noResults: "No duas found",
      noResultsDescription: "Try different search terms or filters",
      clearSearch: "Clear search",
      loadMoreDuas: "Load more duas",
      statusReady: "🏆 Ready",
      statusAlmostDone: "🔥 Almost",
      statusInProgress: "⚡ Going",
      statusStart: "📚 Start"
    },
    
    // Surah name translations
    surahTranslations: {
      "Al-Fatiha": "The Opening",
      "Al-Baqarah": "The Cow",
      "Al-Kahf": "The Cave",
      "Ya-Sin": "Ya-Sin",
      "Ar-Rahman": "The Beneficent",
      "Al-Mulk": "The Sovereignty"
    },
    
    // Surahs list translations
    surahsList: {
      loading: "Loading Surahs...",
      error: "Error loading Surahs",
      refreshPage: "Please try refreshing the page",
      title: "Surahs of the Holy Quran",
      description: "Complete collection of 114 chapters of the Holy Quran with English translation",
      searchPlaceholder: "Search surahs...",
      filterAll: "All",
      filterMeccan: "Meccan",
      filterMedinan: "Medinan",
      sortNumber: "Number",
      sortName: "Name",
      sortVerses: "Verses",
      sortRevelation: "Revelation",
      verses: "verses",
      noResults: "No surahs found",
      noResultsDesc: "Try different search terms"
    },
    
    // Quran Reader translations
    quranReader: {
      audioNotAvailableReciter: "Audio not available for this reciter",
      audioNotAvailable: "Audio not available",
      errorLoadingSurah: "Error loading surah data",
      loadingQuran: "Loading Quran...",
      preparingVerses: "Preparing verses for reading",
      verses: "verses",
      prev: "Prev",
      audio: "Audio",
      next: "Next",
      translation: "Translation",
      settings: "Settings"
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
    },
    
    // Live Streams
    liveStreams: {
      nav: "Spiritual Center",
      title: "Live Streams",
      subtitle: "Watch live streams from Islam's most sacred places, including Masjid al-Haram in Mecca and Masjid an-Nabawi in Medina.",
      holyPlacesTitle: "🕌 Holy Places",
      holyPlacesDescription: "Live streams from the most sacred places of Islam",
      status: {
        live: "LIVE",
        offline: "OFFLINE",
        official: "OFFICIAL",
        lastUpdated: "LAST UPDATED",
        liveSignal: "Live Signal",
        waiting: "Waiting for Signal",
        currentViewers: "Current Viewers"
      },
      actions: {
        refresh: "Refresh",
        refreshing: "Refreshing...",
        openYoutube: "Open in YouTube"
      },
      locations: {
        mecca: {
          title: "Masjid al-Haram, Mecca",
          description: "Live stream from Islam's holiest mosque surrounding the Kaaba. Watch prayers, Tawaf and other rituals."
        },
        medina: {
          title: "Masjid an-Nabawi, Medina",
          description: "Live stream from the Prophet's Mosque in Medina, where Prophet Muhammad (peace be upon him) is buried. Witness prayers and rituals."
        }
      }
    },
    
    // Prayer Times Display
    prayerTimes: {
      title: "Prayer Times",
      subtitle: "Accurate prayer schedule based on your location",
      loading: "Determining prayer times...",
      error: "Error occurred while loading prayer times",
      locationError: "Could not determine coordinates",
      updated: "Updated",
      refresh: "Refresh",
      gps: "GPS",
      searchPlaceholder: "Search city...",
      searching: "Searching...",
      find: "Find",
      searchingCities: "Searching cities...",
      noResults: 'No cities found for "{query}"',
      tryEnglish: "Try English names: Moscow, London, Istanbul, Dubai, Almaty",
      quickTests: "Quick tests:",
      nextPrayer: "Next Prayer",
      tomorrowPrayer: "Tomorrow's Prayer",
      timeLeft: "Time Remaining",
      hours: "hours",
      minutes: "minutes",
      seconds: "seconds",
      tryAgain: "Try Again",
      calculationMethod: "Calculation Method",
      detectLocation: "Detect Location",
      calculationInfo: "Calculation Information",
      info: {
        location: "Time calculated based on your location",
        method: "Uses calculation method for your region",
        autoUpdate: "Time updates automatically",
        search: "Search available by city name"
      },
      prayers: {
        fajr: "Fajr",
        sunrise: "Sunrise",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha"
      },
      cities: {
        moscow: "Moscow",
        london: "London",
        dubai: "Dubai",
        almaty: "Almaty"
      },
      tryAgain: "Try again",
      nextPrayer: "Next prayer",
      tomorrowPrayer: "Tomorrow's prayer",
      timeRemaining: "Time remaining",
      hours: "hours",
      minutes: "minutes",
      seconds: "seconds",
      calculationMethod: "Calculation method",
      detectLocation: "Detect location",
      infoTitle: "Calculation information",
      infoLocation: "Time is calculated based on your location",
      infoMethod: "Regional calculation method is used",
      infoUpdates: "Time updates automatically",
      infoSearch: "Search by city name available",
      prayersEn: {
        fajr: "Fajr",
        sunrise: "Sunrise",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha"
      }
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
    waitingContent: "Kontent tayyorlaganimizni kuting",
    retry: "Qayta urinish",
    backToCategories: "Kategoriyalarga qaytish",

    sortBy: "Saralash",
    newest: "Yangilari",
    oldest: "Eskilari",
    category: "Kategoriya",
    clearAll: "Barchasini tozalash",
    exportDuas: "Duolarni eksport qilish",
    importDuas: "Duolarni import qilish",
    
    // Saved duas page
    savedDuas: "Saqlangan duolar",
    favoriteDuas: "sevimli duolar",
    backToDuas: "Duolarga qaytish",
    export: "Eksport",
    import: "Import",
    searchSavedDuas: "Saqlangan duolardan qidirish...",
    allCategories: "Barcha kategoriyalar",
    byDate: "Sana bo'yicha",
    byTitle: "Nom bo'yicha",
    byCategory: "Kategoriya bo'yicha",
    noSavedDuas: "Sizning sevimli duolaringiz tez kirish uchun shu yerda ko'rsatiladi",
    goToDuas: "Duolarga o'tish",
    mainPage: "Bosh sahifa",
    noDuasFoundQuery: "So'rov bo'yicha duolar topilmadi",
    copy: "Nusxalash",
    delete: "O'chirish",
    notes: "Izohlar",
    benefitsLabel: "Foyda",
    source: "Manba",

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
      },
      languageIndicator: "UZ",
      loadingContent: "Kontent tayyorlaganimizni kuting",
      retry: "Qayta urinish",
      backToCategories: "Kategoriyalarga qaytish",
      sortDefault: "Standart",
      sortAlphabetical: "A-Z",
      progress: "Progress",
      categoryCompleted: "🎉 Kategoriya tugatildi!",
      allDuasCompleted: "Barcha {total} ta duo o'qildi! Mashalloh!",
      remainingDuas: "{total} tadan {remaining} ta duo qoldi",
      completed: "Tugallangan",
      remaining: "Qolgan",
      almostDone: "🔥 Deyarli tayyor! {remaining} ta duo qoldi!",
      globalSettings: "Global ko'rsatish sozlamalari",
      globalSettingsDescription: "Barcha duo kartalarida sukut bo'yicha qaysi maydonlar ko'rsatilishini sozlang.",
      transliteration: "Transliteratsiya",
      notes: "Eslatmalar",
      benefits: "Foyda",
      source: "Manba",
      defaultHidden: "Sukut bo'yicha yashirin",
      defaultVisible: "Sukut bo'yicha ko'rinadigan",
      settings: "Sozlamalar",
      searchPlaceholder: "Duolarni qidirish...",
      tip: "Maslahat",
      tipText: "Har bir duo kartasi o'z sozlamalariga ega. Ko'rsatishni sozlash uchun kartadagi vites belgisini bosing.",
      languageIndicatorText: "UZ",
      noResults: "Duolar topilmadi",
      noResultsDescription: "Boshqa qidiruv so'zlari yoki filtrlarni sinab ko'ring",
      clearSearch: "Qidiruvni tozalash",
      loadMoreDuas: "Ko'proq duolarni yuklash",
      statusReady: "🏆 Tayyor",
      statusAlmostDone: "🔥 Deyarli",
      statusInProgress: "⚡ Ketmoqda",
      statusStart: "📚 Boshlash"
    },
    
    // Suralar nomi tarjimalari
    surahTranslations: {
      "Al-Fatiha": "Ochuvchi",
      "Al-Baqarah": "Sigir",
      "Al-Kahf": "G'or",
      "Ya-Sin": "Yo Sin",
      "Ar-Rahman": "Rahmon",
      "Al-Mulk": "Mulk"
    },
    
    // Suralar ro'yxati tarjimalari
    surahsList: {
      loading: "Suralar yuklanmoqda...",
      error: "Suralarni yuklashda xato",
      refreshPage: "Sahifani yangilashga harakat qiling",
      title: "Muqaddas Qur'on suralari",
      description: "Muqaddas Qur'onning 114 ta surasining to'liq to'plami o'zbek tilidagi tarjima bilan",
      searchPlaceholder: "Suralarni qidirish...",
      filterAll: "Hammasi",
      filterMeccan: "Makkiy",
      filterMedinan: "Madaniy",
      sortNumber: "Raqam",
      sortName: "Nom",
      sortVerses: "Oyatlar",
      sortRevelation: "Nozil bo'lish",
      verses: "oyat",
      noResults: "Suralar topilmadi",
      noResultsDesc: "Boshqa qidiruv so'zlarini sinab ko'ring"
    },
    
    // Qur'on o'qish sahifasi tarjimalari
    quranReader: {
      audioNotAvailableReciter: "Bu qori uchun audio mavjud emas",
      audioNotAvailable: "Audio mavjud emas",
      errorLoadingSurah: "Sura ma'lumotlarini yuklashda xato",
      loadingQuran: "Qur'on yuklanmoqda...",
      preparingVerses: "Oyatlar o'qish uchun tayyorlanmoqda",
      verses: "oyat",
      prev: "Oldin",
      audio: "Audio",
      next: "Keyin",
      translation: "Tarjima",
      settings: "Sozlamalar"
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
    },
    
    // Live Streams
    liveStreams: {
      nav: "Ma'naviy markaz",
      title: "Jonli translyatsiyalar",
      subtitle: "Islomning eng muqaddas joylaridan, jumladan Makkadagi Masjid al-Haram va Madinadagi Masjid an-Nabaviydan jonli translyatsiyalarni tomosha qiling.",
      holyPlacesTitle: "🕌 Muqaddas joylar",
      holyPlacesDescription: "Islomning eng muqaddas joylaridan jonli translyatsiyalar",
      status: {
        live: "JONLI",
        offline: "OFLAYN",
        official: "RASMIY",
        lastUpdated: "OXIRGI YANGILANISH",
        liveSignal: "Jonli signal",
        waiting: "Signalni kutish",
        currentViewers: "Hozirgi tomoshabinlar"
      },
      actions: {
        refresh: "Yangilash",
        refreshing: "Yangilanmoqda...",
        openYoutube: "YouTube'da ochish"
      },
      locations: {
        mecca: {
          title: "Masjid al-Haram, Makka",
          description: "Ka'bani o'rab olgan Islomning eng muqaddas masjididan jonli translyatsiya. Namozlar, Tavof va boshqa marosimlarni kuzating."
        },
        medina: {
          title: "Masjid an-Nabaviy, Madina",
          description: "Paygambar Muhammad (s.a.v.) dafn etilgan Madinadagi Paygambar masjididan jonli translyatsiya. Namozlar va marosimlarni tomosha qiling."
        }
      }
    },
    
    // Prayer Times Display
    prayerTimes: {
      title: "Namoz vaqtlari",
      subtitle: "Joylashuvingizga asoslangan aniq namoz jadvali",
      loading: "Namoz vaqtlarini aniqlash...",
      error: "Namoz vaqtlarini yuklashda xato yuz berdi",
      locationError: "Koordinatalarni aniqlab bo'lmadi",
      updated: "Yangilangan",
      refresh: "Yangilash",
      gps: "GPS",
      searchPlaceholder: "Shaharni qidirish...",
      searching: "Qidirilmoqda...",
      find: "Topish",
      searchingCities: "Shaharlar qidirilmoqda...",
      noResults: '"{query}" uchun shaharlar topilmadi',
      tryEnglish: "Inglizcha nomlarni sinab ko'ring: Moscow, London, Istanbul, Dubai, Almaty",
      quickTests: "Tezkor testlar:",
      nextPrayer: "Keyingi namoz",
      tomorrowPrayer: "Ertangi namoz",
      timeLeft: "Qolgan vaqt",
      hours: "soat",
      minutes: "daqiqa",
      seconds: "soniya",
      tryAgain: "Qayta urinish",
      calculationMethod: "Hisoblash usuli",
      detectLocation: "Joylashuvni aniqlash",
      calculationInfo: "Hisoblash ma'lumotlari",
      info: {
        location: "Vaqt sizning joylashuvingizga asoslanib hisoblanadi",
        method: "Hududingiz uchun hisoblash usuli qo'llaniladi",
        autoUpdate: "Vaqt avtomatik yangilanadi",
        search: "Shahar nomi bo'yicha qidiruv mavjud"
      },
      prayers: {
        fajr: "Bomdod",
        sunrise: "Quyosh chiqishi",
        dhuhr: "Peshin",
        asr: "Asr",
        maghrib: "Shom",
        isha: "Xufton"
      },
      prayersEn: {
        fajr: "Fajr",
        sunrise: "Sunrise",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha"
      },
      cities: {
        moscow: "Moskva",
        london: "London",
        dubai: "Dubay",
        almaty: "Almati"
      },
      tryAgain: "Qayta urinib ko'ring",
      nextPrayer: "Keyingi namoz",
      tomorrowPrayer: "Ertangi namoz",
      timeRemaining: "Qolgan vaqt",
      hours: "soat",
      minutes: "daqiqa",
      seconds: "soniya",
      calculationMethod: "Hisoblash usuli",
      detectLocation: "Joyni aniqlash",
      infoTitle: "Hisoblash haqida ma'lumot",
      infoLocation: "Vaqt sizning joylashuvingizga qarab hisoblanadi",
      infoMethod: "Mintaqangiz uchun hisoblash usuli qo'llaniladi",
      infoUpdates: "Vaqt avtomatik yangilanadi",
      infoSearch: "Shahar nomi bo'yicha qidiruv mavjud",
      prayersEn: {
        fajr: "Fajr",
        sunrise: "Sunrise",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha"
      }
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