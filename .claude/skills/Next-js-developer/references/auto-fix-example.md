# Auto-Fix Examples - Before & After

## Critical Security Fixes

### Example 1: Remove Hardcoded API Keys

**❌ BEFORE - CRITICAL SECURITY ISSUE**
```typescript
// app/api/payment/route.ts
export async function POST(req: Request) {
  // CRITICAL: API key exposed in source code!
  const stripe = new Stripe("sk_live_abc123xyz789")
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: "usd"
  })
  
  return Response.json({ clientSecret: paymentIntent.client_secret })
}
```

**✅ AFTER - FIXED**
```typescript
// app/api/payment/route.ts
export async function POST(req: Request) {
  // API key from environment variable (secure)
  const apiKey = process.env.STRIPE_SECRET_KEY
  
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY not configured in environment variables")
  }
  
  const stripe = new Stripe(apiKey)
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: "usd"
  })
  
  return Response.json({ clientSecret: paymentIntent.client_secret })
}
```

**Additional: .env.local**
```bash
STRIPE_SECRET_KEY=sk_live_abc123xyz789
```

### Example 2: Remove Sensitive Console Logs

**❌ BEFORE - DATA LEAK**
```typescript
// app/api/users/route.ts
export async function GET(req: Request) {
  const users = await db.query(`
    SELECT id, name, email, password_hash, ssn, credit_card
    FROM users
  `)
  
  // CRITICAL: Logs sensitive data to console!
  console.log("Users:", users)
  console.log("User data:", JSON.stringify(users))
  
  return Response.json({ users })
}
```

**✅ AFTER - FIXED**
```typescript
// app/api/users/route.ts
export async function GET(req: Request) {
  const users = await db.query(`
    SELECT id, name, email, password_hash, ssn, credit_card
    FROM users
  `)
  
  // Log only non-sensitive info for debugging
  console.log(`Fetched ${users.length} users`)
  
  // Return only public fields to client
  const publicUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email
    // Exclude: password_hash, ssn, credit_card
  }))
  
  return Response.json({ users: publicUsers })
}
```

### Example 3: Hash Passwords Properly

**❌ BEFORE - PLAINTEXT PASSWORDS**
```typescript
// app/api/register/route.ts
export async function POST(req: Request) {
  const { email, password } = await req.json()
  
  // CRITICAL: Storing plaintext password!
  await db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password]
  )
  
  return Response.json({ success: true })
}
```

**✅ AFTER - HASHED PASSWORDS**
```typescript
// app/api/register/route.ts
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  
  // Validate password strength
  if (password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    )
  }
  
  // Hash password with bcrypt (12 rounds)
  const hashedPassword = await bcrypt.hash(password, 12)
  
  // Store hash, never plaintext
  await db.query(
    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
    [email, hashedPassword]
  )
  
  return Response.json({ success: true })
}
```

**Login verification:**
```typescript
// app/api/login/route.ts
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  
  const user = await db.query(
    "SELECT id, email, password_hash FROM users WHERE email = ?",
    [email]
  )
  
  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 })
  }
  
  // Compare plaintext password with hash
  const isValid = await bcrypt.compare(password, user.password_hash)
  
  if (!isValid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 })
  }
  
  // Generate JWT and set in HTTP-only cookie
  // (see Example 4)
  
  return Response.json({ success: true })
}
```

### Example 4: JWT in Secure Cookies (Not localStorage)

**❌ BEFORE - INSECURE TOKEN STORAGE**
```typescript
// app/api/login/route.ts
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  
  const user = await authenticateUser(email, password)
  
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )
  
  // ❌ Sending token to client for localStorage storage
  // This exposes token to XSS attacks!
  return Response.json({ token })
}
```

**Client-side (❌ INSECURE):**
```typescript
// components/login-form.tsx
"use client"

async function handleLogin(email: string, password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  })
  
  const { token } = await res.json()
  
  // ❌ CRITICAL: Token accessible to JavaScript (XSS risk)
  localStorage.setItem("token", token)
}
```

**✅ AFTER - SECURE COOKIE STORAGE**
```typescript
// app/api/login/route.ts
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  
  const user = await authenticateUser(email, password)
  
  // Generate access token (short-lived)
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  )
  
  // Generate refresh token (longer-lived)
  const refreshToken = jwt.sign(
    { userId: user.id, type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  )
  
  // Set tokens in HTTP-only, Secure cookies
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Set-Cookie": [
        `auth-token=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`,
        `refresh-token=${refreshToken}; Path=/api/auth/refresh; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
      ].join(", ")
    }
  })
}
```

**Middleware to verify token:**
```typescript
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  
  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"]
}
```

### Example 5: SQL Injection Prevention

**❌ BEFORE - SQL INJECTION VULNERABILITY**
```typescript
// app/api/users/[id]/route.ts
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // CRITICAL: SQL injection vulnerability!
  const query = `SELECT * FROM users WHERE id = ${params.id}`
  const user = await db.query(query)
  
  return Response.json({ user })
}

// Example attack: /api/users/1 OR 1=1
// Returns all users instead of just one!
```

**❌ BEFORE - String Concatenation (Also Vulnerable)**
```typescript
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // CRITICAL: Still vulnerable!
  const query = "SELECT * FROM users WHERE id = " + params.id
  const user = await db.query(query)
  
  return Response.json({ user })
}
```

**✅ AFTER - PARAMETERIZED QUERIES**
```typescript
// app/api/users/[id]/route.ts
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Parameterized query (safe from SQL injection)
  const user = await db.query(
    "SELECT id, name, email FROM users WHERE id = ?",
    [params.id]
  )
  
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 })
  }
  
  return Response.json({ user })
}
```

**✅ AFTER - Using ORM (Recommended)**
```typescript
// app/api/users/[id]/route.ts
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // ORM automatically prevents SQL injection
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true
      // password_hash excluded (secure)
    }
  })
  
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 })
  }
  
  return Response.json({ user })
}
```

### Example 6: Replace <img> with next/image

**❌ BEFORE - PERFORMANCE ISSUE**
```typescript
// components/hero.tsx
export default function HeroSection() {
  return (
    <div className="relative h-screen">
      <img
        src="/images/hero-background.jpg"
        alt="Hero background"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-5xl font-bold text-white">Welcome</h1>
      </div>
    </div>
  )
}
```

**✅ AFTER - OPTIMIZED**
```typescript
// components/hero.tsx
import Image from "next/image"

