# Deployment Guide - Todo Task Manager

Complete deployment guide for the Full-Stack Todo Task Manager application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Health Checks](#health-checks)
7. [Backup & Restore](#backup--restore)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Python 3.11+** (backend runtime)
- **Node.js 18+** and npm (frontend runtime)
- **PostgreSQL 14+** or **Neon Serverless PostgreSQL** (database)
- **Git** (version control)

### Recommended Infrastructure
- **Backend hosting**: Vercel, Railway, Render, or AWS EC2
- **Frontend hosting**: Vercel, Netlify, or AWS S3 + CloudFront
- **Database**: Neon Serverless PostgreSQL (recommended) or managed PostgreSQL (AWS RDS, DigitalOcean)

---

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `/backend` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database
# For Neon: postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/neondb

# Authentication Secrets
BETTER_AUTH_SECRET=your-256-bit-secret-key-here
# Generate with: openssl rand -hex 32

# JWT Configuration
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Environment
ENVIRONMENT=production
```

### Frontend Environment Variables

Create a `.env.local` file in the `/frontend` directory:

```env
# API URL
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Better Auth Secret (must match backend)
NEXT_PUBLIC_BETTER_AUTH_SECRET=your-256-bit-secret-key-here

# Environment
NEXT_PUBLIC_ENVIRONMENT=production
```

---

## Backend Deployment

### Step 1: Prepare Backend Code

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database migrations
# (Database tables will be created automatically on first startup)

# Verify environment variables
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('DATABASE_URL:', os.getenv('DATABASE_URL')[:30]); print('SECRET:', os.getenv('BETTER_AUTH_SECRET')[:10])"
```

### Step 2: Test Backend Locally

```bash
# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test health endpoint
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","database":"connected","timestamp":"..."}
```

### Step 3: Deploy Backend

#### Option A: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard:
# - DATABASE_URL
# - BETTER_AUTH_SECRET
# - JWT_ALGORITHM
# - JWT_EXPIRATION_DAYS
# - ALLOWED_ORIGINS
```

#### Option B: Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set BETTER_AUTH_SECRET=...
```

#### Option C: Docker Deployment

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build Docker image
docker build -t todo-api:latest .

# Run container
docker run -d -p 8000:8000 --env-file .env todo-api:latest

# Or use Docker Compose
docker-compose up -d
```

### Step 4: Verify Backend Deployment

```bash
# Test health endpoint
curl https://api.yourdomain.com/health

# Test authentication
curl -X POST https://api.yourdomain.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'

# Test task creation (use token from signup response)
curl -X POST https://api.yourdomain.com/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{"title":"Test Task","description":"Test description"}'
```

---

## Frontend Deployment

### Step 1: Prepare Frontend Code

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm run start
```

### Step 2: Deploy Frontend

#### Option A: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard:
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_BETTER_AUTH_SECRET
# - NEXT_PUBLIC_ENVIRONMENT
```

#### Option B: Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

### Step 3: Verify Frontend Deployment

```bash
# Visit your deployed frontend
open https://yourdomain.com

# Test signup flow
# 1. Navigate to /auth/signup
# 2. Create account
# 3. Verify redirect to dashboard
# 4. Create a test task
```

---

## Database Setup

### Option 1: Neon Serverless PostgreSQL (Recommended)

```bash
# 1. Sign up at https://neon.tech
# 2. Create new project
# 3. Copy connection string
# 4. Add to .env as DATABASE_URL

# Connection string format:
# postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Option 2: Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE todo_db;
CREATE USER todo_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;
\q

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://todo_user:secure_password@localhost:5432/todo_db
```

### Database Migrations

The application automatically creates database tables on startup. For production, consider using Alembic:

```bash
# Install Alembic
pip install alembic

# Initialize Alembic
alembic init migrations

# Generate migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

---

## Health Checks

### Backend Health Check

```bash
# Health check endpoint
GET /health

# Response format:
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-04T12:00:00Z"
}
```

### Monitoring

Set up monitoring with:

1. **Uptime monitoring**: Pingdom, UptimeRobot, or StatusPage
2. **Error tracking**: Sentry or Rollbar
3. **Performance monitoring**: New Relic or Datadog

```bash
# Configure Sentry (optional)
pip install sentry-sdk

# Add to main.py:
import sentry_sdk
sentry_sdk.init(dsn="YOUR_SENTRY_DSN")
```

---

## Backup & Restore

### Database Backup

#### Automated Daily Backups (Neon)

Neon provides automatic daily backups. Configure in dashboard:
- Backup retention: 7-30 days
- Point-in-time recovery: Up to 7 days

#### Manual Backup (PostgreSQL)

```bash
# Create backup
pg_dump -U todo_user -d todo_db -F c -f backup_$(date +%Y%m%d).dump

# Restore from backup
pg_restore -U todo_user -d todo_db -c backup_20260104.dump
```

#### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DATABASE_URL="postgresql://user:password@host/database"

# Create backup
pg_dump $DATABASE_URL -F c -f $BACKUP_DIR/backup_$DATE.dump

# Delete backups older than 30 days
find $BACKUP_DIR -name "backup_*.dump" -mtime +30 -delete

echo "Backup completed: backup_$DATE.dump"
```

```bash
# Schedule with cron (daily at 2 AM)
crontab -e
0 2 * * * /path/to/backup.sh
```

### Application State Backup

```bash
# Export all tasks for a user
curl -H "Authorization: Bearer <TOKEN>" \
  https://api.yourdomain.com/api/tasks > tasks_backup.json

# Restore tasks (requires manual re-creation or bulk import endpoint)
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Symptoms**: `500 Internal Server Error`, logs show `connection refused`

**Solutions**:
```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check firewall rules (allow port 5432)
sudo ufw allow 5432

# Verify PostgreSQL is running
sudo systemctl status postgresql
```

#### 2. CORS Errors

**Symptoms**: Browser console shows `CORS policy` errors

**Solutions**:
```bash
# Update ALLOWED_ORIGINS in backend .env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Verify CORS middleware in main.py
# Ensure frontend domain is included in allowed origins
```

#### 3. JWT Authentication Failures

**Symptoms**: `401 Unauthorized` on protected endpoints

**Solutions**:
```bash
# Verify BETTER_AUTH_SECRET matches between frontend and backend
# Frontend: NEXT_PUBLIC_BETTER_AUTH_SECRET
# Backend: BETTER_AUTH_SECRET

# Check token expiration (default: 7 days)
# Ensure JWT_EXPIRATION_DAYS is set in backend .env

# Verify Authorization header format:
# Authorization: Bearer <token>
```

#### 4. Database Migration Errors

**Symptoms**: Tables not created, schema mismatch

**Solutions**:
```bash
# Drop and recreate tables (DEV ONLY - data loss!)
# In Python shell:
from db import engine
from models import SQLModel
SQLModel.metadata.drop_all(engine)
SQLModel.metadata.create_all(engine)

# For production, use Alembic migrations
alembic downgrade -1
alembic upgrade head
```

#### 5. Frontend Build Failures

**Symptoms**: `npm run build` fails

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run build

# Check Node.js version (requires 18+)
node --version

# Verify environment variables are set
cat .env.local
```

### Performance Tuning

#### Backend Optimizations

```python
# Enable database connection pooling (db.py)
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,          # Increase pool size
    max_overflow=40,       # Max overflow connections
    pool_pre_ping=True,    # Verify connections before use
    echo=False             # Disable SQL logging in production
)
```

#### Frontend Optimizations

```bash
# Enable Next.js caching
# next.config.js
module.exports = {
  images: {
    domains: ['api.yourdomain.com'],
  },
  swcMinify: true,
  compress: true,
}

# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

---

## Security Checklist

Before deploying to production, verify:

- [ ] All secrets stored in environment variables (not in code)
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS configured to allow only trusted domains
- [ ] JWT secret is strong (256-bit random key)
- [ ] Database credentials are secure and rotated regularly
- [ ] SQL injection prevented (SQLModel ORM used throughout)
- [ ] XSS protection enabled (CSP headers configured)
- [ ] Rate limiting configured on API endpoints
- [ ] Database backups scheduled and tested
- [ ] Error messages don't expose sensitive information
- [ ] Authentication endpoints protected against brute force attacks

---

## Rollback Procedure

If deployment fails or critical bugs are discovered:

### Backend Rollback

```bash
# Vercel
vercel rollback

# Railway
railway rollback

# Docker
docker stop todo-api
docker run -d todo-api:previous-version
```

### Frontend Rollback

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback
```

### Database Rollback

```bash
# Restore from backup
pg_restore -U todo_user -d todo_db -c backup_20260103.dump

# Or use Neon point-in-time recovery
# (via Neon dashboard)
```

---

## Support & Monitoring

### Log Monitoring

```bash
# View backend logs
tail -f /var/log/todo-api.log

# Vercel logs
vercel logs <deployment-url>

# Railway logs
railway logs
```

### Performance Monitoring

- Set up New Relic or Datadog APM
- Monitor database query performance
- Track API response times
- Set up alerts for:
  - API response time > 2s
  - Error rate > 1%
  - Database connection errors
  - Disk space usage > 80%

---

## Post-Deployment Checklist

- [ ] Verify health check endpoint returns 200
- [ ] Test complete user signup flow
- [ ] Test complete task CRUD workflow
- [ ] Verify authentication persists across page refreshes
- [ ] Test user isolation (User A cannot access User B's tasks)
- [ ] Check error handling (400, 401, 403, 404, 500 responses)
- [ ] Verify database backups are running
- [ ] Set up monitoring and alerting
- [ ] Document any deployment-specific configurations
- [ ] Update DNS records (if applicable)
- [ ] Enable SSL/TLS certificates

---

## Additional Resources

- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

For technical support, contact: support@todoapp.com
