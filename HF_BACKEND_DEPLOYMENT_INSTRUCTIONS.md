# 🚀 Deploy Todo Backend to Hugging Face Docker Space

## 📍 Location

Your prepared backend is in: `C:\Users\HP\Desktop\HF-Todo-Backend`

All configuration files and documentation are ready to deploy.

## ⚡ Quick Start (5 Steps)

### Step 1: Set Up PostgreSQL Database

Choose one:

**Neon (Recommended - Free Tier)**
```
1. Go to https://neon.tech
2. Sign up
3. Create database
4. Copy connection string: postgresql://user:xxx@ep-xxx.neon.tech/todo_db?sslmode=require
```

**Render**
```
1. Go to https://render.com
2. Create PostgreSQL instance
3. Copy external database URL
```

### Step 2: Prepare Environment Variables

In `C:\Users\HP\Desktop\HF-Todo-Backend\` directory:

```bash
# Copy template
copy .env.example .env

# Edit .env with:
DATABASE_URL=postgresql://...              # From Neon/Render
BETTER_AUTH_SECRET=<generate-with-python>  # See below
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

**Generate BETTER_AUTH_SECRET** (run in Python):
```python
import secrets
print(secrets.token_urlsafe(32))
```

### Step 3: Create Hugging Face Space

```
1. Go to https://huggingface.co/spaces/create
2. Space name: todo-backend
3. SDK: Docker
4. Visibility: Private
5. Create Space
6. Copy your space URL (you'll need it next)
```

### Step 4: Deploy Code

In `C:\Users\HP\Desktop\HF-Todo-Backend\` directory:

```bash
# Initialize git
git init
git add .
git commit -m "Initial: Todo Backend"

# Add your HF space as remote
# Replace YOUR_USERNAME with your Hugging Face username
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/todo-backend

# Push code
git push hf main

# When prompted for password: use your Hugging Face API token
# Get token from: https://huggingface.co/settings/tokens
```

### Step 5: Configure Secrets

1. Go to your space: `https://huggingface.co/spaces/YOUR_USERNAME/todo-backend`
2. Click **Settings** (gear icon)
3. Click **Repository secrets** on left menu
4. Add these secrets:

   | Secret | Value |
   |--------|-------|
   | `DATABASE_URL` | `postgresql://...` (from Step 1) |
   | `BETTER_AUTH_SECRET` | Your 32+ char secret |
   | `ALLOWED_ORIGINS` | `https://your-vercel-app.vercel.app` |

5. Click Save for each

**Wait 2-5 minutes for deployment...**

## ✅ Verify Deployment

Once space shows running:

```bash
# Check health
curl https://YOUR_USERNAME-todo-backend.hf.space/health

# View docs
open https://YOUR_USERNAME-todo-backend.hf.space/docs
```

## 🔗 Update Frontend

Once backend is live, update frontend:

**File**: `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=https://YOUR_USERNAME-todo-backend.hf.space
```

Then redeploy frontend on Vercel.

## 📚 Documentation Files

In `HF-Todo-Backend/` you'll find:

- **SETUP_SUMMARY.md** - Complete overview
- **DEPLOYMENT_TO_HF.md** - Detailed step-by-step guide
- **QUICK_REFERENCE.md** - Command reference
- **README_HF.md** - Full API documentation
- **Dockerfile** - Docker configuration
- **requirements.txt** - Python dependencies
- **.env.example** - Environment variables template

## 🔧 Configuration Details

### Required Environment Variables

```env
DATABASE_URL=postgresql://...          # PostgreSQL connection
BETTER_AUTH_SECRET=...                 # JWT signing secret (32+ chars)
ALLOWED_ORIGINS=https://...            # Frontend URL for CORS
```

### Optional Variables

```env
APP_ENV=production         # Default: production
DEBUG=False               # Default: False
JWT_ALGORITHM=HS256       # Default: HS256
JWT_EXPIRATION_DAYS=7     # Default: 7
```

## 🌐 API Endpoints

After deployment, your API will be at:

```
https://YOUR_USERNAME-todo-backend.hf.space
├── GET  /               → API info
├── GET  /health         → Health check
├── GET  /docs           → Swagger UI
├── GET  /redoc          → ReDoc
├── POST /api/auth/signup
├── POST /api/auth/signin
├── POST /api/auth/logout
├── GET  /api/tasks
├── POST /api/tasks
├── GET  /api/tasks/{id}
├── PUT  /api/tasks/{id}
├── DELETE /api/tasks/{id}
└── ... (more endpoints in /docs)
```

## 🚨 Troubleshooting

### Build fails
- Check `requirements.txt` has all dependencies
- View logs in Hugging Face space → "Logs" tab

### Connection refused to database
- Verify `DATABASE_URL` is correct
- Check database is running
- Verify IP whitelist (usually unnecessary)

### 401 Unauthorized errors
- Verify `BETTER_AUTH_SECRET` matches frontend
- Check token format: `Bearer <token>`

### CORS errors from frontend
- Add frontend URL to `ALLOWED_ORIGINS` secret
- URL must match exactly (protocol + domain)
- Redeploy space after updating secrets

### Module not found
- Add missing package to `requirements.txt`
- Run: `git add . && git commit -m "..."`
- Push: `git push hf main`
- Space auto-rebuilds

## 📊 Files Structure

```
HF-Todo-Backend/
├── Dockerfile                  ✅ Docker config (HF optimized)
├── .dockerignore              ✅ Docker build optimization
├── .gitignore                 ✅ Protects .env
├── requirements.txt            ✅ Python dependencies
├── .env.example               ✅ Template
│
├── main.py                    ✅ FastAPI app
├── db.py                      ✅ Database config
├── models.py                  ✅ Database models
├── routes/                    ✅ API endpoints
│   ├── auth.py
│   ├── tasks.py
│   └── users.py
├── middleware/                ✅ Auth middleware
│   └── auth.py
├── services/                  ✅ Business logic
│   └── auth_service.py
│
├── SETUP_SUMMARY.md          📖 Overview
├── DEPLOYMENT_TO_HF.md       📖 Detailed guide
├── QUICK_REFERENCE.md        📖 Command ref
├── README_HF.md              📖 API docs
└── tests/                    🧪 Tests
```

## 🔐 Security Checklist

✅ Keep `.env` out of git (in `.gitignore`)
✅ Use strong secret (32+ characters)
✅ Configure `ALLOWED_ORIGINS` with frontend URL only
✅ Never hardcode secrets in code
✅ Update secrets in Hugging Face, not in git
✅ Monitor API logs for suspicious activity

## 📞 Support

- **Detailed Guide**: Open `HF-Todo-Backend/DEPLOYMENT_TO_HF.md`
- **API Docs**: Open `HF-Todo-Backend/README_HF.md`
- **Quick Commands**: Open `HF-Todo-Backend/QUICK_REFERENCE.md`
- **FastAPI Help**: https://fastapi.tiangolo.com/
- **HF Docs**: https://huggingface.co/docs/hub/spaces

## 🎉 You're Ready!

Everything is prepared and documented. Follow the 5 steps above and your backend will be live in minutes!

---

**Need more details?** → Read `HF-Todo-Backend/DEPLOYMENT_TO_HF.md`
