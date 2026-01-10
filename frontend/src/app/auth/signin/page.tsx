/**
 * Signin Page
 * Phase II - Todo Full-Stack Web Application
 *
 * User signin page with redirect if already authenticated.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/AuthLayout';
import SigninForm from '@/components/SigninForm';
import { isAuthenticated } from '@/lib/auth';

export default function SigninPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Welcome back! Sign in to your account"
    >
      <SigninForm />
    </AuthLayout>
  );
}
