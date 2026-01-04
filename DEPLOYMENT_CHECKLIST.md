# Production Deployment Checklist - Todo Task Manager

Complete checklist for deploying the Todo Task Manager to production. Follow every item to ensure a secure, reliable, and performant deployment.

---

## Pre-Deployment Checklist

### 1. Code Quality & Testing

- [ ] **All tests passing**
  ```bash
  cd backend && pytest tests/ -v --cov
  # Expected: 47+ passing tests, >80% coverage
  ```

- [ ] **No console.log() or print() in production code**
  ```bash
  # Frontend
  cd frontend && grep -r "console.log" app/ components/ lib/

  # Backend
  cd backend && grep -r "print(" routes/ services/ models.py
  ```

- [ ] **TypeScript compilation successful** (frontend)
  ```bash
  cd frontend && npx tsc --noEmit
  ```

- [ ] **Linting passes** (both frontend and backend)
  ```bash
  # Frontend
  cd frontend && npm run lint

  # Backend
  cd backend && flake8 . && mypy .
  ```

- [ ] **Code reviewed and approved**
  - [ ] PR reviewed by at least one team member
  - [ ] All review comments addressed
  - [ ] Changes tested manually

### 2. Environment Variables

- [ ] **Backend .env configured**
  - [ ] `DATABASE_URL` set to production PostgreSQL URL
  - [ ] `BETTER_AUTH_SECRET` is strong 256-bit random key
  - [ ] `JWT_ALGORITHM=HS256`
  - [ ] `JWT_EXPIRATION_DAYS=7`
  - [ ] `ALLOWED_ORIGINS` includes only trusted domains
  - [ ] `ENVIRONMENT=production`
  - [ ] No `.env` file committed to git (verify with `git status`)

- [ ] **Frontend .env.local configured**
  - [ ] `NEXT_PUBLIC_API_URL` set to production backend URL
  - [ ] `NEXT_PUBLIC_BETTER_AUTH_SECRET` matches backend secret
  - [ ] `NEXT_PUBLIC_ENVIRONMENT=production`
  - [ ] No `.env.local` committed to git

- [ ] **Secrets rotated from development**
  - [ ] Generate new `BETTER_AUTH_SECRET` for production
  - [ ] Use different database credentials than development
  - [ ] Document secret rotation procedure

### 3. Database Setup

- [ ] **Production database created**
  - [ ] Neon project created (or PostgreSQL server provisioned)
  - [ ] Database user created with strong password
  - [ ] Connection string tested and working
  - [ ] SSL/TLS enabled for database connections

- [ ] **Database schema initialized**
  ```bash
  # Tables will be created automatically on first startup
  # Or manually:
  cd backend && python -c "from db import init_db; import asyncio; asyncio.run(init_db())"
  ```

- [ ] **Database indexes verified**
  - [ ] `idx_tasks_user_id`
  - [ ] `idx_tasks_completed`
  - [ ] `idx_tasks_user_completed`
  - [ ] `idx_tasks_user_created_desc`

- [ ] **Backup strategy configured**
  - [ ] Automated daily backups enabled (Neon dashboard)
  - [ ] Backup retention policy set (7-30 days)
  - [ ] Backup restoration tested successfully
  - [ ] Point-in-time recovery configured (if available)

### 4. Security Hardening

