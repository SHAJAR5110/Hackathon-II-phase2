# React Security Checklist

## Critical: Prevent Backend Data Exposure

### ❌ Console Logging Sensitive Data

**Problem:**
```typescript
// ❌ CRITICAL - Exposes sensitive data in browser console
const LoginComponent = () => {
  const handleLogin = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    
    // CRITICAL SECURITY ISSUE - Logs everything from backend
    console.log('Login response:', data)
    // May include: tokens, hashes, internal IDs, sensitive user data
    
    return data
  }
  
  return <form>{/* ... */}</form>
}
```

**Solution:**
```typescript
// ✅ SECURE - Sanitized logging
const LoginComponent = () => {
  const handleLogin = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      const error = await response.json()
      // Only log non-sensitive error message
      console.error('Login failed:', error.message)
      throw new Error(error.message)
    }
    
    const data = await response.json()
    
    // Only log success status, never data
    console.log('Login successful')
    
    // Return only what frontend needs
    return {
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email
      }
      // NEVER return: tokens, password hashes, internal structures
    }
  }
  
  return <form>{/* ... */}</form>
}
```

### ❌ Displaying Backend Structures in Components

**Problem:**
```typescript
// ❌ CRITICAL - Renders entire backend response
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser) // Stores EVERYTHING from backend
  }, [userId])
  
  // ❌ May expose password_hash, ssn, internal_id, etc. in React DevTools
  return (
    <div>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
```

**Solution:**
```typescript
// ✅ SECURE - Only use/store necessary data
interface SafeUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }
        
        const data = await response.json()
        
        // Extract ONLY safe, necessary fields
        const safeUser: SafeUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          avatarUrl: data.avatarUrl
        }
        
        setUser(safeUser)
      } catch (err) {
        console.error('Error fetching user')
        setError('Failed to load user')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUser()
  }, [userId])
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!user) return <div>User not found</div>
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

## XSS (Cross-Site Scripting) Prevention

### ❌ Dangerous HTML Rendering

**Problem:**
```typescript
// ❌ CRITICAL - XSS vulnerability
function CommentDisplay({ comment }: { comment: string }) {
  // If comment contains <script>alert('XSS')</script>, it will execute!
  return <div dangerouslySetInnerHTML={{ __html: comment }} />
}
```

**Solution:**
```typescript
// ✅ SECURE - React escapes by default
function CommentDisplay({ comment }: { comment: string }) {
  // React automatically escapes HTML entities
  return <div>{comment}</div>
}

// ✅ If you MUST render HTML, sanitize first
import DOMPurify from 'dompurify'

function RichTextDisplay({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  })
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}
```

### ❌ URL Injection

**Problem:**
```typescript
// ❌ Potential XSS via javascript: URLs
function LinkComponent({ url }: { url: string }) {
  return <a href={url}>Click here</a>
  // Dangerous if url = "javascript:alert('XSS')"
}
```

**Solution:**
```typescript
// ✅ SECURE - Validate URL protocol
function LinkComponent({ url }: { url: string }) {
  const isSafeUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url, window.location.origin)
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }
  
  if (!isSafeUrl(url)) {
    console.warn('Unsafe URL blocked:', url)
    return <span>Invalid link</span>
  }
  
  return <a href={url} rel="noopener noreferrer">Click here</a>
}
```

## Input Validation

### ❌ Frontend-Only Validation

**Problem:**
```typescript
// ❌ Security issue - frontend validation is NOT security
function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Frontend validation (UX only, easily bypassed)
    if (!email.includes('@')) {
      alert('Invalid email')
      return
    }
    
    // Sends directly to backend without backend validation
    await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }
  
  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

**Solution:**
```typescript
// ✅ SECURE - Validate on both frontend (UX) and backend (security)
import { z } from 'zod'

const emailSchema = z.string().email()
const passwordSchema = z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[!@#$%^&*]/)

function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Frontend validation (UX only)
    try {
      emailSchema.parse(email)
      passwordSchema.parse(password)
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      }
      return
    }
    
    // Send to backend
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        const data = await response.json()
        // Backend validation MUST also occur
        setError(data.message || 'Registration failed')
        return
      }
      
      // Success
      console.log('Registration successful')
    } catch (err) {
      setError('Network error')
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Register</button>
    </form>
  )
}
```

## API Security

### ❌ Hardcoded API Keys in Frontend

**Problem:**
```typescript
// ❌ CRITICAL - API key exposed in frontend code
const STRIPE_KEY = 'sk_live_abc123xyz' // VISIBLE IN BROWSER!

function PaymentComponent() {
  const stripe = new Stripe(STRIPE_KEY)
  // ...
}
```

