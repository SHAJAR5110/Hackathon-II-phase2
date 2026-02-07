# Architecture Documentation - Todo Task Manager

This document outlines the architectural decisions, design trade-offs, and technical implementation of the Todo Task Manager full-stack application.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Architectural Decision Records (ADRs)](#architectural-decision-records-adrs)
3. [Design Trade-Offs](#design-trade-offs)
4. [Security Architecture](#security-architecture)
5. [Data Model](#data-model)
6. [API Design](#api-design)
7. [Future Enhancements](#future-enhancements)

---

## System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      User Layer                               │
│  (Web Browsers: Chrome, Firefox, Safari, Edge)               │
└────────────────────┬─────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                   Frontend Layer                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Next.js 14+ (App Router)                              │  │
│  │  - React 19+ Components                                 │  │
│  │  - TypeScript for type safety                          │  │
│  │  - Tailwind CSS for styling                            │  │
│  │  - Server Components + Client Components               │  │
│  │  - Middleware for route protection                     │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────────┘
                     │ REST API (JSON)
                     │ Authorization: Bearer <JWT>
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                   Backend Layer                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  FastAPI (async ASGI)                                  │  │
│  │  - JWT Authentication Middleware                       │  │
│  │  - Route Handlers (auth, tasks)                        │  │
│  │  - Business Logic (services)                           │  │
│  │  - Pydantic Validation                                 │  │
│  │  - SQLModel ORM                                        │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────────┘
                     │ SQL Queries (async)
                     │ Connection Pooling
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                   Database Layer                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Neon Serverless PostgreSQL                            │  │
│  │  - Users table (id, email, password_hash, name)       │  │
│  │  - Tasks table (id, user_id, title, description, ...)  │  │
│  │  - Indexes for performance                             │  │
│  │  - Foreign key constraints                             │  │
│  │  - Automated backups                                   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Component Diagram

```
Frontend Components:
┌───────────────────────────────────────────┐
│ App Layout (layout.tsx)                   │
│  ├── Header (navigation, logout)          │
│  └── Page Content                         │
│      ├── Dashboard (app/page.tsx)         │
│      │   ├── TaskForm (create tasks)      │
│      │   ├── TaskList (display tasks)     │
│      │   │   └── TaskItem (single task)   │
│      └── Auth Pages                       │
│          ├── Signup (SignupForm)          │
│          └── Signin (SigninForm)          │
└───────────────────────────────────────────┘

Backend Components:
┌───────────────────────────────────────────┐
│ FastAPI Application (main.py)             │
│  ├── Middleware                           │
│  │   └── JWT Authentication               │
│  ├── Routes                               │
│  │   ├── /auth (signup, signin, logout)  │
│  │   └── /api/tasks (CRUD + complete)    │
│  ├── Services                             │
│  │   └── AuthService (password, JWT)     │
│  ├── Models                               │
│  │   ├── User (ORM)                       │
│  │   ├── Task (ORM)                       │
│  │   └── Pydantic Schemas                │
│  └── Database                             │
│      └── Session Management               │
└───────────────────────────────────────────┘
```

---

## Architectural Decision Records (ADRs)

### ADR-001: Why JWT with 7-Day Expiry?

**Status**: Accepted

**Context**:
We needed a stateless authentication mechanism that:
- Scales horizontally without shared session storage
- Works across multiple devices
- Provides reasonable security without excessive token refresh complexity

**Decision**:
Use JWT (JSON Web Tokens) with:
- 7-day expiration period
- HS256 algorithm (HMAC with SHA-256)
- User ID stored in `sub` claim
- Stored in HTTP-only cookies (frontend)

**Alternatives Considered**:
1. **Session-based auth** (server-side sessions)
   - ❌ Requires Redis/database for session storage
   - ❌ Doesn't scale horizontally without session sharing
   - ✅ More secure (can be revoked immediately)

2. **OAuth 2.0** (third-party providers)
   - ❌ More complex to implement
   - ❌ Depends on external services
   - ✅ Industry standard for authorization

3. **Short-lived JWT (15 min) + Refresh Tokens**
   - ❌ More complex implementation
   - ❌ Requires refresh token storage and rotation
   - ✅ More secure (shorter token lifetime)

**Consequences**:
- ✅ **Pros**:
  - Stateless (no server-side session storage)
  - Scales horizontally
  - Works across multiple devices
  - Simple implementation
  - Standard industry practice

- ❌ **Cons**:
  - Tokens cannot be revoked before expiration
  - 7-day window of vulnerability if token is compromised
  - Larger payload size compared to session IDs

**Mitigation**:
- Use HTTPS to prevent token interception
- Store tokens in HTTP-only cookies (prevents XSS)
- Implement token blacklisting for logout (future enhancement)

---

### ADR-002: Why SQLModel ORM Instead of Raw SQL?

**Status**: Accepted

**Context**:
We needed a database abstraction layer that:
- Prevents SQL injection attacks
- Provides type safety
- Simplifies query construction
- Works with async/await (FastAPI requirement)

**Decision**:
Use SQLModel (SQLAlchemy + Pydantic integration) for database operations.

**Alternatives Considered**:
1. **Raw SQL queries**
   - ❌ Vulnerable to SQL injection if not parameterized
   - ❌ No type safety
   - ❌ Verbose and error-prone
   - ✅ Maximum performance

2. **SQLAlchemy Core**
   - ✅ Prevents SQL injection
   - ❌ Less integration with Pydantic
   - ❌ More verbose than SQLModel
   - ✅ Good performance

3. **Tortoise ORM**
   - ✅ Native async support
   - ❌ Less mature ecosystem
   - ❌ Steeper learning curve
   - ✅ Good performance

**Consequences**:
- ✅ **Pros**:
  - SQL injection prevention (parameterized queries)
  - Type safety (Pydantic models)
  - Clean, readable code
  - Seamless FastAPI integration
  - Automatic validation

- ❌ **Cons**:
  - Slight performance overhead (vs raw SQL)
  - Learning curve for developers unfamiliar with ORMs
  - Complex queries may require raw SQL fallback

**Performance Impact**:
- ~5-10% overhead compared to raw SQL
- Acceptable for MVP and small-to-medium scale applications
- Can optimize with indexes and query tuning

---

### ADR-003: Why Monorepo Structure?

**Status**: Accepted

**Context**:
We needed to organize frontend and backend codebases in a way that:
- Simplifies development workflow
- Enables code sharing (types, constants)
- Facilitates deployment

**Decision**:
Use a monorepo structure with `/backend` and `/frontend` directories.

**Alternatives Considered**:
1. **Separate repositories (polyrepo)**
   - ❌ Harder to keep types in sync
   - ❌ More complex dependency management
   - ✅ Independent deployment pipelines
   - ✅ Clearer separation of concerns

2. **Monorepo with shared packages** (e.g., `/packages/shared`)
   - ✅ Code sharing (types, utils)
   - ❌ More complex setup (Turborepo, Nx)
   - ❌ Overkill for small project

**Consequences**:
- ✅ **Pros**:
  - Single git repository
  - Easier to keep API types in sync
  - Simplified local development
  - Atomic commits across frontend and backend

- ❌ **Cons**:
  - Mixed dependencies (Python + Node.js)
  - Larger repository size
  - Deployment requires separate pipelines

**Mitigation**:
- Use separate deployment pipelines for frontend and backend
- Document setup clearly in README files
- Keep dependencies isolated (no cross-contamination)

---

### ADR-004: Why Next.js 14+ App Router Instead of Pages Router?

**Status**: Accepted

**Context**:
We needed a React framework that:
- Supports server-side rendering (SSR)
- Optimizes performance (Core Web Vitals)
- Provides excellent developer experience
- Simplifies routing and middleware

**Decision**:
Use Next.js 14+ with App Router (not Pages Router).

**Alternatives Considered**:
1. **Next.js Pages Router**
   - ✅ More mature, stable
   - ❌ Less efficient data fetching
   - ❌ No Server Components
   - ❌ More complex layouts

2. **Create React App (CRA)**
   - ❌ Client-side only (no SSR)
   - ❌ Slower initial load
   - ❌ No built-in routing
   - ✅ Simpler setup

3. **Remix**
   - ✅ Great data fetching
   - ❌ Smaller ecosystem
   - ❌ Less adoption
   - ✅ Server-first approach

**Consequences**:
- ✅ **Pros**:
  - React Server Components (better performance)
  - Streaming SSR
  - Simplified data fetching
  - Built-in routing with file-system
  - Excellent SEO support

- ❌ **Cons**:
  - Learning curve (Server vs Client Components)
  - App Router is newer (less community resources)
  - Some libraries don't support Server Components

**Migration Path**:
If App Router becomes problematic, we can migrate to Pages Router with minimal refactoring.

---

### ADR-005: Why Neon Serverless PostgreSQL?

**Status**: Accepted

**Context**:
We needed a database that:
- Scales automatically
- Requires minimal maintenance
- Provides good performance
- Offers free tier for development

**Decision**:
Use Neon Serverless PostgreSQL for primary database.

**Alternatives Considered**:
1. **Self-hosted PostgreSQL**
   - ✅ Full control
   - ❌ Requires server management
   - ❌ Manual backups and scaling
   - ✅ No vendor lock-in

2. **AWS RDS PostgreSQL**
   - ✅ Managed service
   - ❌ Requires AWS account and billing
   - ❌ More expensive
   - ✅ Robust and battle-tested

3. **MongoDB (NoSQL)**
   - ✅ Flexible schema
   - ❌ No ACID transactions
   - ❌ Less suitable for relational data
   - ✅ Easier horizontal scaling

**Consequences**:
- ✅ **Pros**:
  - Serverless (auto-scales, pay-per-use)
  - Automated backups
  - Connection pooling built-in
  - Great developer experience
  - Free tier for development

- ❌ **Cons**:
  - Vendor lock-in (Neon-specific features)
  - Cold start latency (first query after idle)
  - Less control over database configuration

**Migration Path**:
Database uses standard PostgreSQL, so migration to self-hosted or AWS RDS is straightforward (pg_dump/pg_restore).

---

### ADR-006: Why Tailwind CSS Instead of CSS-in-JS?

**Status**: Accepted

**Context**:
We needed a styling solution that:
- Provides responsive design utilities
- Ensures design consistency
- Optimizes bundle size
- Works with Server Components

**Decision**:
Use Tailwind CSS for all styling.

**Alternatives Considered**:
1. **CSS-in-JS (styled-components, Emotion)**
   - ✅ Scoped styles
   - ❌ Runtime overhead
   - ❌ Doesn't work with Server Components
   - ❌ Larger bundle size

2. **CSS Modules**
   - ✅ Scoped styles
   - ❌ Separate CSS files
   - ❌ Less utility-first approach
   - ✅ Works with Server Components

3. **Plain CSS**
   - ✅ No dependencies
   - ❌ Global namespace pollution
   - ❌ No built-in responsive utilities
   - ✅ Familiar to all developers

**Consequences**:
- ✅ **Pros**:
  - Utility-first approach (rapid development)
  - Purges unused CSS (small bundle size)
  - Responsive design utilities built-in
  - Works with Server Components
  - Design consistency via design tokens

- ❌ **Cons**:
  - HTML markup can become verbose
  - Learning curve for new developers
  - Requires PostCSS build step

**Performance Impact**:
- Production CSS bundle: ~5-10KB (purged)
- No runtime performance cost
- Excellent Core Web Vitals

---

## Design Trade-Offs

### Performance vs Simplicity

**Trade-Off**: We chose simplicity over maximum performance in several areas:
- **ORM vs Raw SQL**: 5-10% performance overhead acceptable for cleaner code
- **JWT expiry (7 days)**: Longer expiry reduces refresh complexity but increases security risk window
- **No Redis caching**: Simpler stack, but database hit on every request

**Justification**: For MVP and small-to-medium scale applications, simplicity and developer velocity are more valuable than micro-optimizations. We can add caching, query optimization, and refresh tokens later if needed.

### Security vs User Experience

**Trade-Off**: We balanced security with UX:
- **7-day JWT expiry**: Long enough to avoid frequent re-logins, short enough to limit exposure
- **HTTP-only cookies**: Prevents XSS but complicates mobile app integration
- **Strict user isolation**: Every query filters by user_id (small performance cost)

**Justification**: Security is non-negotiable. User data must be protected. The UX impact is minimal (re-login every 7 days is acceptable).

### Flexibility vs Convention

**Trade-Off**: We chose convention over flexibility:
- **Next.js App Router** (file-system routing)
- **FastAPI** (opinionated structure)
- **SQLModel** (ORM abstractions)

**Justification**: Conventions speed up development and reduce cognitive load. Flexibility can be added later if specific use cases require it.

---

## Security Architecture

### Defense in Depth

We implement security at multiple layers:

**1. Frontend (Client-Side)**
- Input validation before API calls
- JWT stored in HTTP-only cookies (prevents XSS)
- No sensitive data in localStorage or client state
- CSRF protection via SameSite cookies

**2. API Layer (Backend)**
- JWT signature validation on every request
- Rate limiting (to be implemented)
- CORS restricted to trusted origins
- Request body validation with Pydantic
- Descriptive error messages (no stack traces exposed)

**3. Business Logic (Services)**
- Password hashing with bcrypt (cost factor 12)
- User isolation enforced in all queries
- Permission checks before updates/deletes
- SQL injection prevention via ORM

**4. Database Layer**
- Foreign key constraints
- NOT NULL constraints on required fields
- Unique constraints on email
- Indexes for performance (not security)

### Threat Model

**Threats Addressed**:
- ✅ SQL Injection: Prevented by ORM (parameterized queries)
- ✅ XSS: Prevented by React's auto-escaping + HTTP-only cookies
- ✅ CSRF: Prevented by SameSite cookies + CORS
- ✅ Brute force: Rate limiting (to be implemented)
- ✅ Data leakage: Strict user isolation in queries

**Threats Not Fully Addressed** (future enhancements):
- ❌ Token revocation: No blacklist mechanism (users can't immediately revoke tokens)
- ❌ Account takeover: No MFA (multi-factor authentication)
- ❌ Rate limiting: No protection against API abuse
- ❌ DDoS protection: Relies on infrastructure (Vercel, Railway, etc.)

---

## Data Model

### Entity-Relationship Diagram

```
┌──────────────────────┐         ┌──────────────────────┐
│       User           │         │       Task           │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)              │◄────────│ id (PK)              │
│ email (UNIQUE)       │    1    │ user_id (FK)         │
│ password_hash        │    │    │ title                │
│ name                 │    │    │ description          │
│ created_at           │    │    │ completed            │
│ updated_at           │    │    │ created_at           │
└──────────────────────┘    │    │ updated_at           │
                            *    └──────────────────────┘
                         (many)

Relationship: One user can have many tasks.
```

### Database Indexes

**Performance Optimization**:
- `idx_tasks_user_id`: Fast filtering by user
- `idx_tasks_completed`: Fast filtering by completion status
- `idx_tasks_user_completed`: Composite index for user + status queries
- `idx_tasks_user_created_desc`: Sorted list of user's tasks (newest first)

**Query Performance**:
- List all tasks for user: `O(log n)` with index
- Filter by completion status: `O(log n)` with composite index
- Get single task: `O(1)` with primary key

---

## API Design

### RESTful Principles

We follow REST conventions:
- **GET**: Retrieve resources (idempotent, cacheable)
- **POST**: Create resources (not idempotent)
- **PUT**: Update entire resource (idempotent)
- **PATCH**: Partial update (idempotent)
- **DELETE**: Remove resource (idempotent)

### HTTP Status Codes

- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST (resource created)
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid input (validation errors)
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Authenticated but not authorized (permission denied)
- **404 Not Found**: Resource doesn't exist or user doesn't own it
- **409 Conflict**: Resource already exists (e.g., email already registered)
- **500 Internal Server Error**: Unexpected server error

### API Versioning

Currently no versioning (v1 implied). Future strategy:
- URL versioning: `/api/v2/tasks`
- Header versioning: `Accept: application/vnd.todoapp.v2+json`

---

## Future Enhancements

### Planned Features

1. **Token Refresh**: Short-lived JWT + refresh tokens for better security
2. **Task Priorities**: Add priority field (low, medium, high)
3. **Task Due Dates**: Add due_date field with reminders
4. **Task Tags**: Many-to-many relationship for categorization
5. **Task Sharing**: Share tasks with other users (read-only or editable)
6. **Real-Time Updates**: WebSocket support for live collaboration
7. **File Attachments**: Upload files to tasks (AWS S3 integration)
8. **Search**: Full-text search on task titles and descriptions
9. **Pagination**: Limit/offset or cursor-based pagination for large task lists
10. **Rate Limiting**: Prevent API abuse
11. **Email Notifications**: Task reminders, password reset
12. **Multi-Factor Authentication (MFA)**: TOTP or SMS-based 2FA

### Scalability Considerations

**Current Limitations**:
- Single database instance (Neon scales automatically)
- No caching layer (every request hits database)
- No CDN for static assets (Next.js on Vercel handles this)

**Scaling Strategy** (when needed):
1. **100-1,000 users**: Current architecture sufficient
2. **1,000-10,000 users**: Add Redis caching, database read replicas
3. **10,000-100,000 users**: Add load balancer, horizontal scaling, CDN
4. **100,000+ users**: Microservices, message queues, event-driven architecture

---

## Conclusion

This architecture balances:
- **Simplicity**: Easy to understand and maintain
- **Security**: Multiple layers of protection
- **Performance**: Optimized for common use cases
- **Scalability**: Can grow with user base

All decisions are documented with clear rationale and can be revisited as requirements evolve.

---

*Last updated: January 4, 2026*
