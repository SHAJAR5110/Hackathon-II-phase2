# Backend Development Guidelines - Todo Application

## Overview

This directory contains the FastAPI backend for the Phase II Todo Full-Stack Web Application. Follow these guidelines for all backend development work.

## Technology Stack

- **Framework**: FastAPI (async ASGI)
- **Language**: Python 3.11+ (with type hints)
- **ORM**: SQLModel (SQLAlchemy + Pydantic integration)
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: JWT validation (tokens issued by Better Auth)
- **Testing**: pytest with FastAPI TestClient
- **Validation**: Pydantic models

## Core Principles

### 1. Async/Await for All I/O Operations

**Use async functions for database queries and API endpoints**:

```python
# ✅ Good: Async endpoint with async database operations
from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter()

@router.get("/api/tasks")
async def get_tasks(
    session: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id)
):
    statement = select(Task).where(Task.user_id == user_id)
    result = await session.execute(statement)
    tasks = result.scalars().all()
    return {"tasks": tasks}

# ❌ Bad: Sync operations (blocking)
@router.get("/api/tasks")
def get_tasks(user_id: str):  # Don't use sync functions
    tasks = session.query(Task).filter(Task.user_id == user_id).all()
    return {"tasks": tasks}
```

### 2. Type Hints Everywhere

**All functions must have type annotations**:

```python
# ✅ Good: Complete type hints
from typing import Optional, List
from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None

async def create_task(
    task_data: TaskCreate,
    user_id: str,
    session: AsyncSession
) -> Task:
    new_task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description
    )
    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)
    return new_task

# ❌ Bad: Missing type hints
async def create_task(task_data, user_id, session):  # Don't do this
    new_task = Task(...)
    return new_task
```

### 3. User Isolation on Every Query

**CRITICAL: All database queries must filter by authenticated user_id**:

```python
# ✅ Good: User isolation enforced
@router.get("/api/tasks")
async def get_tasks(
    session: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id)  # Extracted from JWT
):
    # Only fetch tasks belonging to the authenticated user
    statement = select(Task).where(Task.user_id == user_id)
    result = await session.execute(statement)
    tasks = result.scalars().all()
    return {"tasks": tasks}

# ❌ Bad: No user filtering (SECURITY VULNERABILITY)
@router.get("/api/tasks")
async def get_tasks(session: AsyncSession = Depends(get_session)):
    statement = select(Task)  # Returns ALL users' tasks!
    result = await session.execute(statement)
    tasks = result.scalars().all()
    return {"tasks": tasks}
```

**Permission checks for updates/deletes**:

```python
# ✅ Good: Verify ownership before updating
@router.put("/api/tasks/{task_id}")
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    session: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id)
):
    # Fetch task and verify ownership
    task = await session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to update this task"
        )

    # Update task
    task.title = task_data.title or task.title
    task.description = task_data.description or task.description
    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task
```

### 4. Pydantic Models for Request/Response Validation

**Define schemas for all request and response bodies**:

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

# Request models (input validation)
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)

    @validator('title')
    def title_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

# Response models (output serialization)
class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enable ORM mode for SQLModel
```

### 5. JWT Middleware for Authentication

**Extract user_id from JWT token in middleware**:

```python
# middleware/auth.py
from fastapi import Request, HTTPException, status
from jose import jwt, JWTError
import os

