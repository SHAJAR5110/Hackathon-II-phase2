/**
 * Next.js Middleware
 * Handles authentication checks and route protection
 * Vercel-compatible - uses next/middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected routes that require authentication
 * Users without valid JWT tokens will be redirected to signin
 */
const protectedRoutes = ['/dashboard'];

/**
 * Middleware function to check authentication and handle route protection
 * Runs on every request to the application
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Skip middleware for static files, API routes, and next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(png|jpg|jpeg|gif|ico|svg|webp)$/i)
  ) {
    return NextResponse.next();
  }

  // Get the authentication token from localStorage
  // Note: In middleware, we check cookies instead since localStorage is browser-only
  const token = request.cookies.get('auth-token')?.value;

  // If route is protected and no token exists, redirect to signin
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/auth/signin', request.url);
    // Add redirect parameter so signin page can redirect back after login
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is on signin/signup page and has a valid token, redirect to dashboard
  if ((pathname === '/auth/signin' || pathname === '/auth/signup') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

/**
 * Matcher configuration
 * Specifies which routes this middleware should run on
 * Excludes Next.js internals, static files, and API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
