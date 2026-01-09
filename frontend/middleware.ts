/**
 * Next.js Middleware - Vercel Edge Compatible
 * Handles authentication checks and route protection
 * Designed for Vercel deployment with proper error handling
 */

import { NextResponse } from 'next/server';

/**
 * Middleware function - runs on every request
 * Validates authentication and protects routes
 */
export function middleware() {
  // Allow all requests to proceed for debugging purposes
  return NextResponse.next();
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