def get_current_user_id(request: Request) -> str:
    """
    Extract and validate JWT token from Authorization header.
    Returns user_id if valid, raises 401 if invalid/missing.
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    token = auth_header.replace("Bearer ", "")

    try:
        secret = os.getenv("BETTER_AUTH_SECRET")
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        user_id = payload.get("sub")  # Extract user ID from 'sub' claim

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        return user_id

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
```

**Use dependency injection in routes**:

```python
from fastapi import Depends
from middleware.auth import get_current_user_id

@router.get("/api/tasks")
async def get_tasks(
    user_id: str = Depends(get_current_user_id)  # Auto-validates JWT
):
    # user_id is guaranteed to be valid here
    pass
```

### 6. Error Handling with Proper Status Codes

**Use HTTPException with descriptive messages**:

```python
from fastapi import HTTPException, status

# 400 Bad Request - Invalid input
if not title:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Title is required"
    )

# 401 Unauthorized - Missing/invalid token
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid or expired token"
)

# 403 Forbidden - Permission denied
if task.user_id != user_id:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to update this task"
    )

# 404 Not Found - Resource doesn't exist
if not task:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Task not found"
    )

# 500 Internal Server Error - Unexpected errors
# Let the global exception handler catch these
```

### 7. Database Models with SQLModel

**Define models with proper types and indexes**:

```python
from sqlmodel import Field, SQLModel, Column, Index
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, nullable=False)  # Foreign key to users.id
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Composite indexes for efficient queries
    __table_args__ = (
        Index('idx_tasks_user_completed', 'user_id', 'completed'),
        Index('idx_tasks_user_created_desc', 'user_id', 'created_at'),
    )
```

### 8. Database Session Management

**Use dependency injection for async sessions**:

```python
# db.py
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

async def get_session() -> AsyncSession:
    """
    Dependency that provides an async database session.
    Automatically commits and closes the session.
    """
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
```

**Use in routes**:

```python
@router.get("/api/tasks")
async def get_tasks(
    session: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id)
):
    # Session is auto-managed (commit/rollback/close)
    pass
```

### 9. Route Organization

**Group related endpoints in routers**:

```python
# routes/tasks.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter(prefix="/api", tags=["Tasks"])

@router.get("/tasks")
async def list_tasks(...):
    pass

@router.post("/tasks", status_code=201)
async def create_task(...):
    pass

@router.get("/tasks/{task_id}")
async def get_task(...):
    pass

@router.put("/tasks/{task_id}")
async def update_task(...):
    pass

@router.delete("/tasks/{task_id}", status_code=204)
async def delete_task(...):
    pass

@router.patch("/tasks/{task_id}/complete")
async def toggle_complete(...):
    pass
```

**Register router in main.py**:

```python
from routes.tasks import router as tasks_router

app.include_router(tasks_router)
```

### 10. Testing with pytest

**Write tests for all endpoints**:

```python
# tests/test_tasks.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_task_success():
    """Test creating a task with valid data"""
    response = client.post(
        "/api/tasks",
        json={"title": "Test task", "description": "Test description"},
        headers={"Authorization": "Bearer valid_token"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test task"
    assert data["completed"] is False

def test_create_task_missing_title():
    """Test creating a task without title returns 400"""
    response = client.post(
        "/api/tasks",
        json={"description": "No title"},
        headers={"Authorization": "Bearer valid_token"}
    )
    assert response.status_code == 400
    assert "title" in response.json()["detail"].lower()

def test_get_tasks_unauthorized():
    """Test accessing tasks without token returns 401"""
    response = client.get("/api/tasks")
    assert response.status_code == 401
```

## Common Patterns

### CRUD Operation Pattern

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter(prefix="/api", tags=["Tasks"])

# CREATE
@router.post("/tasks", status_code=status.HTTP_201_CREATED, response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    session: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id)
):
    new_task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description
    )
    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)
    return new_task

# READ (List)
@router.get("/tasks", response_model=dict)
async def list_tasks(
    session: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id)
):
    statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    result = await session.execute(statement)
    tasks = result.scalars().all()
    return {"tasks": tasks}

# READ (Single)
@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    session: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id)
):
    task = await session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# UPDATE
@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    session: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id)
):
    task = await session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Permission denied")

    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task

# DELETE
@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    session: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id)
):
    task = await session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Permission denied")

    await session.delete(task)
    await session.commit()
    return None  # 204 No Content has no response body
```

## Security Checklist

- [ ] All endpoints require JWT authentication (except health checks)
- [ ] User isolation enforced on all database queries
- [ ] Permission checks before update/delete operations
- [ ] Input validation with Pydantic models
- [ ] SQL injection prevented (use SQLModel ORM, no raw SQL)
- [ ] Secrets stored in environment variables (never in code)
- [ ] CORS configured to allow only trusted origins
- [ ] Error messages don't expose internal details
- [ ] JWT secret identical to frontend (`BETTER_AUTH_SECRET`)

## File Naming Conventions

- **Modules**: snake_case (e.g., `tasks.py`, `auth.py`)
- **Classes**: PascalCase (e.g., `Task`, `TaskCreate`, `TaskResponse`)
- **Functions**: snake_case (e.g., `get_tasks`, `create_task`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DATABASE_URL`, `JWT_ALGORITHM`)

## Environment Variables

Required in `.env`:

```env
DATABASE_URL=postgresql://user:password@host/database
BETTER_AUTH_SECRET=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
```

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)
- [pytest Documentation](https://docs.pytest.org/)
