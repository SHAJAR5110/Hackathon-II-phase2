/**
 * Next.js Middleware - Vercel Edge Compatible
 * Lightweight middleware for token persistence across requests
 *
 * Authentication is primarily handled client-side:
 * - ProtectedRoute component protects /dashboard
 * - SigninPage redirects authenticated users
 * - SignupPage handles registration flow
 *
 * This middleware is minimal to avoid conflicts with client-side auth logic.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function - runs on every request
 * Provides token persistence from cookies to headers
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get auth token from request cookies (set by client after login)
  const authToken = request.cookies.get('auth-token')?.value;

  // If token exists, include it in response headers for downstream processing
  if (authToken) {
    response.headers.set('x-auth-token', authToken);
  }

  return response;
}

// Matcher configuration for Vercel edge
// Apply middleware to all routes except Next.js internals and static assets
export const config = {
  matcher: [
    // Apply to all routes except:
    // - /_next (Next.js internals)
    // - /api (API routes - backend handles auth)
    // - /favicon.ico (static file)
    '/((?!_next|api|favicon.ico).*)',
  ],
};
