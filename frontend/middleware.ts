/**
 * Next.js Middleware
 * Phase II - Todo Full-Stack Web Application
 *
 * Redirects unauthenticated users to signin page.
 * Protects all routes except /auth/* pages.
 * Prevents access to dashboard and main app without authentication.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/signup', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If accessing a protected route without a token, redirect to signin
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // If user is on root path without auth, redirect to signin
  if (pathname === '/' && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // If already authenticated and trying to access auth pages, redirect to dashboard
  if ((pathname === '/auth/signin' || pathname === '/auth/signup') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
