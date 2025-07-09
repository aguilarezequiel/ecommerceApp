// frontend/src/middleware.ts - CREAR ESTE ARCHIVO
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger la ruta /categories - solo para admin
  if (pathname === '/categories') {
    // Redirigir a la página de productos en su lugar
    return NextResponse.redirect(new URL('/products', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/categories']
};