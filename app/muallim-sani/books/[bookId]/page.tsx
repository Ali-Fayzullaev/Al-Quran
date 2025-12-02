'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import PDFViewer from '@/components/muallim-sani/PDFViewer';

interface PDFBookData {
  id: string;
  title: string;
  fileName: string;
}

const pdfBooks: Record<string, PDFBookData> = {
  'alifba': {
    id: 'alifba',
    title: 'Алифба - Основы',
    fileName: 'alifba_end.pdf'
  },
  'all-letters': {
    id: 'all-letters',
    title: 'Все буквы',
    fileName: 'all_letters_end.pdf'
  },
  'tanvin': {
    id: 'tanvin',
    title: 'Буквы с танвином',
    fileName: 'letters_with_tanvin_end.pdf'
  },
  'tashdid': {
    id: 'tashdid',
    title: 'Буквы с тяжёлым произношением',
    fileName: 'letters_with_tashdid_end.pdf'
  },
  'mad-tabiy': {
    id: 'mad-tabiy',
    title: 'Мад Табии',
    fileName: 'mad_tabiy_end.pdf'
  },
  'complete': {
    id: 'complete',
    title: 'Полный курс Muallim Sani',
    fileName: 'all_muallim_sani_end.pdf'
  }
};

interface BookPageProps {
  params: Promise<{
    bookId: string;
  }>;
}

export default function BookPage({ params }: BookPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const book = pdfBooks[resolvedParams.bookId];

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Книга не найдена</h1>
          <button
            onClick={() => router.push('/muallim-sani/books')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Вернуться к списку книг
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    router.push('/muallim-sani/books');
  };

  return (
    <PDFViewer
      pdfPath={`/muallim_sani/${book.fileName}`}
      title={book.title}
      bookId={resolvedParams.bookId}
      onBack={handleBack}
    />
  );
}