export default function HeroSection() {
  return (
    <div className="relative h-screen">
      <Image
        src="/images/hero-background.jpg"
        alt="Hero background"
        fill
        priority // Load immediately for above-fold images
        className="object-cover"
        sizes="100vw"
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-5xl font-bold text-white">Welcome</h1>
      </div>
    </div>
  )
}
```

**For specific dimensions:**
```typescript
<Image
  src="/images/product.jpg"
  alt="Product"
  width={800}
  height={600}
  className="rounded-lg"
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

## High Priority Fixes

### Example 7: Convert Client Component to Server Component

**❌ BEFORE - UNNECESSARY CLIENT COMPONENT**
```typescript
// app/blog/page.tsx
"use client"

import { useEffect, useState } from "react"

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  
  useEffect(() => {
    // Fetching on client side (slower, less secure)
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => setPosts(data))
  }, [])
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
```

**✅ AFTER - SERVER COMPONENT**
```typescript
// app/blog/page.tsx
import { db } from "@/lib/db"

export default async function BlogPage() {
  // Fetch directly on server (faster, more secure)
  const posts = await db.query(`
    SELECT id, title, excerpt, published_at
    FROM posts
    WHERE published = true
    ORDER BY published_at DESC
  `)
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
```

### Example 8: Add Error Boundary

**❌ BEFORE - NO ERROR HANDLING**
```typescript
// app/dashboard/page.tsx
export default async function Dashboard() {
  // If this throws, entire page crashes
  const data = await fetchCriticalData()
  
  return (
    <div>
      <CriticalComponent data={data} />
    </div>
  )
}
```

**✅ AFTER - WITH ERROR BOUNDARY**
```typescript
// app/dashboard/error.tsx
"use client"

export default function Error({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
      <p className="mt-2 text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  )
}

// app/dashboard/page.tsx
export default async function Dashboard() {
  // Error boundary will catch errors
  const data = await fetchCriticalData()
  
  return (
    <div>
      <CriticalComponent data={data} />
    </div>
  )
}
```

### Example 9: Add Loading States

**❌ BEFORE - NO LOADING STATE**
```typescript
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await fetchProducts() // User sees blank page while waiting
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

**✅ AFTER - WITH LOADING UI**
```typescript
// app/products/loading.tsx
export default function Loading() {
  return (
    <div className="grid grid-cols-3 gap-4 p-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
      ))}
    </div>
  )
}

// app/products/page.tsx
export default async function ProductsPage() {
  const products = await fetchProducts()
  
  return (
    <div className="grid grid-cols-3 gap-4 p-8">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Example 10: Add CSRF Protection

**❌ BEFORE - NO CSRF PROTECTION**
```typescript
// app/api/update-email/route.ts
export async function POST(req: Request) {
  const { userId, newEmail } = await req.json()
  
  // No CSRF protection - vulnerable to cross-site attacks!
  await db.query(
    "UPDATE users SET email = ? WHERE id = ?",
    [newEmail, userId]
  )
  
  return Response.json({ success: true })
}
```

**✅ AFTER - WITH CSRF PROTECTION**
```typescript
// lib/csrf.ts
import { randomBytes } from "crypto"

export function generateCSRFToken(): string {
  return randomBytes(32).toString("hex")
}

export function verifyCSRFToken(token: string, expected: string): boolean {
  return token === expected
}

// app/api/csrf-token/route.ts
export async function GET() {
  const token = generateCSRFToken()
  
  return new Response(JSON.stringify({ token }), {
    headers: {
      "Set-Cookie": `csrf-token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
    }
  })
}

// app/api/update-email/route.ts
export async function POST(req: Request) {
  const { userId, newEmail, csrfToken } = await req.json()
  
  // Verify CSRF token
  const cookieToken = req.cookies.get("csrf-token")?.value
  
  if (!cookieToken || csrfToken !== cookieToken) {
    return Response.json({ error: "Invalid CSRF token" }, { status: 403 })
  }
  
  // Verify authorization (user owns this resource)
  const currentUser = await getCurrentUser(req)
  if (currentUser.id !== userId) {
    return Response.json({ error: "Unauthorized" }, { status: 403 })
  }
  
  await db.query(
    "UPDATE users SET email = ? WHERE id = ?",
    [newEmail, userId]
  )
  
  return Response.json({ success: true })
}
```

## Summary of Auto-Fix Actions

**Critical (Immediate Auto-Fix):**
1. Remove hardcoded secrets → Environment variables
2. Remove sensitive console.log() → Sanitize or remove
3. Hash plaintext passwords → bcrypt with 12+ rounds
4. Fix SQL injection → Parameterized queries or ORM
5. Replace <img> → next/image

**High Priority (Propose & Fix):**
1. Convert unnecessary Client Components → Server Components
2. Add Error Boundaries → error.tsx files
3. Add Loading States → loading.tsx files
4. Add CSRF protection → Token verification
5. Add input validation → Zod schemas

**Before auto-fixing, always:**
- Create backups of original files
- Test fixes in development
- Verify functionality wasn't broken
- Update tests if needed
- Document what was changed and why