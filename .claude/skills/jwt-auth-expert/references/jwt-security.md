# JWT Security Checklist - Complete Guide

## Critical Security Issues

### ❌ NEVER Store JWT in localStorage
**Problem:**
```javascript
// ❌ CRITICAL VULNERABILITY - Accessible to XSS attacks
localStorage.setItem('token', jwt)

const token = localStorage.getItem('token')
fetch('/api/protected', {
  headers: { Authorization: `Bearer ${token}` }
})
```

**Solution:**
```javascript
// ✅ HTTP-only cookie (set by backend)
res.cookie('accessToken', jwt, {
  httpOnly: true,        // Not accessible via JavaScript
  secure: true,          // HTTPS only
  sameSite: 'strict',    // CSRF protection
  maxAge: 15 * 60 * 1000 // 15 minutes
})

// Frontend - cookies sent automatically
fetch('/api/protected', {
  credentials: 'include' // Send cookies
})
```

### ❌ Weak JWT Secrets
**Problem:**
```javascript
// ❌ Weak secret
const token = jwt.sign(payload, 'secret123')
```

**Solution:**
```bash
# Generate strong secret (32+ bytes)
openssl rand -base64 32

# Use environment variable
JWT_SECRET=8Zz5tw0Ionm3XPZZfN0NOml3z9FMfmpgXwovR9fp6ryDIoGRM8EPHAB6iHsc0fb
```

### ❌ No Token Expiration
**Problem:**
```javascript
// ❌ Token never expires
const token = jwt.sign(payload, secret)
```

**Solution:**
```javascript
// ✅ Short-lived access token
const accessToken = jwt.sign(payload, secret, {
  expiresIn: '15m' // 15 minutes
})

// ✅ Long-lived refresh token
const refreshToken = jwt.sign(refreshPayload, refreshSecret, {
  expiresIn: '7d' // 7 days
})
```

### ❌ Plaintext Passwords
**Problem:**
```javascript
// ❌ CRITICAL - Never store plaintext
await db.users.create({
  email,
  password // Plaintext!
})
```

**Solution:**
```javascript
// ✅ Hash with bcrypt
import bcrypt from 'bcrypt'

const hashedPassword = await bcrypt.hash(password, 12) // 12+ rounds

await db.users.create({
  email,
  password: hashedPassword
})

// Verify on login
const isValid = await bcrypt.compare(password, user.password)
```

## Token Structure Best Practices

### Access Token Claims
```javascript
{
  // Standard claims
  "sub": "user_id",          // Subject (required)
  "iat": 1234567890,         // Issued at (required)
  "exp": 1234568790,         // Expires (required)
  "iss": "your-app-name",    // Issuer (recommended)
  "aud": "your-app-users",   // Audience (recommended)
  "jti": "unique_token_id",  // JWT ID for blacklisting
  
  // Custom claims (keep minimal)
  "email": "user@example.com",
  "role": "admin",
  "permissions": ["read", "write"]
}
```

### What NOT to Put in JWT
❌ Passwords (even hashed)
❌ Credit card numbers
❌ Social security numbers
❌ Large amounts of data (keeps token small)
❌ Sensitive personal information

## Token Refresh Best Practices

### ✅ Refresh Token Rotation
```javascript
// On token refresh:
// 1. Verify old refresh token
// 2. Generate NEW access token
// 3. Generate NEW refresh token
// 4. Invalidate old refresh token
// 5. Detect token reuse (security)

async function refreshTokens(oldRefreshToken) {
  const decoded = verifyRefreshToken(oldRefreshToken)
  
  // Check if token exists in database
  const storedToken = await db.findRefreshToken(oldRefreshToken)
  
  if (!storedToken) {
    // Token reuse detected - possible attack!
    // Invalidate entire token family
    await db.revokeTokenFamily(decoded.tokenFamily)
    throw new Error('Token reuse detected')
  }
  
  // Generate new tokens
  const newAccessToken = generateAccessToken(user)
  const newRefreshToken = generateRefreshToken(user, decoded.tokenFamily)
  
  // Delete old refresh token
  await db.deleteRefreshToken(oldRefreshToken)
  
  // Store new refresh token
  await db.saveRefreshToken(newRefreshToken)
  
  return { newAccessToken, newRefreshToken }
}
```

