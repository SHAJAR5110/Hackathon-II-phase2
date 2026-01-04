/**
 * Header Component
 * Phase II - Todo Full-Stack Web Application
 *
 * Navigation header with app logo, user info, and logout button.
 */

'use client';

import { useAuth } from '@/lib/auth';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">
              Todo App
            </h1>
          </div>

          {/* User info and logout */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{user.name}</p>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="btn-secondary text-sm"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <a href="/auth/signin" className="text-sm text-gray-700 hover:text-primary-600">
                Sign In
              </a>
              <a href="/auth/signup" className="btn-primary text-sm">
                Sign Up
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
