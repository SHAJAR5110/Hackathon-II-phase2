# Next.js JWT Authentication - Complete Implementation

## App Router Structure (Next.js 14+)

```
nextjs-jwt-auth/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── register/route.ts
│   │       ├── login/route.ts
│   │       ├── logout/route.ts
│   │       └── refresh/route.ts
│   ├── (protected)/
│   │   ├── dashboard/page.tsx
│   │   └── profile/page.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
├── lib/
│   ├── auth/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── middleware.ts
│   ├── db.ts
│   └── utils.ts
├── middleware.ts
└── .env.local
```

## Middleware for Route Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from './lib/auth/jwt'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  
  // Check if accessing protected route
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/profile')) {
    
    if (!token) {
      // Redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      // Verify token
      verifyAccessToken(token)
      return NextResponse.next()
    } catch (error) {
      // Token invalid or expired
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*']
}
```

## API Route: Login

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt'
import { comparePassword } from '@/lib/auth/password'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }
    
    // Find user
    const user = await db.findUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValid = await comparePassword(password, user.password)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Generate tokens
    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    })
    
    const refreshToken = generateRefreshToken(user.id)
    
    // Save refresh token
    await db.saveRefreshToken(user.id, refreshToken)
    
    // Set cookies
    cookies().set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    })
    
    cookies().set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/api/auth/refresh',
    })
    
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
```

## React Client Component

```typescript
// components/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }
      
      // Tokens are set in HTTP-only cookies automatically
      router.push('/dashboard')
      router.refresh() // Refresh to update server components
      
    } catch (error) {
      setError('Network error')
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
        className="w-full px-4 py-2 border rounded"
      />
      
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
        className="w-full px-4 py-2 border rounded"
      />
      
      {error && (
        <div className="text-red-600">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        {loading ? 'Loading...' : 'Login'}
      </button>
    </form>
  )
}
```

## Protected Server Component

```typescript
// app/dashboard/page.tsx
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/auth/jwt'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export default async function DashboardPage() {
  // Get token from cookie
  const token = cookies().get('accessToken')?.value
  
  if (!token) {
    redirect('/login')
  }
  
  try {
    // Verify token
    const payload = verifyAccessToken(token)
    
    // Fetch user data
    const user = await db.findUserById(payload.sub)
    
    return (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {user.name}!</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
      </div>
    )
  } catch (error) {
    redirect('/login')
  }
}
```

## Auto-Refresh on Token Expiry

```typescript
// lib/auth/refresh.ts
'use client'

import { useEffect } from 'use
'
import { useRouter } from 'next/navigation'

export function useTokenRefresh() {
  const router = useRouter()
  
  useEffect(() => {
    // Refresh token every 14 minutes (before 15min expiry)
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
        })
        
        if (!response.ok) {
          // Refresh failed, redirect to login
          router.push('/login')
          router.refresh()
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
      }
    }, 14 * 60 * 1000) // 14 minutes
    
    return () => clearInterval(interval)
  }, [router])
}

// Usage in layout
// components/Providers.tsx
'use client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useTokenRefresh()
  
  return <>{children}</>
}
```

## Best Practices

✅ Use middleware for route protection
✅ Server components for protected pages
✅ Client components for forms
✅ HTTP-only cookies for tokens
✅ Auto-refresh before expiry
✅ Redirect on auth failure