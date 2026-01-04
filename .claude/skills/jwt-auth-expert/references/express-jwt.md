# Express.js JWT Authentication - Complete Implementation

## Complete Auth Routes (Continued)

```typescript
// src/routes/auth.ts (continued - Refresh endpoint)

    // Set new cookies
    res.cookie('accessToken', newAccessToken, {
      ...config.cookie,
      maxAge: 15 * 60 * 1000,
    })
    
    res.cookie('refreshToken', newRefreshToken, {
      ...config.cookie,
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    
    res.json({ message: 'Tokens refreshed successfully' })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({ error: 'Token refresh failed' })
  }
})

/**
 * Logout
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken
    
    // Blacklist access token
    if (accessToken) {
      try {
        const decoded = JWTService.verifyAccessToken(accessToken)
        await db.blacklistToken(decoded.jti!, decoded.exp!)
      } catch (error) {
        // Token might be expired, continue with logout
      }
    }
    
    // Delete refresh token from database
    if (refreshToken) {
      await db.deleteRefreshToken(refreshToken)
    }
    
    // Clear cookies
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' })
    
    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

export default router
```

## Main Server Setup

```typescript
// src/server.ts
import express from 'express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import cors from 'cors'
import { config } from './config/config'
import { apiLimiter } from './middleware/rateLimiter'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies
}))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cookie parsing
app.use(cookieParser())

// Rate limiting
app.use('/api', apiLimiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Error handling
app.use(errorHandler)

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
  console.log(`Environment: ${config.nodeEnv}`)
})

export default app
```

## Protected User Routes

```typescript
// src/routes/users.ts
import { Router, Request, Response } from 'express'
import { authenticateToken, authorizeRole } from '../middleware/auth'
import { db } from '../config/database'

const router = Router()

/**
 * Get current user profile (requires authentication)
 */
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await db.findUserById(req.user!.sub)
    
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    
    // Return user without sensitive data
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

/**
 * Get all users (admin only)
 */
router.get(
  '/all',
  authenticateToken,
  authorizeRole('admin'),
  async (req: Request, res: Response) => {
    try {
      const users = await db.getAllUsers()
      
      res.json({
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        }))
      })
    } catch (error) {
      console.error('Get all users error:', error)
      res.status(500).json({ error: 'Failed to get users' })
    }
  }
)

export default router
```

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'

# Login (cookies will be set automatically)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt

# Access protected route (using saved cookies)
curl -X GET http://localhost:3000/api/users/profile \
  -b cookies.txt

# Refresh tokens
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## Database Models (TypeScript interfaces)

```typescript
// src/models/User.ts
export interface User {
  id: string
  email: string
  password: string // hashed
  name: string
  role: 'user' | 'admin' | 'moderator'
  permissions: string[]
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

// src/models/RefreshToken.ts
export interface RefreshToken {
  id: string
  userId: string
  token: string
  tokenFamily: string
  expiresAt: Date
  createdAt: Date
}

// src/models/BlacklistedToken.ts
export interface BlacklistedToken {
  jti: string
  expiresAt: number
}
```

## Best Practices Summary

✅ **DO:**
- Store tokens in HTTP-only cookies
- Use bcrypt with 12+ rounds for passwords
- Implement refresh token rotation
- Add rate limiting on auth endpoints
- Validate password strength
- Blacklist tokens on logout
- Use HTTPS in production
- Set secure cookie flags
- Implement CSRF protection
- Add comprehensive error handling

❌ **DON'T:**
- Store tokens in localStorage
- Use weak JWT secrets
- Skip token expiration
- Expose password hashes
- Use plaintext passwords
- Allow unlimited login attempts
- Send tokens in URL parameters
- Use the same secret for access and refresh tokens