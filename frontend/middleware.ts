/**
 * Next.js Middleware - Vercel Edge Compatible
 * Handles authentication checks and route protection
 * Designed for Vercel deployment with proper error handling
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];

// Auth routes (don't require authentication)
const AUTH_ROUTES = ['/auth/signin', '/auth/signup'];

/**
 * Middleware function - runs on every request
 * Validates authentication and protects routes
 */
export function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    // Skip middleware for Next.js internal routes and static assets
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/.well-known') ||
      /\.(png|jpg|jpeg|gif|icon|svg|webp|ico)$/i.test(pathname)
    ) {
      return NextResponse.next();
    }

    // Check if route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
      pathname.startsWith(route)
    );

    // Safely get auth token from cookies
    let authToken: string | undefined;
    try {
      authToken = request.cookies.get('auth-token')?.value;
    } catch (error) {
      // If cookie reading fails, treat as no token
      authToken = undefined;
    }

    // Handle protected routes - redirect to signin if no token
    if (isProtectedRoute && !authToken) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Handle auth pages - redirect to dashboard if already logged in
    const isAuthRoute = AUTH_ROUTES.some(route => pathname === route);
    if (isAuthRoute && authToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Allow request to proceed
    return NextResponse.next();
  } catch (error) {
    // On any unexpected error, allow the request to proceed
    // This prevents the middleware from blocking the entire app
    console.error('[Middleware Error]', error);
    return NextResponse.next();
  }
}

// Matcher configuration for Vercel edge
export const config = {
  matcher: [
    // Run middleware on all routes except:
    // - _next (Next.js internals)
    // - api (API routes)
    // - favicon.ico (static file)
    '/((?!_next|api|favicon.ico).*)',
  ],
};
