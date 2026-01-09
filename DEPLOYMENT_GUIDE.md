# Deployment Guide - Phase II Todo Application

## Overview

This guide covers deploying the Phase II Todo Full-Stack Application to production. The application consists of:
- **Frontend**: Next.js 15 (React 19, Tailwind CSS)
- **Backend**: FastAPI with SQLModel ORM
- **Database**: Neon Serverless PostgreSQL

## Prerequisites

- Node.js 20+ (for frontend build)
- Python 3.11+ (for backend)
- Git configured with credentials
- Domain name (for production)
- SSL/TLS certificate (for HTTPS)

---

## Part 1: Frontend Deployment

### Option A: Deploy to Vercel (Recommended)

Vercel is optimized for Next.js and handles deployments automatically.

#### 1. Connect Repository to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (login to Vercel first)
cd frontend
vercel
```

#### 2. Configure Environment Variables in Vercel

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add the following variables:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=Todo App
NEXT_PUBLIC_BETTER_AUTH_SECRET=<your-secret-key>
```

**Important**: Replace `https://api.yourdomain.com` with your actual backend API URL.

#### 3. Verify Deployment

```bash
# Check deployment status
vercel list

# View logs
vercel logs
```

### Option B: Deploy to Other Platforms (AWS, Azure, Google Cloud)

#### Build the Frontend

```bash
# Build production bundle
npm run build

# Output goes to .next/ directory
# The .next/ directory contains optimized code for production
```

#### Deploy Built Assets

1. **Copy the `.next/` directory** to your hosting provider
2. **Set environment variables** at runtime
3. **Install dependencies** on the server:
   ```bash
   npm ci --production
   ```
4. **Start the app**:
   ```bash
   npm run start
   ```

#### Example Deployment Script

```bash
#!/bin/bash
# deploy.sh

# Build the application
npm run build

# Start in production mode
npm run start

# The app will be available at http://localhost:3000
# Use a reverse proxy (nginx) to serve it
```

### Key Environment Variables for Production

Update your deployment platform's environment variables:

```env
# Production API URL (must be your backend domain)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Environment indicator
NEXT_PUBLIC_APP_ENV=production

# App name
NEXT_PUBLIC_APP_NAME=Todo App

# Authentication secret (must match backend)
NEXT_PUBLIC_BETTER_AUTH_SECRET=<your-secure-secret-key>
```

### Frontend Security Checklist

- ✅ API URL uses HTTPS (not HTTP)
- ✅ Environment variables are set in deployment platform (not in code)
- ✅ Secrets are not visible in source code
- ✅ CORS is properly configured on backend
- ✅ Build completes without errors
- ✅ No console errors in production

---

## Part 2: Backend Deployment

### Option A: Deploy to Render or Railway (Simplest)

#### 1. Prepare Repository