- [ ] **HTTPS enforced**
  - [ ] SSL/TLS certificates installed
  - [ ] HTTP redirects to HTTPS
  - [ ] HSTS headers configured
  - [ ] Certificate auto-renewal configured (Let's Encrypt)

- [ ] **CORS configured**
  - [ ] `ALLOWED_ORIGINS` includes only production domain(s)
  - [ ] Wildcard origins (*) NOT allowed
  - [ ] Credentials allowed only for trusted origins

- [ ] **Authentication security**
  - [ ] Passwords hashed with bcrypt (cost factor 12+)
  - [ ] JWT tokens signed with strong secret (256-bit)
  - [ ] HTTP-only cookies for token storage (frontend)
  - [ ] SameSite=Strict or Lax for CSRF protection

- [ ] **Input validation**
  - [ ] All API endpoints validate request bodies with Pydantic
  - [ ] SQL injection prevented (SQLModel ORM used)
  - [ ] XSS prevention (React auto-escaping, CSP headers)
  - [ ] File upload validation (if implemented)

- [ ] **Error handling**
  - [ ] Stack traces NOT exposed in production responses
  - [ ] Generic error messages for users
  - [ ] Detailed errors logged server-side only
  - [ ] 404 responses for unauthorized resource access

- [ ] **Rate limiting** (to be implemented)
  - [ ] API rate limits configured
  - [ ] Brute force protection on auth endpoints
  - [ ] IP-based rate limiting

### 5. Performance Optimization

- [ ] **Frontend optimizations**
  - [ ] Production build created (`npm run build`)
  - [ ] Bundle size analyzed (<200KB gzipped recommended)
  - [ ] Code splitting implemented for large components
  - [ ] Images optimized (use Next.js Image component)
  - [ ] Lazy loading for non-critical components
  - [ ] CSS purged and minified

- [ ] **Backend optimizations**
  - [ ] Database connection pooling configured
    - [ ] `pool_size=20` (adjust based on load)
    - [ ] `max_overflow=40`
  - [ ] SQL query logging disabled (`echo=False`)
  - [ ] Indexes created for frequently queried fields
  - [ ] N+1 query problems resolved

- [ ] **Lighthouse audit passed**
  - [ ] Performance score ≥85
  - [ ] Accessibility score ≥90
  - [ ] Best Practices score ≥90
  - [ ] SEO score ≥90
  - [ ] Core Web Vitals green (LCP <2.5s, FID <100ms, CLS <0.1)

### 6. Monitoring & Logging

- [ ] **Error tracking configured**
  - [ ] Sentry (or equivalent) integrated
  - [ ] Error alerts sent to team
  - [ ] Source maps uploaded for frontend errors

- [ ] **Logging configured**
  - [ ] Structured logging implemented (JSON format)
  - [ ] Log levels set appropriately (INFO in production)
  - [ ] Sensitive data NOT logged (passwords, tokens, PII)
  - [ ] Logs centralized (CloudWatch, Datadog, etc.)

- [ ] **Performance monitoring**
  - [ ] APM tool integrated (New Relic, Datadog, etc.)
  - [ ] Database query performance monitored
  - [ ] API response times tracked
  - [ ] Slow query alerts configured (>2s)

- [ ] **Uptime monitoring**
  - [ ] Health check endpoint created (`/health`)
  - [ ] Uptime monitor configured (Pingdom, UptimeRobot, etc.)
  - [ ] Alerts sent on downtime (email, Slack, PagerDuty)
  - [ ] Status page configured (optional)

---

## Deployment Process

### Backend Deployment

#### Option A: Vercel

- [ ] **Vercel project created**
  ```bash
  vercel login
  vercel
  ```

- [ ] **Environment variables configured in Vercel dashboard**
  - [ ] `DATABASE_URL`
  - [ ] `BETTER_AUTH_SECRET`
  - [ ] `JWT_ALGORITHM`
  - [ ] `JWT_EXPIRATION_DAYS`
  - [ ] `ALLOWED_ORIGINS`
  - [ ] `ENVIRONMENT=production`

- [ ] **Deployment successful**
  ```bash
  vercel --prod
  ```

- [ ] **Health check verified**
  ```bash
  curl https://api.yourdomain.com/health
  # Expected: {"status":"healthy","database":"connected","timestamp":"..."}
  ```

#### Option B: Railway

- [ ] **Railway project created**
  ```bash
  railway login
  railway init
  ```

- [ ] **Environment variables set**
  ```bash
  railway variables set DATABASE_URL=postgresql://...
  railway variables set BETTER_AUTH_SECRET=...
  # ... (set all required variables)
  ```

- [ ] **Deployment successful**
  ```bash
  railway up
  ```

- [ ] **Health check verified**

#### Option C: Docker

- [ ] **Dockerfile created and tested**
  ```bash
  cd backend
  docker build -t todo-api:latest .
  docker run -d -p 8000:8000 --env-file .env todo-api:latest
  ```

- [ ] **Docker Compose configured** (optional)
  ```bash
  docker-compose up -d
  ```

- [ ] **Health check verified**

### Frontend Deployment

#### Option A: Vercel

- [ ] **Vercel project created**
  ```bash
  cd frontend
  vercel login
  vercel
  ```

- [ ] **Environment variables configured in Vercel dashboard**
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `NEXT_PUBLIC_BETTER_AUTH_SECRET`
  - [ ] `NEXT_PUBLIC_ENVIRONMENT=production`

- [ ] **Deployment successful**
  ```bash
  vercel --prod
  ```

- [ ] **Site accessible**
  - [ ] Visit https://yourdomain.com
  - [ ] Verify homepage loads
  - [ ] Check for console errors (F12)

#### Option B: Netlify

- [ ] **Netlify project created**
  ```bash
  npm install -g netlify-cli
  netlify login
  netlify deploy
  ```

- [ ] **Environment variables configured in Netlify dashboard**

- [ ] **Deployment successful**
  ```bash
  netlify deploy --prod
  ```

- [ ] **Site accessible**

### DNS & Domain Configuration

- [ ] **DNS records configured**
  - [ ] A record for `yourdomain.com` → Frontend IP
  - [ ] A record for `api.yourdomain.com` → Backend IP
  - [ ] CNAME records if using Vercel/Netlify

- [ ] **SSL certificates installed**
  - [ ] Frontend domain (yourdomain.com)
  - [ ] Backend domain (api.yourdomain.com)
  - [ ] Auto-renewal configured

- [ ] **DNS propagation verified**
  ```bash
  nslookup yourdomain.com
  nslookup api.yourdomain.com
  ```

---

## Post-Deployment Verification

### Functional Testing

- [ ] **Signup flow**
  - [ ] Navigate to signup page
  - [ ] Create new account with valid data
  - [ ] Verify redirect to dashboard
  - [ ] Verify JWT token stored in cookie

- [ ] **Signin flow**
  - [ ] Logout from previous test
  - [ ] Signin with created account
  - [ ] Verify redirect to dashboard
  - [ ] Verify session persists across page refresh

- [ ] **Task creation**
  - [ ] Create task with title only
  - [ ] Create task with title and description
  - [ ] Verify tasks appear in list
  - [ ] Verify newest tasks appear first

- [ ] **Task editing**
  - [ ] Click edit button
  - [ ] Modify title
  - [ ] Modify description
  - [ ] Save changes
  - [ ] Verify changes persisted

- [ ] **Task completion**
  - [ ] Toggle task to completed
  - [ ] Verify strikethrough applied
  - [ ] Toggle back to pending
  - [ ] Verify strikethrough removed

- [ ] **Task deletion**
  - [ ] Click delete button
  - [ ] Confirm deletion
  - [ ] Verify task removed from list
  - [ ] Verify task no longer accessible via API

- [ ] **User isolation**
  - [ ] Create second user account
  - [ ] Create tasks in both accounts
  - [ ] Verify User A cannot see User B's tasks
  - [ ] Verify User A cannot edit/delete User B's tasks

### Error Handling

- [ ] **Invalid signup data**
  - [ ] Weak password → 400 error with message
  - [ ] Invalid email → 400 error
  - [ ] Existing email → 409 error
  - [ ] Missing fields → 400 error

- [ ] **Invalid signin data**
  - [ ] Wrong password → 401 error
  - [ ] Non-existent email → 401 error
  - [ ] Missing fields → 400 error

- [ ] **Unauthorized access**
  - [ ] Access protected route without login → 401 redirect
  - [ ] Invalid JWT token → 401 error
  - [ ] Expired JWT token → 401 error

- [ ] **Invalid task data**
  - [ ] Empty title → 400 error
  - [ ] Title too long (>200 chars) → 400 error
  - [ ] Description too long (>1000 chars) → 400 error

### Performance Testing

- [ ] **Page load times**
  - [ ] Homepage <2s (First Contentful Paint)
  - [ ] Dashboard <2s
  - [ ] Auth pages <2s

- [ ] **API response times**
  - [ ] GET /api/tasks <500ms
  - [ ] POST /api/tasks <1s
  - [ ] PUT /api/tasks/{id} <1s
  - [ ] DELETE /api/tasks/{id} <500ms

- [ ] **Load testing** (optional for MVP)
  ```bash
  # Install Apache Bench
  ab -n 1000 -c 10 https://api.yourdomain.com/health
  # Verify 99% requests succeed
  ```

### Security Testing

- [ ] **HTTPS enforcement**
  - [ ] HTTP requests redirect to HTTPS
  - [ ] Mixed content warnings resolved
  - [ ] HSTS header present

- [ ] **CORS testing**
  - [ ] Requests from untrusted origins blocked
  - [ ] Requests from trusted origins allowed

- [ ] **SQL injection testing**
  ```bash
  # Attempt SQL injection in task title
  curl -X POST https://api.yourdomain.com/api/tasks \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"title":"Test'; DROP TABLE tasks;--","description":"Test"}'
  # Verify: Task created with literal string, no SQL execution
  ```

- [ ] **XSS testing**
  ```bash
  # Attempt XSS in task title
  curl -X POST https://api.yourdomain.com/api/tasks \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"title":"<script>alert(\"XSS\")</script>","description":"Test"}'
  # Verify: Script NOT executed in browser, rendered as text
  ```

- [ ] **JWT validation**
  - [ ] Invalid signature → 401 error
  - [ ] Expired token → 401 error
  - [ ] Missing token → 401 error

---

## Monitoring & Alerts Configuration

- [ ] **Health check monitoring**
  - [ ] Uptime monitor pings /health every 5 minutes
  - [ ] Alert on downtime (email, Slack, PagerDuty)
  - [ ] Alert on database connection failure

- [ ] **Error rate alerts**
  - [ ] Alert if error rate >1% over 5 minutes
  - [ ] Alert on specific errors (database, auth, etc.)

- [ ] **Performance alerts**
  - [ ] Alert if API response time >2s (p95)
  - [ ] Alert if database query time >1s
  - [ ] Alert on high memory/CPU usage (>80%)

- [ ] **Security alerts**
  - [ ] Alert on repeated failed login attempts (>10 in 1 minute)
  - [ ] Alert on suspicious API activity

---

## Backup & Disaster Recovery

- [ ] **Database backups**
  - [ ] Automated daily backups enabled
  - [ ] Backup retention: 30 days
  - [ ] Backups stored in separate region/account
  - [ ] Backup restoration tested successfully

- [ ] **Application backups**
  - [ ] Source code in Git (remote repository)
  - [ ] Environment variables documented (not in git)
  - [ ] Deployment scripts documented

- [ ] **Rollback procedure documented**
  ```bash
  # Backend rollback (Vercel)
  vercel rollback

  # Frontend rollback (Vercel)
  vercel rollback

  # Database rollback
  pg_restore -U user -d database -c backup_YYYYMMDD.dump
  ```

- [ ] **Disaster recovery plan**
  - [ ] Recovery Time Objective (RTO): <1 hour
  - [ ] Recovery Point Objective (RPO): <24 hours
  - [ ] Team contact information documented
  - [ ] Incident response procedure documented

---

## Documentation

- [ ] **User documentation complete**
  - [ ] USER_GUIDE.md created
  - [ ] Getting started section
  - [ ] Feature documentation
  - [ ] FAQ section
  - [ ] Troubleshooting guide

- [ ] **Developer documentation complete**
  - [ ] DEVELOPER_GUIDE.md created
  - [ ] Local setup instructions
  - [ ] Project structure documented
  - [ ] Code patterns documented
  - [ ] Testing guide

- [ ] **Deployment documentation complete**
  - [ ] DEPLOYMENT_GUIDE.md created
  - [ ] Environment variables documented
  - [ ] Deployment steps for each platform
  - [ ] Troubleshooting section

- [ ] **Architecture documentation complete**
  - [ ] ARCHITECTURE.md created
  - [ ] ADRs (Architectural Decision Records)
  - [ ] Design trade-offs documented
  - [ ] Security architecture documented

- [ ] **API documentation complete**
  - [ ] OpenAPI spec (openapi.json)
  - [ ] All 8 endpoints documented
  - [ ] Request/response examples
  - [ ] Error responses documented

---

## Final Checklist

- [ ] **All tests passing** (backend + frontend)
- [ ] **Production deployment successful** (backend + frontend)
- [ ] **Health checks passing** (API, database, frontend)
- [ ] **Monitoring configured** (uptime, errors, performance)
- [ ] **Backups tested** (database + application)
- [ ] **Security verified** (HTTPS, CORS, auth, validation)
- [ ] **Documentation complete** (user, developer, deployment, architecture, API)
- [ ] **Team notified** (deployment completed, monitoring links shared)
- [ ] **Post-deployment review scheduled** (1 week post-launch)

---

## Sign-Off

**Deployed By**: ___________________________
**Date**: _____________
**Deployment URL**: ___________________________
**API URL**: ___________________________

**Reviewed By**: ___________________________
**Date**: _____________

---

## Post-Deployment Tasks (Week 1)

- [ ] Monitor error rates daily
- [ ] Review performance metrics
- [ ] Check for security incidents
- [ ] Collect user feedback
- [ ] Document any issues encountered
- [ ] Schedule retrospective meeting

---

**Congratulations on deploying to production!**

Remember to monitor the application closely for the first week and address any issues promptly.

For support, contact: devops@todoapp.com