## Token Blacklisting (Logout)

### ✅ Using Redis
```javascript
import Redis from 'ioredis'

const redis = new Redis()

// Blacklist on logout
async function blacklistToken(token) {
  const decoded = jwt.verify(token, secret)
  const ttl = decoded.exp - Math.floor(Date.now() / 1000)
  
  // Store in Redis with expiration
  await redis.set(`blacklist:${decoded.jti}`, 'true', 'EX', ttl)
}

// Check on every request
async function isTokenBlacklisted(jti) {
  const result = await redis.get(`blacklist:${jti}`)
  return result === 'true'
}
```

## Rate Limiting

### ✅ Prevent Brute Force Attacks
```javascript
import rateLimit from 'express-rate-limit'

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true, // Don't count successful logins
})

app.post('/api/auth/login', loginLimiter, loginHandler)
```

## CSRF Protection

### ✅ SameSite Cookie Attribute
```javascript
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // Prevents CSRF
  maxAge: 15 * 60 * 1000
})
```

### ✅ CSRF Token (Double Submit Cookie)
```javascript
// Generate CSRF token
const csrfToken = crypto.randomBytes(32).toString('hex')

// Set in cookie
res.cookie('csrfToken', csrfToken, {
  httpOnly: false, // Readable by JavaScript
  secure: true,
  sameSite: 'strict',
})

// Also send in response body
res.json({ csrfToken })

// Verify on state-changing requests
app.post('/api/data', (req, res) => {
  const cookieToken = req.cookies.csrfToken
  const headerToken = req.headers['x-csrf-token']
  
  if (cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' })
  }
  
  // Process request
})
```

## Password Security

### ✅ Password Requirements
```javascript
function validatePassword(password) {
  const errors = []
  
  if (password.length < 8) {
    errors.push('Minimum 8 characters')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('At least one number')
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('At least one special character')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

## HTTPS Enforcement

### ✅ Production Configuration
```javascript
if (process.env.NODE_ENV === 'production') {
  // Force HTTPS
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`)
    }
    next()
  })
  
  // Set security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }))
}
```

## Security Checklist

**Token Storage**
- [ ] Tokens in HTTP-only cookies (NOT localStorage)
- [ ] Secure flag enabled in production
- [ ] SameSite=strict for CSRF protection
- [ ] Proper cookie path restrictions

**Token Generation**
- [ ] Strong JWT secrets (32+ bytes, random)
- [ ] Secrets in environment variables
- [ ] Different secrets for access/refresh tokens
- [ ] Token expiration set (15min access, 7d refresh)
- [ ] Unique jti (JWT ID) for blacklisting

**Password Security**
- [ ] Bcrypt with 12+ rounds
- [ ] Password strength validation
- [ ] Never log passwords
- [ ] Never return passwords in API responses

**Token Refresh**
- [ ] Refresh token rotation implemented
- [ ] Old tokens invalidated after refresh
- [ ] Token reuse detection
- [ ] Token family revocation on attack

**Logout**
- [ ] Token blacklisting implemented
- [ ] Refresh token deleted from database
- [ ] Cookies cleared

**Rate Limiting**
- [ ] Login attempts limited (5 per 15 min)
- [ ] API endpoints rate limited
- [ ] Registration rate limited

**HTTPS**
- [ ] HTTPS enforced in production
- [ ] Secure cookie flag enabled
- [ ] HSTS header set

**General**
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Error messages don't leak info
- [ ] Logging doesn't expose sensitive data