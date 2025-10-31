// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Добавляем заголовки для кеширования статических ресурсов
  if (request.nextUrl.pathname.startsWith('/messages/') || 
      request.nextUrl.pathname.startsWith('/quran-img-pages/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Заголовки производительности
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Preload важные ресурсы
  if (request.nextUrl.pathname === '/') {
    response.headers.set('Link', 
      '</messages/en.json>; rel=preload; as=fetch; crossorigin, ' +
      '</messages/ru.json>; rel=preload; as=fetch; crossorigin'
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};