// PDF Loader utility с поддержкой прогрессивной загрузки
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export interface PDFLoaderOptions {
  scale?: number;
  quality?: number;
}

export class PDFLoader {
  private static isLoaded = false;
  private static loadPromise: Promise<void> | null = null;

  static async loadPDFJS(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('PDFLoader можно использовать только на клиенте'));
        return;
      }

      // Проверяем, не загружен ли уже PDF.js
      if (window.pdfjsLib) {
        this.isLoaded = true;
        resolve();
        return;
      }

      console.log('📚 Загрузка PDF.js библиотеки...');
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          // Отключаем автоматические события для исправления passive events
          if (window.pdfjsLib.DisableAutoFetchDefault) {
            window.pdfjsLib.DisableAutoFetchDefault = true;
          }
          
          this.isLoaded = true;
          console.log('✅ PDF.js успешно загружен');
          resolve();
        } else {
          console.error('❌ PDF.js не удалось инициализировать');
          reject(new Error('PDF.js не удалось загрузить'));
        }
      };
      
      script.onerror = (error) => {
        console.error('❌ Ошибка загрузки PDF.js:', error);
        reject(new Error('Ошибка загрузки PDF.js'));
      };
      
      // Добавляем таймаут на загрузку библиотеки
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout loading PDF.js'));
      }, 10000);
      
      script.addEventListener('load', () => clearTimeout(timeoutId));
      script.addEventListener('error', () => clearTimeout(timeoutId));
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  static async loadPDFFromURL(
    url: string, 
    options: PDFLoaderOptions = {}
  ): Promise<string[]> {
    await this.loadPDFJS();
    
    const { scale = 2.0, quality = 0.92 } = options;
    
    try {
      const loadingTask = window.pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      
      console.log(`Загружается PDF с ${numPages} страницами`);
      
      const pagePromises: Promise<string>[] = [];
      
      for (let i = 1; i <= numPages; i++) {
        pagePromises.push(
          pdf.getPage(i).then(async (page: any) => {
            const viewport = page.getViewport({ scale });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };
            
            await page.render(renderContext).promise;
            return canvas.toDataURL('image/jpeg', quality);
          })
        );
      }

      const pages = await Promise.all(pagePromises);
      console.log(`Успешно конвертировано ${pages.length} страниц`);
      return pages;
      
    } catch (error) {
      console.error('Ошибка загрузки PDF:', error);
      throw error;
    }
  }

  static async loadPDFWithProgressiveLoading(
    url: string,
    onProgress?: (loaded: number, total: number) => void,
    onFirstPagesReady?: (firstPages: string[]) => void,
    options: PDFLoaderOptions = {}
  ): Promise<string[]> {
    await this.loadPDFJS();
    
    const { scale = 2.0, quality = 0.92 } = options;
    
    try {
      console.log(`🔄 Начинаем прогрессивную загрузку PDF: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      let pdf;
      try {
        const loadingTask = window.pdfjsLib.getDocument({
          url,
          onProgress: (progress: { loaded: number; total: number }) => {
            onProgress?.(progress.loaded * 0.1, progress.total); // 10% на загрузку PDF
          },
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
          httpHeaders: {
            'Accept': 'application/pdf,*/*',
            'Cache-Control': 'no-cache',
          },
          withCredentials: false,
          timeout: 20000,
          disableAutoFetch: true,
          disableStream: true,
          disableRange: true
        });
        
        pdf = await loadingTask.promise;
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
      const numPages = pdf.numPages;
      const pages: string[] = [];
      
      // Сначала загружаем первые 10 страниц для быстрого показа
      const priorityPages = Math.min(10, numPages);
      console.log(`⚡ Приоритетная загрузка первых ${priorityPages} страниц`);
      
      for (let i = 1; i <= priorityPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({ canvasContext: context, viewport }).promise;
          pages.push(canvas.toDataURL('image/jpeg', quality));
          
          // Прогресс для первых страниц: 10-40%
          const progressPercent = Math.min(10 + (i / numPages) * 90, 95);
          onProgress?.(progressPercent, numPages);
        } catch (error) {
          console.warn(`⚠️ Ошибка загрузки приоритетной страницы ${i}:`, error);
          pages.push(this.createErrorPage(i, error));
        }
      }
      
      // Уведомляем, что первые страницы готовы
      onFirstPagesReady?.(pages.slice());
      
      // Загружаем остальные страницы в фоне
      for (let i = priorityPages + 1; i <= numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({ canvasContext: context, viewport }).promise;
          pages.push(canvas.toDataURL('image/jpeg', quality));
          
          // Прогресс для остальных страниц: 40-95%
          const baseProgress = 40;
          const remainingProgress = ((i - priorityPages) / (numPages - priorityPages)) * 55;
          const progressPercent = Math.min(baseProgress + remainingProgress, 95);
          onProgress?.(progressPercent, numPages);
        } catch (error) {
          console.warn(`⚠️ Ошибка загрузки страницы ${i}:`, error);
          pages.push(this.createErrorPage(i, error));
        }
      }
      
      console.log(`✅ Прогрессивная загрузка завершена: ${pages.length} страниц`);
      return pages;
      
    } catch (error) {
      console.error('❌ Ошибка прогрессивной загрузки PDF:', error);
      throw error;
    }
  }

  static createErrorPage(pageNumber: number, error: any): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="600" height="850" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="850" fill="#fee2e2"/>
        <text x="300" y="400" text-anchor="middle" font-size="24" fill="#dc2626">
          Ошибка загрузки страницы ${pageNumber}
        </text>
        <text x="300" y="450" text-anchor="middle" font-size="16" fill="#7f1d1d">
          ${error instanceof Error ? error.message : 'Неизвестная ошибка'}
        </text>
      </svg>
    `)}`;
  }

  static async loadPDFWithProgress(
    url: string,
    onProgress?: (loaded: number, total: number) => void,
    options: PDFLoaderOptions = {}
  ): Promise<string[]> {
    await this.loadPDFJS();
    
    const { scale = 2.0, quality = 0.92 } = options;
    
    try {
      // Проверяем доступность URL с таймаутом
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут
      
      let pdf;
      try {
        const loadingTask = window.pdfjsLib.getDocument({
          url,
          onProgress: (progress: { loaded: number; total: number }) => {
            onProgress?.(progress.loaded, progress.total);
          },
          // Добавляем опции для лучшей совместимости
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
          // Настройки для работы с проблемными серверами (504 fix)
          httpHeaders: {
            'Accept': 'application/pdf,*/*',
            'Cache-Control': 'no-cache',
          },
          withCredentials: false,
          // Увеличиваем таймаут
          timeout: 20000,
          // Отключаем автоматические запросы для избежания passive events
          disableAutoFetch: true,
          disableStream: true,
          disableRange: true
        });
        
        pdf = await Promise.race([
          loadingTask.promise,
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('PDF loading timeout')), 15000);
          })
        ]);
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        let errorMessage = 'Неизвестная ошибка загрузки PDF';
        if (fetchError instanceof Error) {
          if (fetchError.message.includes('504') || fetchError.message.includes('Gateway Time-out')) {
            errorMessage = 'Сервер временно недоступен (504). Попробуйте позже или выберите другой источник.';
          } else if (fetchError.message.includes('timeout') || fetchError.message.includes('AbortError')) {
            errorMessage = 'Превышен таймаут загрузки. Проверьте интернет-соединение.';
          } else if (fetchError.message.includes('CORS')) {
            errorMessage = 'Ограничения безопасности браузера (CORS). Файл должен быть размещен на том же домене.';
          } else if (fetchError.message.includes('404')) {
            errorMessage = 'PDF файл не найден по указанному адресу.';
          } else if (fetchError.message.includes('403')) {
            errorMessage = 'Доступ к PDF файлу запрещен.';
          } else {
            errorMessage = fetchError.message;
          }
        }
        throw new Error(errorMessage);
      }
      
      const numPages = pdf.numPages;
      console.log(`📖 Загружается PDF с ${numPages} страницами`);
      
      const pages: string[] = [];
      
      for (let i = 1; i <= numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          
          await page.render(renderContext).promise;
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          pages.push(dataUrl);
          
          // Уведомляем о прогрессе конвертации
          onProgress?.(i, numPages);
          
        } catch (pageError) {
          console.warn(`⚠️ Ошибка обработки страницы ${i}:`, pageError);
          // Создаем заглушку для проблемной страницы
          const errorPage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg width="600" height="850" xmlns="http://www.w3.org/2000/svg">
              <rect width="600" height="850" fill="#fee2e2"/>
              <text x="300" y="400" text-anchor="middle" font-size="24" fill="#dc2626">
                Ошибка загрузки страницы ${i}
              </text>
              <text x="300" y="450" text-anchor="middle" font-size="16" fill="#7f1d1d">
                ${pageError instanceof Error ? pageError.message : 'Неизвестная ошибка'}
              </text>
            </svg>
          `)}`;
          pages.push(errorPage);
        }
      }

      console.log(`✅ Успешно обработано ${pages.length} страниц`);
      return pages;
      
    } catch (error) {
      console.error('❌ Критическая ошибка загрузки PDF:', error);
      
      // Определяем тип ошибки для более точного сообщения
      let errorMessage = 'Неизвестная ошибка';
      if (error instanceof Error) {
        if (error.message.includes('504') || error.message.includes('Gateway Time-out')) {
          errorMessage = 'Сервер временно недоступен (504). Попробуйте позже.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Превышен таймаут загрузки. Проверьте интернет-соединение.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Ограничения безопасности браузера (CORS).';
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  // Создание демо-контента для тестирования
  static createDemoPages(count: number = 12): string[] {
    return Array.from({ length: count }, (_, i) => {
      const pageNum = i + 1;
      
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg width="600" height="850" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg-${i}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="accent-${i}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.1" />
              <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.2" />
            </linearGradient>
          </defs>
          
          <rect width="600" height="850" fill="url(#bg-${i})"/>
          <rect width="600" height="850" fill="url(#accent-${i})"/>
          <rect x="40" y="40" width="520" height="770" fill="none" stroke="#e2e8f0" stroke-width="2" rx="8"/>
          
          <text x="300" y="120" text-anchor="middle" font-family="serif" font-size="32" font-weight="bold" fill="#1e293b">
            Muallim Sani
          </text>
          <text x="300" y="160" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#64748b">
            Обучение чтению Корана
          </text>
          
          <circle cx="300" cy="400" r="80" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/>
          <text x="300" y="420" text-anchor="middle" font-family="sans-serif" font-size="64" font-weight="bold" fill="#334155">
            ${pageNum}
          </text>
          
          <text x="300" y="520" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#475569">
            Страница ${pageNum}
          </text>
          
          <circle cx="150" cy="650" r="40" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
          <circle cx="450" cy="650" r="40" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
          
          <text x="300" y="700" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#6b7280">
            • Изучение арабских букв
          </text>
          <text x="300" y="730" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#6b7280">
            • Правила чтения
          </text>
          <text x="300" y="760" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#6b7280">
            • Практические упражнения
          </text>
          
          <line x1="80" y1="800" x2="520" y2="800" stroke="#e2e8f0" stroke-width="1"/>
          <text x="300" y="825" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#9ca3af">
            Muallim Sani - Изучение Корана
          </text>
        </svg>
      `)}`
    });
  }
}