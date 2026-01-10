/**
 * Signup Page
 * Phase II - Todo Full-Stack Web Application
 *
 * User signup page with redirect if already authenticated.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/AuthLayout';
import SignupForm from '@/components/SignupForm';
import { isAuthenticated } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start organizing your tasks today"
    >
      <SignupForm />
    </AuthLayout>
  );
}