**Solution:**
```typescript
// ✅ SECURE - API calls through your backend
function PaymentComponent() {
  const handlePayment = async (amount: number) => {
    // Call YOUR backend, which uses the secret key
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    
    const { clientSecret } = await response.json()
    
    // Use clientSecret with Stripe.js (public key is OK)
    const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)
    // ...
  }
  
  return <button onClick={() => handlePayment(1000)}>Pay</button>
}
```

### ❌ Sensitive Data in URL Parameters

**Problem:**
```typescript
// ❌ CRITICAL - Sensitive data in URL (appears in logs, browser history)
fetch(`/api/users?ssn=${userSSN}&creditCard=${cardNumber}`)
```

**Solution:**
```typescript
// ✅ SECURE - Use POST with request body
fetch('/api/users/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ssn: userSSN,
    creditCard: cardNumber
  })
})
```

## Authentication & Authorization

### ❌ Storing Tokens in localStorage

**Problem:**
```typescript
// ❌ CRITICAL - Vulnerable to XSS attacks
const handleLogin = async (email: string, password: string) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  
  const { token } = await response.json()
  
  // ❌ Accessible to any JavaScript on the page (XSS risk)
  localStorage.setItem('authToken', token)
}

// Usage
const token = localStorage.getItem('authToken')
fetch('/api/protected', {
  headers: { Authorization: `Bearer ${token}` }
})
```

**Solution:**
```typescript
// ✅ SECURE - Backend sets HTTP-only cookie
const handleLogin = async (email: string, password: string) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    credentials: 'include', // Include cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  
  if (!response.ok) {
    throw new Error('Login failed')
  }
  
  // Backend sets HTTP-only, Secure cookie
  // No token stored in JavaScript!
  return response.json()
}

// Usage - cookie sent automatically
fetch('/api/protected', {
  credentials: 'include' // Sends cookie automatically
})
```

## CSRF Protection

### ❌ No CSRF Protection

**Problem:**
```typescript
// ❌ Vulnerable to CSRF attacks
function DeleteAccountButton() {
  const handleDelete = async () => {
    await fetch('/api/account/delete', {
      method: 'POST',
      credentials: 'include' // Sends auth cookie
    })
    // Malicious site could trigger this!
  }
  
  return <button onClick={handleDelete}>Delete Account</button>
}
```

**Solution:**
```typescript
// ✅ SECURE - Include CSRF token
import { useEffect, useState } from 'react'

function DeleteAccountButton() {
  const [csrfToken, setCsrfToken] = useState<string>('')
  
  useEffect(() => {
    // Fetch CSRF token on mount
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setCsrfToken(data.token))
  }, [])
  
  const handleDelete = async () => {
    if (!csrfToken) return
    
    await fetch('/api/account/delete', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      }
    })
  }
  
  return (
    <button onClick={handleDelete} disabled={!csrfToken}>
      Delete Account
    </button>
  )
}
```

## Content Security Policy

**Implementation:**
```typescript
// next.config.js or in your HTML meta tags
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.example.com;
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

## Security Checklist

**Critical (Must Fix Immediately):**
- [ ] No sensitive data in console.log()
- [ ] No backend data structures exposed in frontend
- [ ] No hardcoded API keys or secrets
- [ ] No tokens in localStorage (use HTTP-only cookies)
- [ ] No sensitive data in URL parameters
- [ ] Input validation on BOTH frontend and backend
- [ ] Sanitize all user-generated content before rendering
- [ ] Validate URL protocols before using in href

**High Priority:**
- [ ] CSRF protection on state-changing requests
- [ ] Content Security Policy configured
- [ ] XSS protection (sanitize HTML)
- [ ] Authentication via secure cookies only
- [ ] Rate limiting on sensitive endpoints
- [ ] HTTPS enforced in production
- [ ] Security headers configured

**Medium Priority:**
- [ ] File upload validation (type, size)
- [ ] Proper error handling (no stack traces to user)
- [ ] Dependencies up-to-date (npm audit)
- [ ] TypeScript strict mode enabled
- [ ] No dangerouslySetInnerHTML without sanitization

## Development Best Practices

**Environment Variables:**
```typescript
// ✅ Public data only (visible in browser)
const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY

// ❌ NEVER expose backend secrets in frontend
// const secretKey = process.env.STRIPE_SECRET_KEY // WRONG in frontend!
```

**Error Messages:**
```typescript
// ❌ Exposes internal structure
catch (error) {
  console.error('Database error:', error.stack)
  setError(error.message) // May reveal DB structure
}

// ✅ Generic user-facing message
catch (error) {
  console.error('Internal error occurred') // Log without details
  setError('Something went wrong. Please try again.')
}
```

**Production Checklist:**
- Remove all console.log() statements
- Enable React strict mode
- Run security audit: `npm audit`
- Check for exposed secrets: `git secrets --scan`
- Verify HTTPS is enforced
- Test with React DevTools (no sensitive data visible)