Ensure your backend has:
- `requirements.txt` or `pyproject.toml`
- `main.py` as entry point
- `.env` file template (don't commit actual secrets)

#### 2. Deploy to Render.com

```bash
# Create account at https://render.com
# Connect your GitHub repository
# Create new Web Service
# Configure:
# - Build Command: pip install -r requirements.txt
# - Start Command: uvicorn main:app --host 0.0.0.0 --port 8000
```

#### 3. Set Environment Variables

In Render Dashboard → Environment → Add:

```
DATABASE_URL=postgresql://user:password@host/database
BETTER_AUTH_SECRET=<your-secret-key>
ALLOWED_ORIGINS=https://yourdomain.com
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
```

### Option B: Deploy to AWS (More Control)

#### 1. Create RDS PostgreSQL Database

```bash
# Use Neon Serverless PostgreSQL (recommended)
# 1. Go to https://neon.tech
# 2. Create project
# 3. Copy DATABASE_URL
```

#### 2. Deploy with Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p python-3.11 todo-api

# Create environment
eb create todo-api-prod

# Deploy
eb deploy
```

#### 3. Configure Environment Variables

```bash
# Via EB Console or:
eb setenv \
  DATABASE_URL=postgresql://... \
  BETTER_AUTH_SECRET=<secret> \
  ALLOWED_ORIGINS=https://yourdomain.com
```

### Option C: Deploy with Docker

#### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. Build and Push

```bash
# Build image
docker build -t todo-api .

# Tag for registry (e.g., Docker Hub)
docker tag todo-api yourusername/todo-api:latest

# Push to registry
docker push yourusername/todo-api:latest
```

#### 3. Deploy to Container Service

Deploy using Docker Compose, Kubernetes, or cloud services (AWS ECS, Google Cloud Run, Azure Container Instances).

### Backend Environment Variables

Create `.env` file (don't commit to git):

```env
# Database
DATABASE_URL=postgresql://user:password@neon.tech/todo_db

# Authentication
BETTER_AUTH_SECRET=your-secure-secret-key-min-32-chars

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# JWT Settings
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# Application
DEBUG=False
LOG_LEVEL=info
```

### Backend Security Checklist

- ✅ Database URL is secure (HTTPS/TLS)
- ✅ BETTER_AUTH_SECRET is strong (min 32 characters)
- ✅ ALLOWED_ORIGINS matches frontend domain(s)
- ✅ CORS properly configured
- ✅ JWT tokens expire properly (7 days)
- ✅ Database backups enabled
- ✅ Error logging configured
- ✅ No hardcoded secrets in code

---

## Part 3: Database Setup

### Using Neon Serverless PostgreSQL (Recommended)

#### 1. Create Neon Project

1. Go to https://neon.tech
2. Sign up and create account
3. Create new project "todo-app"
4. Select PostgreSQL 15
5. Copy connection string

#### 2. Initialize Database

```bash
# The database schema is created automatically on first startup
# Backend will create tables via Alembic migrations or SQLModel

# Manual initialization (if needed):
python -m alembic upgrade head
```

#### 3. Backup Strategy

- Neon provides automatic daily backups
- Configure backup retention in Neon dashboard
- For critical data, enable point-in-time recovery (PITR)

### Using Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
# macOS
brew install postgresql

# Linux
sudo apt-get install postgresql postgresql-contrib

# Start service
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux

# Create database
createdb todo_app

# Connect
psql -U postgres -d todo_app
```

---

## Part 4: DNS & SSL Configuration

### Configure Domain Name

1. **Purchase domain** from registrar (Namecheap, Route53, etc.)
2. **Point to CDN/Hosting**:
   - Vercel: Add DNS records from Vercel dashboard
   - Custom: Point A record to server IP
3. **Enable HTTPS**:
   - Auto via Vercel/Railway (free)
   - Use Let's Encrypt for self-hosted
   - Use AWS Certificate Manager for AWS

### SSL Certificate Setup

#### Option A: Let's Encrypt (Free, for self-hosted)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

#### Option B: AWS Certificate Manager

```bash
# Request certificate in AWS Console
# Verify domain ownership
# Attach to CloudFront/ALB
```

---

## Part 5: Monitoring & Maintenance

### Setup Monitoring

#### Frontend Monitoring

1. **Vercel Analytics**: Automatic in Vercel
2. **Error Tracking**: Add Sentry
   ```bash
   npm install @sentry/nextjs
   ```
3. **Performance**: Monitor Core Web Vitals

#### Backend Monitoring

1. **Application Logs**: Monitor via platform dashboard
2. **Error Tracking**: Add Sentry for Python
   ```bash
   pip install sentry-sdk
   ```
3. **Database**: Monitor connections, slow queries
4. **Health Checks**: Setup uptime monitoring

### Health Check Endpoint

The backend includes a health check endpoint:

```bash
curl https://api.yourdomain.com/health

# Expected response:
{
  "status": "healthy",
  "message": "Todo API is running"
}
```

Setup uptime monitoring (Pingdom, UptimeRobot, etc.) to monitor this endpoint.

### Database Maintenance

```python
# Monitor connections
SELECT count(*) FROM pg_stat_activity;

# Check slow queries
SELECT query, mean_exec_time FROM pg_stat_statements
ORDER BY mean_exec_time DESC;

# Vacuum and analyze
VACUUM ANALYZE;
```

---

## Part 6: Troubleshooting

### Frontend 404 Errors in Production

**Problem**: API calls return 404 in production

**Solution**: Verify environment variables
```bash
# Check that NEXT_PUBLIC_API_URL is set correctly
# Should point to your backend domain, e.g., https://api.yourdomain.com
# NOT localhost:8000
```

### CORS Errors

**Problem**: `CORS policy: response to preflight request doesn't pass access control check`

**Solution**: Update backend ALLOWED_ORIGINS
```env
# backend/.env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Authentication Not Working

**Problem**: Login/signup returns 401 or invalid token

**Solution**: Ensure secrets match
```bash
# Frontend
NEXT_PUBLIC_BETTER_AUTH_SECRET=your-key

# Backend
BETTER_AUTH_SECRET=your-key  # MUST be identical
```

### Database Connection Errors

**Problem**: `psycopg2.OperationalError: could not connect to server`

**Solution**: Verify DATABASE_URL
```bash
# Test connection
psql $DATABASE_URL

# Check for typos, user/password, host, database name
```

---

## Part 7: Post-Deployment Checklist

### Frontend Checklist

- [ ] App loads without errors
- [ ] API calls work (check Network tab)
- [ ] Authentication flow works (signup/signin)
- [ ] Protected routes redirect unauthenticated users
- [ ] Performance metrics acceptable (Lighthouse score >90)
- [ ] No console errors
- [ ] Environment variables configured
- [ ] HTTPS enforced
- [ ] Favicon loads correctly

### Backend Checklist

- [ ] API responds to requests
- [ ] Health check endpoint returns 200
- [ ] Authentication endpoints work
- [ ] Database connections stable
- [ ] CORS headers correct
- [ ] Error logging working
- [ ] Backups enabled
- [ ] Uptime monitoring active
- [ ] Security headers configured

### Security Checklist

- [ ] Database credentials not in code
- [ ] API secrets secure
- [ ] HTTPS/TLS enforced
- [ ] CORS properly restricted
- [ ] SQL injection prevention (using ORM)
- [ ] XSS prevention (React sanitization)
- [ ] CSRF protection enabled
- [ ] Rate limiting enabled
- [ ] Error messages don't leak info
- [ ] Dependencies updated

---

## Production URLs Example

After deployment, your URLs should be:

```
Frontend:    https://yourdomain.com
Backend API: https://api.yourdomain.com
Health:      https://api.yourdomain.com/health
Docs:        https://api.yourdomain.com/docs
```

---

## Support & Next Steps

### Documentation
- [Frontend Guidelines](./frontend/CLAUDE.md)
- [Backend Guidelines](./backend/CLAUDE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)

### Resources
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Neon Docs](https://neon.tech/docs/)

### Contact
For issues or questions:
1. Check the relevant guide above
2. Review error logs in deployment dashboard
3. Consult documentation links

---

**Generated**: January 9, 2026
**Version**: Phase II - Production Ready
