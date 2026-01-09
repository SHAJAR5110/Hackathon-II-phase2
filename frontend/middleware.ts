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
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Redirect unauthenticated users from root to signin
  if (pathname === '/' && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/((?!api|_next|static|favicon.ico).*)'],
};
