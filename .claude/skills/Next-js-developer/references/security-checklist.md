# Security Checklist - Comprehensive Audit Guide

## Critical Security Checks

### 1. Secrets & API Keys

**Scan for:**
```bash
# Search for hardcoded secrets
grep -r "API_KEY\|SECRET\|PASSWORD\|sk_live\|pk_live" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"
```

**What to look for:**
- Hardcoded API keys, tokens, passwords
- Secrets in frontend code (Client Components, browser-accessible files)
- process.env without NEXT_PUBLIC_ prefix in client code
- Secrets committed to .env files (should use .env.local)

**Auto-fix:**
```typescript
// ❌ CRITICAL VULNERABILITY
const apiKey = "sk_live_abc123xyz"

// ✅ FIXED
const apiKey = process.env.STRIPE_SECRET_KEY
if (!apiKey) throw new Error("STRIPE_SECRET_KEY not configured")
```

### 2. Password Security

**Check for:**
- Passwords stored in plaintext
- Weak hashing algorithms (MD5, SHA1, SHA256 alone)
- Missing salt in password hashing
- Passwords logged anywhere

**Required implementation:**
```typescript
import bcrypt from "bcrypt"

// Registration
const hashedPassword = await bcrypt.hash(password, 12) // 12+ rounds

// Login verification
const isValid = await bcrypt.compare(password, user.password_hash)
```

**Never:**
- Store plaintext passwords
- Log passwords (even hashed)
- Return password hashes to frontend
- Use weak algorithms (MD5, SHA1)

### 3. Authentication & Session Management

**JWT Implementation:**
```typescript
// ✅ Secure JWT in HTTP-only cookie
export async function POST(req: Request) {
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h" // Short expiration
  })

  const refreshToken = jwt.sign(
    { userId: user.id, type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  )

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Set-Cookie": [
        `auth-token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`,
        `refresh-token=${refreshToken}; Path=/api/auth/refresh; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
      ].join(", ")
    }
  })
}
```

**Verify:**
- JWT tokens in HTTP-only, Secure cookies
- Token expiration implemented
- Refresh token rotation
- Proper logout (clear all tokens)
- NEVER store tokens in localStorage

### 4. SQL Injection Prevention

**Scan for:**
```bash
# Find potential SQL injection vulnerabilities
grep -r "query.*\${" --include="*.ts" --include="*.tsx"
grep -r "query.*+" --include="*.ts" --include="*.tsx"
```

**Vulnerable patterns:**
```typescript
// ❌ SQL INJECTION VULNERABILITY
const query = `SELECT * FROM users WHERE email = '${email}'`
const query = "SELECT * FROM users WHERE id = " + userId
```

**Secure patterns:**
```typescript
// ✅ Parameterized query (raw SQL)
const user = await db.query(
  "SELECT * FROM users WHERE email = ?",
  [email]
)

// ✅ ORM (Prisma, Drizzle, TypeORM)
const user = await prisma.user.findUnique({
  where: { email }
})
```

### 5. XSS (Cross-Site Scripting) Protection

**Content Security Policy (next.config.js):**
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
}
```

**Input Sanitization:**
```typescript
import DOMPurify from "isomorphic-dompurify"

// Sanitize user input before rendering
const sanitizedHTML = DOMPurify.sanitize(userInput)
```

**React automatic escaping:**
- React escapes content by default in JSX
- Use dangerouslySetInnerHTML only with sanitized content
- Never trust user input

### 6. CSRF Protection

**Implementation:**
```typescript
// Generate CSRF token (API route)
import { randomBytes } from "crypto"

export async function GET(req: Request) {
  const token = randomBytes(32).toString("hex")
  
  // Store in session or signed cookie
  return Response.json({ csrfToken: token }, {
    headers: {
      "Set-Cookie": `csrf-token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`
    }
  })
}

// Verify CSRF token (state-changing routes)
export async function POST(req: Request) {
  const { csrfToken } = await req.json()
  const cookieToken = req.cookies.get("csrf-token")
  
  if (csrfToken !== cookieToken?.value) {
    return Response.json({ error: "Invalid CSRF token" }, { status: 403 })
  }
  
  // Process request
}
```

