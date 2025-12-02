'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Play, Download, FileText, ArrowLeft } from 'lucide-react';

interface PDFBookData {
  id: string;
  title: string;
  description: string;
  fileName: string;
  pages?: number;
  difficulty: 'начинающий' | 'средний' | 'продвинутый';
  category: string;
  icon?: React.ReactNode;
}

const pdfBooks: PDFBookData[] = [
  {
    id: 'alifba',
    title: 'Алифба - Основы',
    description: 'Изучение арабского алфавита и основ чтения',
    fileName: 'alifba_end.pdf',
    difficulty: 'начинающий',
    category: 'Алфавит',
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    id: 'all-letters',
    title: 'Все буквы',
    description: 'Полный набор арабских букв с примерами',
    fileName: 'all_letters_end.pdf',
    difficulty: 'начинающий',
    category: 'Алфавит',
    icon: <FileText className="w-6 h-6" />
  },
  {
    id: 'tanvin',
    title: 'Буквы с танвином',
    description: 'Изучение букв с танвином (двойные окончания)',
    fileName: 'letters_with_tanvin_end.pdf',
    difficulty: 'средний',
    category: 'Танвин',
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    id: 'tashdid',
    title: 'Буквы с тяжёлым произношением',
    description: 'Изучение букв с ташдидом (удвоение)',
    fileName: 'letters_with_tashdid_end.pdf',
    difficulty: 'средний',
    category: 'Ташдид',
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    id: 'mad-tabiy',
    title: 'Мад Табии',
    description: 'Естественное удлинение в чтении Корана',
    fileName: 'mad_tabiy_end.pdf',
    difficulty: 'продвинутый',
    category: 'Мад',
    icon: <Play className="w-6 h-6" />
  },
  {
    id: 'complete',
    title: 'Полный курс Muallim Sani',
    description: 'Полный сборник всех уроков',
    fileName: 'all_muallim_sani_end.pdf',
    difficulty: 'продвинутый',
    category: 'Полный курс',
    icon: <Download className="w-6 h-6" />
  }
];

const difficultyColors = {
  'начинающий': 'bg-green-500/20 text-green-300 border-green-500/30',
  'средний': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'продвинутый': 'bg-red-500/20 text-red-300 border-red-500/30'
};

const PDFBooksIndex: React.FC = () => {
  const router = useRouter();

  const handleBookSelect = (book: PDFBookData) => {
    router.push(`/muallim-sani/books/${book.id}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
      
      {/* Кнопка "Назад" */}
      <button
        onClick={() => router.push('/muallim-sani')}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-black/60 text-white/70 hover:text-white hover:bg-black/80 rounded-lg transition-all duration-200 backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Назад</span>
      </button>
      
      {/* Заголовок */}
      <div className="relative pt-8 pb-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 mb-6">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              Muallim Sani
            </h1>
          </div>
          <p className="text-lg max-w-2xl mx-auto">
            Изучение основ чтения Корана. Выберите урок для начала обучения.
          </p>
        </div>
        
        {/* Декоративные элементы */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Сетка книг */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {pdfBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleBookSelect(book)}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:scale-105 hover:bg-white/10"
            >
              
              {/* Фоновый градиент */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Контент карточки */}
              <div className="relative z-10">
                
                {/* Иконка и категория */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 group-hover:bg-blue-500/30 transition-colors duration-300">
                    {book.icon}
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full">
                    {book.category}
                  </span>
                </div>

                {/* Заголовок */}
                <h3 className="text-[14px] lg:text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors duration-300">
                  {book.title}
                </h3>

                {/* Описание */}
                <p className="text-[10px] lg:text-sm mb-4 line-clamp-2">
                  {book.description}
                </p>

                {/* Уровень сложности */}
                <div className="flex items-center justify-between">
                  <span className={`
                    text-xs px-3 py-1 rounded-full border
                    ${difficultyColors[book.difficulty]}
                  `}>
                    {book.difficulty}
                  </span>
                  
                  <div className="flex items-center gap-2 transition-colors duration-300">
                    <Play className="w-4 h-4" />
                  </div>
                </div>

                {/* Эффект свечения при наведении */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold  mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            О программе Muallim Sani
          </h3>
          <p className=" text-sm leading-relaxed mb-4">
            Muallim Sani - это классическая методика изучения арабского языка и основ чтения Корана. 
            Программа разработана для поэтапного освоения арабского алфавита, правил чтения и произношения.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">{pdfBooks.filter(b => b.difficulty === 'начинающий').length}</div>
              <div className="text-sm">Уроков для начинающих</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">{pdfBooks.filter(b => b.difficulty === 'средний').length}</div>
              <div className="text-sm">Средний уровень</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">{pdfBooks.filter(b => b.difficulty === 'продвинутый').length}</div>
              <div className="text-sm">Продвинутый уровень</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFBooksIndex;