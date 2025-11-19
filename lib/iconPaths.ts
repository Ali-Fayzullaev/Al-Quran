// Пути к вашим реальным иконкам
export const iconPaths = {
  home: '/iconsPages/home.jpg',
  quran: '/iconsPages/quran.jpg', 
  journey: '/iconsPages/journey.jpg',
  live: '/iconsPages/live.png',
  planner: '/iconsPages/planner.png',
  quiz: '/iconsPages/quiz.png',
  aiHelper: '/iconsPages/ai-page.png', // Обновлено под реальное имя файла
  search: '/iconsPages/search.png',
  mosque: '/iconsPages/mosque-finder.png', // Обновлено под реальное имя файла
  duaDhikr: '/iconsPages/dua-dhikr.png', // Иконка для дуа и зикр
  bookmarks: '/iconsPages/bookmarks.png',
  feedback: '/iconsPages/feedback.png', // Обновлено под реальное расширение
  settings: '/iconsPages/settings.png'
};

// Пока иконки не добавлены, используем красивые SVG заглушки
export const tempIconSvgs = {
  home: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'%3E%3Cpath d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/%3E%3C/svg%3E",
  quran: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'%3E%3Cpath d='M6 2v20l6-3 6 3V2z'/%3E%3C/svg%3E",
  journey: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%233b82f6'%3E%3Cpath d='M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5z'/%3E%3C/svg%3E",
  live: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ef4444'%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M12 1v6m0 10v6m11-7h-6m-10 0H1m15.5-7.5l-4.24 4.24M7.76 12.24L3.5 7.98m12.73 8.02l4.24 4.24M7.76 7.76L3.5 3.5'/%3E%3C/svg%3E",
  planner: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f59e0b'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E",
  quiz: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b5cf6'%3E%3Cpath d='M9.5 2A7.5 7.5 0 0 0 2 9.5c0 5.5 7.5 13.5 7.5 13.5s7.5-8 7.5-13.5A7.5 7.5 0 0 0 9.5 2z'/%3E%3Ccircle cx='9.5' cy='9.5' r='2.5'/%3E%3C/svg%3E",
  aiHelper: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Crect x='2' y='3' width='20' height='14' rx='2' ry='2'/%3E%3Cline x1='8' y1='21' x2='16' y2='21'/%3E%3Cline x1='12' y1='17' x2='12' y2='21'/%3E%3C/svg%3E",
  search: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2314b8a6'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='21 21l-4.35-4.35'/%3E%3C/svg%3E",
  mosque: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'%3E%3Cpath d='M12 2l3.09 6.26L22 9l-5 4.74L18.18 20 12 16.77 5.82 20 7 13.74 2 9l6.91-.74z'/%3E%3C/svg%3E",
  duaDhikr: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23059669'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3Cpath d='M9 12l2 2 4-4'/%3E%3C/svg%3E",
  bookmarks: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f97316'%3E%3Cpath d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'/%3E%3C/svg%3E",
  feedback: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2306b6d4'%3E%3Cpath d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/%3E%3C/svg%3E",
  settings: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M12 1v6m0 10v6m11-7h-6m-10 0H1m15.5-7.5l-4.24 4.24M7.76 12.24L3.5 7.98m12.73 8.02l4.24 4.24M7.76 7.76L3.5 3.5'/%3E%3C/svg%3E"
};