**Required for:**
- All POST, PUT, DELETE, PATCH requests
- State-changing operations
- Forms that modify data

### 7. CORS Configuration

```typescript
// next.config.js or middleware
export async function middleware(req: NextRequest) {
  const origin = req.headers.get("origin")
  
  // Whitelist specific origins
  const allowedOrigins = [
    "https://yourdomain.com",
    "https://app.yourdomain.com"
  ]
  
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response("Forbidden", { status: 403 })
  }
  
  return NextResponse.next()
}
```

**Never:**
- Use `Access-Control-Allow-Origin: *` in production
- Allow arbitrary origins
- Skip CORS checks for sensitive endpoints

### 8. Input Validation

**Frontend validation (UX only):**
```typescript
import { z } from "zod"

const emailSchema = z.string().email()
const passwordSchema = z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/)
```

**Backend validation (REQUIRED):**
```typescript
export async function POST(req: Request) {
  const body = await req.json()
  
  // Validate on server ALWAYS
  const result = emailSchema.safeParse(body.email)
  
  if (!result.success) {
    return Response.json({ error: "Invalid email" }, { status: 400 })
  }
  
  // Process validated data
}
```

**Validate:**
- Email format
- Password strength
- Input length
- Data types
- File uploads (type, size, content)
- URL parameters

### 9. Environment Variables

**Structure:**
```
.env.local          # Secret keys (git-ignored)
.env.example        # Template (committed)
.env               # Defaults (optional)
```

**Usage:**
```typescript
// ✅ Backend only (Server Component, API route)
const secretKey = process.env.STRIPE_SECRET_KEY

// ✅ Public data (NEXT_PUBLIC_ prefix)
const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY

// ❌ NEVER in Client Component
"use client"
const secret = process.env.SECRET_KEY // EXPOSED TO BROWSER
```

**Verify:**
- .env.local in .gitignore
- No secrets in .env.example
- NEXT_PUBLIC_ only for truly public data
- Environment variables validated at startup

### 10. Error Handling

**Secure error responses:**
```typescript
export async function GET(req: Request) {
  try {
    const data = await fetchSensitiveData()
    return Response.json({ data })
  } catch (error) {
    // ❌ NEVER expose internal errors
    // return Response.json({ error: error.stack })
    
    // ✅ Log server-side, return generic message
    console.error("Internal error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

**Never expose:**
- Stack traces
- Database errors
- File paths
- Internal structure
- Environment details

### 11. Rate Limiting

```typescript
import { ratelimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown"
  
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429 }
    )
  }
  
  // Process request
}
```

**Implement on:**
- Login endpoints
- Registration endpoints
- Password reset
- API routes
- Form submissions

### 12. File Upload Security

```typescript
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get("file") as File
  
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: "Invalid file type" }, { status: 400 })
  }
  
  // Validate file size
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File too large" }, { status: 400 })
  }
  
  // Scan file content (not just extension)
  // Store with generated filename (don't trust user filename)
}
```

## Dependency Security

### Check for Vulnerabilities
```bash
npm audit
npm audit fix

# Check specific package
npm audit --package=package-name
```

### Update Dependencies
```bash
# Check outdated packages
npm outdated

# Update with care
npm update
```

## Security Headers Checklist

**next.config.js:**
```javascript
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on"
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin"
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ]
  }
}
```

## Complete Security Audit Checklist

- [ ] No hardcoded secrets or API keys
- [ ] Environment variables properly configured
- [ ] NEXT_PUBLIC_* only for public data
- [ ] Passwords hashed with bcrypt/argon2 (12+ rounds)
- [ ] JWT in HTTP-only, Secure cookies
- [ ] Token expiration and refresh implemented
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (CSP headers, input sanitization)
- [ ] CSRF tokens on state-changing requests
- [ ] CORS properly configured (whitelist origins)
- [ ] Rate limiting on sensitive endpoints
- [ ] Input validation on backend
- [ ] No sensitive data in console.log
- [ ] Error messages don't expose internals
- [ ] npm audit passing (no high/critical)
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] File uploads validated (type, size, content)
- [ ] Authentication on protected routes
- [ ] Authorization checks (user owns resource)