/**
 * Protected Route Component
 * Phase II - Todo Full-Stack Web Application
 *
 * Protects components from being rendered if user is not authenticated.
 * Handles client-side authentication check after hydration.
 * Redirects to signin if not authenticated (handled by middleware).
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = '/auth/signin',
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Check authentication after hydration
    const authenticated = isAuthenticated();
    const user = getUser();

    if (!authenticated || !user) {
      // Redirect to signin page
      router.push(redirectTo);
    } else {
      // User is authenticated, allow rendering
      setIsAuthed(true);
    }

    // Mark component as mounted (hydration complete)
    setIsMounted(true);
  }, [router, redirectTo]);

  // During SSR and hydration, render nothing to avoid mismatch
  // Once mounted, check authentication
  if (!isMounted || !isAuthed) {
    return null;
  }

  // If authenticated and mounted, render children
  return <>{children}</>;
}
