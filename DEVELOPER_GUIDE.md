# Developer Guide - Todo Task Manager

Complete guide for developers working on the Todo Task Manager full-stack application.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Local Development Setup](#local-development-setup)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [Testing](#testing)
8. [Code Patterns & Conventions](#code-patterns--conventions)
9. [Adding New Features](#adding-new-features)
10. [Performance Optimization](#performance-optimization)

---

## Project Overview

### Tech Stack

**Backend:**
- **Framework**: FastAPI 0.109.0 (async ASGI)
- **ORM**: SQLModel 0.0.14 (SQLAlchemy + Pydantic)
- **Database**: Neon Serverless PostgreSQL (or any PostgreSQL 14+)
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt via passlib
- **Testing**: pytest + pytest-asyncio + httpx

**Frontend:**
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+
- **State Management**: React hooks + Context API
- **HTTP Client**: Native fetch API
- **Testing**: Jest + React Testing Library (to be added)

**Infrastructure:**
- **Backend Hosting**: Vercel / Railway / Render
- **Frontend Hosting**: Vercel / Netlify
- **Database**: Neon Serverless PostgreSQL
- **CI/CD**: GitHub Actions (to be added)

### Key Features

1. **User Authentication**: Signup, signin, logout with JWT
2. **Task CRUD**: Create, read, update, delete tasks
3. **Task Completion**: Toggle task completion status
4. **User Isolation**: Strict user-level data segregation
5. **Responsive Design**: Mobile, tablet, and desktop support

---

## Architecture

### System Architecture

```
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  Next.js        │◄────────┤  User Browser   │
│  Frontend       │         │                 │
│  (Port 3000)    │         └─────────────────┘
│                 │
└────────┬────────┘
         │ HTTPS
         │ REST API
         ▼
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  FastAPI        │◄────────┤  PostgreSQL     │
│  Backend        │         │  (Neon)         │
│  (Port 8000)    │         │                 │
│                 │         └─────────────────┘
└─────────────────┘
```

### Data Flow

```
User Action (Create Task)
    │
    ▼
Frontend (TaskForm.tsx)
    │ - Validate input
    │ - Call api.createTask()
    ▼
API Client (lib/api.ts)
    │ - Attach JWT token
    │ - Send POST /api/tasks
    ▼
Backend (routes/tasks.py)
    │ - Validate JWT
    │ - Extract user_id
    │ - Validate request body
    ▼
Database (Task table)
    │ - Insert new task
    │ - Return task object
    ▼
Frontend (Update UI)
    │ - Add task to list
    │ - Show success message
```

### Security Architecture

```
┌─────────────────────────────────────────┐
│ Frontend (Client-Side)                  │
│ - Store JWT in HTTP-only cookie         │
│ - Never store passwords                 │
│ - Validate input before submission      │
└─────────────────┬───────────────────────┘
                  │
                  ▼ HTTPS + Authorization: Bearer <JWT>
┌─────────────────────────────────────────┐
│ Backend (Server-Side)                   │
│ - Validate JWT signature                │
│ - Extract user_id from JWT              │
│ - Enforce user isolation in queries     │
│ - Hash passwords with bcrypt            │
│ - Return safe error messages            │
└─────────────────┬───────────────────────┘
                  │
                  ▼ Parameterized Queries
┌─────────────────────────────────────────┐
│ Database (PostgreSQL)                   │
│ - Foreign key constraints               │
│ - Indexes for performance               │
│ - Automated backups                     │
└─────────────────────────────────────────┘
```

---

## Project Structure

```
fullstack-app/
├── backend/                    # FastAPI backend
│   ├── main.py                # FastAPI app initialization, CORS, routes
│   ├── db.py                  # Database configuration and session management
│   ├── models.py              # SQLModel ORM models and Pydantic schemas
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py            # JWT validation middleware
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py            # Authentication endpoints
│   │   └── tasks.py           # Task CRUD endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   └── auth_service.py    # Authentication business logic
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_auth.py       # Authentication endpoint tests
│   │   └── test_tasks.py      # Task endpoint tests
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables (not in git)
│   ├── .env.example           # Example environment variables
│   ├── pytest.ini             # pytest configuration
│   ├── openapi.json           # OpenAPI specification
│   ├── CLAUDE.md              # Backend development guidelines
│   └── README.md              # Backend setup instructions
│
├── frontend/                  # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx         # Root layout component
│   │   ├── page.tsx           # Dashboard page (task list)
│   │   └── auth/
│   │       ├── signup/
│   │       │   └── page.tsx   # Signup page
│   │       └── signin/
│   │           └── page.tsx   # Signin page
│   ├── components/
│   │   ├── Header.tsx         # App header with logout
│   │   ├── TaskForm.tsx       # Task creation form
│   │   ├── TaskList.tsx       # Task list display
│   │   ├── TaskItem.tsx       # Individual task component
│   │   ├── SignupForm.tsx     # Signup form
│   │   └── SigninForm.tsx     # Signin form
│   ├── lib/
│   │   ├── api.ts             # API client with fetch wrapper
│   │   └── auth.ts            # Authentication utilities
│   ├── styles/
│   │   └── globals.css        # Global styles and Tailwind imports
│   ├── middleware.ts          # Next.js middleware for auth checks
│   ├── package.json           # Node.js dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── next.config.js         # Next.js configuration
│   ├── .env.local             # Environment variables (not in git)
│   ├── .env.local.example     # Example environment variables
│   ├── CLAUDE.md              # Frontend development guidelines
│   └── README.md              # Frontend setup instructions
│
├── specs/                     # Design specifications
│   ├── main/
│   │   ├── plan.md            # Architecture plan
│   │   ├── tasks.md           # Task breakdown (115 tasks)
│   │   └── spec.md            # Feature specifications
│   ├── features/
│   │   ├── task-crud.md       # Task CRUD specifications
│   │   └── authentication.md  # Authentication specifications
│   ├── api/
│   │   └── rest-endpoints.md  # API endpoint specifications
│   ├── database/
│   │   └── schema.md          # Database schema design
│   └── ui/
│       └── design.md          # UI/UX design specifications
│
├── DEPLOYMENT_GUIDE.md        # Deployment instructions
├── USER_GUIDE.md              # End-user documentation
├── DEVELOPER_GUIDE.md         # Developer documentation (this file)
├── ARCHITECTURE.md            # Architecture decision records
├── CLAUDE.md                  # Project overview and guidelines
└── README.md                  # Project README

```

---

## Local Development Setup

### Prerequisites

- **Python 3.11+** (backend)
- **Node.js 18+** (frontend)
- **PostgreSQL 14+** or Neon account
- **Git** for version control

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/fullstack-app.git
cd fullstack-app
```

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your configuration:
# DATABASE_URL=postgresql://user:password@host/database
# BETTER_AUTH_SECRET=your-256-bit-secret-key

# Run database migrations (tables created automatically on startup)
# Or manually:
python -c "from db import init_db; import asyncio; asyncio.run(init_db())"

# Start development server
uvicorn main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`

API docs (Swagger UI): `http://localhost:8000/docs`

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local and add your configuration:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_BETTER_AUTH_SECRET=your-256-bit-secret-key (must match backend)

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### Step 4: Verify Setup

1. **Test backend health**: `curl http://localhost:8000/health`
2. **Open frontend**: Navigate to `http://localhost:3000`
3. **Test signup**: Create a new account
4. **Test task creation**: Create a test task
5. **Verify persistence**: Refresh page and verify task is still there

---

## Backend Development

### Running the Backend

```bash
cd backend

# Development mode (auto-reload on file changes)
uvicorn main:app --reload --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Project Structure (Backend)

- **`main.py`**: FastAPI app initialization, CORS setup, route registration
- **`db.py`**: Database connection, session management, health checks
- **`models.py`**: SQLModel ORM models (User, Task) and Pydantic schemas (TaskCreate, TaskUpdate, etc.)
- **`middleware/auth.py`**: JWT validation, user extraction
- **`routes/auth.py`**: Signup, signin, logout endpoints
- **`routes/tasks.py`**: Task CRUD endpoints (create, list, get, update, delete, toggle complete)
- **`services/auth_service.py`**: Authentication business logic (password hashing, JWT generation)

### Adding a New Endpoint

Example: Add a `GET /api/tasks/stats` endpoint to return task statistics.

**Step 1**: Create the endpoint in `routes/tasks.py`:

```python
@router.get("/tasks/stats")
async def get_task_stats(
    session: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id)
):
    """Get task statistics for the authenticated user."""
    # Count total tasks
    total_statement = select(func.count(Task.id)).where(Task.user_id == user_id)
    total_result = await session.execute(total_statement)
    total = total_result.scalar()

    # Count completed tasks
    completed_statement = select(func.count(Task.id)).where(
        Task.user_id == user_id,
        Task.completed == True
    )
    completed_result = await session.execute(completed_statement)
    completed = completed_result.scalar()

    return {
        "total": total,
        "completed": completed,
        "pending": total - completed
    }
```

**Step 2**: Test the endpoint:

```bash
curl -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  http://localhost:8000/api/tasks/stats
```

**Step 3**: Add a test in `tests/test_tasks.py`:

```python
def test_get_task_stats(client, auth_headers):
    """Test task statistics endpoint."""
    # Create 3 tasks, complete 1
    for i in range(3):
        client.post("/api/tasks", json={"title": f"Task {i}"}, headers=auth_headers)

    # Complete first task
    client.patch("/api/tasks/1/complete", headers=auth_headers)

    # Get stats
    response = client.get("/api/tasks/stats", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert data["completed"] == 1
    assert data["pending"] == 2
```

**Step 4**: Update OpenAPI docs in `openapi.json`.

### Database Migrations

For schema changes, use Alembic:

```bash
# Install Alembic
pip install alembic

# Initialize Alembic
alembic init migrations

# Generate migration
alembic revision --autogenerate -m "Add priority field to tasks"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

---

## Frontend Development

### Running the Frontend

```bash
cd frontend

# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Project Structure (Frontend)

- **`app/`**: Next.js App Router pages and layouts
- **`components/`**: Reusable React components
- **`lib/api.ts`**: API client for backend communication
- **`lib/auth.ts`**: Authentication utilities
- **`middleware.ts`**: Next.js middleware for route protection
- **`styles/globals.css`**: Global styles and Tailwind imports

### Adding a New Component

Example: Add a `TaskStats` component to display task statistics.

**Step 1**: Create `components/TaskStats.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface TaskStats {
  total: number
  completed: number
  pending: number
}

export default function TaskStats() {
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await api.getTaskStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading stats...</div>
  if (!stats) return null

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-100 p-4 rounded-lg">
        <div className="text-2xl font-bold">{stats.total}</div>
        <div className="text-gray-600">Total Tasks</div>
      </div>
      <div className="bg-green-100 p-4 rounded-lg">
        <div className="text-2xl font-bold">{stats.completed}</div>
        <div className="text-gray-600">Completed</div>
      </div>
      <div className="bg-yellow-100 p-4 rounded-lg">
        <div className="text-2xl font-bold">{stats.pending}</div>
        <div className="text-gray-600">Pending</div>
      </div>
    </div>
  )
}
```

**Step 2**: Add API method in `lib/api.ts`:

```typescript
async getTaskStats(): Promise<TaskStats> {
  const response = await this.fetchWithAuth('/api/tasks/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch task stats')
  }
  return response.json()
}
```

**Step 3**: Use the component in `app/page.tsx`:

```typescript
import TaskStats from '@/components/TaskStats'

export default function DashboardPage() {
  return (
    <div>
      <TaskStats />
      <TaskForm />
      <TaskList />
    </div>
  )
}
```

---

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_tasks.py -v

# Run with coverage
pytest tests/ --cov --cov-report=term-missing

# Run specific test
pytest tests/test_tasks.py::test_create_task_success -v
```

**Test Structure**:
- Unit tests for individual functions
- Integration tests for complete workflows
- User isolation tests to verify security

**Coverage Target**: >80% on critical paths

### Frontend Testing (To Be Added)

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test TaskForm.test.tsx
```

---

## Code Patterns & Conventions

### Backend Patterns

**1. Async/Await for All I/O**:
```python
# ✅ Good
async def get_tasks(session: AsyncSession):
    result = await session.execute(select(Task))
    return result.scalars().all()

# ❌ Bad (blocking)
def get_tasks(session: Session):
    return session.query(Task).all()
```

**2. User Isolation on Every Query**:
```python
# ✅ Good
statement = select(Task).where(Task.user_id == user_id)

# ❌ Bad (security vulnerability!)
statement = select(Task)  # Returns ALL users' tasks
```

**3. Pydantic Models for Validation**:
```python
# ✅ Good
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)

# ❌ Bad (no validation)
def create_task(title, description):
    ...
```

### Frontend Patterns

**1. Server Components by Default**:
```typescript
// ✅ Good (Server Component)
export default async function TaskList() {
  const tasks = await api.getTasks()
  return <div>{tasks.map(...)}</div>
}

// Use Client Component only when needed
'use client'  // ← Add this directive
export default function TaskForm() {
  const [title, setTitle] = useState('')
  ...
}
```

**2. Error Handling**:
```typescript
// ✅ Good
try {
  const task = await api.createTask({ title, description })
  setTasks([...tasks, task])
  showSuccess('Task created!')
} catch (error) {
  showError(error instanceof Error ? error.message : 'Failed to create task')
}

// ❌ Bad (no error handling)
const task = await api.createTask({ title, description })
setTasks([...tasks, task])
```

**3. Type Safety**:
```typescript
// ✅ Good
interface Task {
  id: number
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

const tasks: Task[] = await api.getTasks()

// ❌ Bad (any type)
const tasks: any = await api.getTasks()
```

### Naming Conventions

- **Files**: `snake_case.py` (backend), `PascalCase.tsx` (frontend components)
- **Functions**: `snake_case` (backend), `camelCase` (frontend)
- **Classes**: `PascalCase` (both)
- **Constants**: `UPPER_SNAKE_CASE` (both)
- **Components**: `PascalCase` (frontend)

---

## Adding New Features

### Feature Development Workflow

1. **Planning**: Document feature in `/specs/features/`
2. **Backend**: Create models, routes, tests
3. **Frontend**: Create components, integrate API
4. **Testing**: Write and run tests
5. **Documentation**: Update OpenAPI spec and user guide
6. **Review**: Code review and QA testing
7. **Deploy**: Merge to main and deploy

### Example: Adding Task Priority Feature

**Step 1: Update Database Model** (`backend/models.py`):
```python
class Task(SQLModel, table=True):
    ...
    priority: str = Field(default="medium", max_length=20)  # low, medium, high
```

**Step 2: Update Pydantic Schemas**:
```python
class TaskCreate(BaseModel):
    ...
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
```

**Step 3: Update Frontend Types** (`frontend/lib/api.ts`):
```typescript
interface Task {
  ...
  priority: 'low' | 'medium' | 'high'
}
```

**Step 4: Update UI** (`frontend/components/TaskForm.tsx`):
```typescript
<select value={priority} onChange={(e) => setPriority(e.target.value)}>
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
</select>
```

**Step 5: Write Tests** for both backend and frontend.

**Step 6: Update OpenAPI Spec** (`backend/openapi.json`).

---

## Performance Optimization

### Backend Optimization

1. **Database Indexes**: Add indexes for frequently queried fields
2. **Connection Pooling**: Configure pool size based on load
3. **Query Optimization**: Use `select()` instead of `query()`
4. **Caching**: Add Redis for frequently accessed data
5. **Async Everywhere**: Use `async def` for all I/O operations

### Frontend Optimization

1. **Code Splitting**: Use dynamic imports for large components
2. **Image Optimization**: Use Next.js `<Image>` component
3. **Memoization**: Use `React.memo()`, `useMemo()`, `useCallback()`
4. **Lazy Loading**: Load components only when needed
5. **Bundle Analysis**: Run `npm run build` and analyze bundle size

---

## Contributing

### Before Submitting a PR

- [ ] All tests pass (`pytest` + `npm test`)
- [ ] Code follows project conventions
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No console.log() or print() statements in production code
- [ ] No hardcoded secrets or credentials

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Checklist
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] No breaking changes (or documented if unavoidable)
```

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

For questions or support, contact: dev@todoapp.com
