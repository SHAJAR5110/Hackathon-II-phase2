# Contributing to Todo Full-Stack Application

## Overview

Thank you for contributing to this project! This document provides guidelines for development, testing, and submitting contributions.

## Development Principles

This project follows **Spec-Driven Development (SDD)** principles:

1. **Specifications First**: All features must have a specification in `/specs` before implementation
2. **Type Safety**: TypeScript (frontend) and Python type hints (backend) are mandatory
3. **User Isolation**: Security is paramount; all database queries must filter by user_id
4. **Testing**: All features must have tests (unit and integration)
5. **Documentation**: Code must be documented with inline comments explaining key logic

## Getting Started

### 1. Fork and Clone

```bash
git clone <your-fork-url>
cd fullstack-app
```

### 2. Setup Development Environment

Follow the instructions in `README.md` to setup frontend and backend.

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### Frontend Development (Next.js)

1. **Read Guidelines**: Review `/frontend/CLAUDE.md` for patterns and best practices
2. **Create Components**: Place in `/frontend/components`
3. **API Calls**: Use centralized client in `/frontend/lib/api.ts`
4. **Styling**: Use Tailwind CSS utilities only (no custom CSS)
5. **Type Safety**: Enable TypeScript strict mode; no implicit `any` types
6. **Testing**: Write component tests in `__tests__/`

**Example Component**:

```tsx
'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

interface TaskFormProps {
  onSuccess: () => void;
}

export default function TaskForm({ onSuccess }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/api/tasks', { title });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-danger">{error}</p>}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded"
      />
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
        Create Task
      </button>
    </form>
  );
}
```

### Backend Development (FastAPI)

1. **Read Guidelines**: Review `/backend/CLAUDE.md` for patterns and best practices
2. **Create Routes**: Place in `/backend/routes/`
3. **Models**: Define Pydantic schemas and SQLModel ORM models
4. **User Isolation**: ALWAYS filter queries by `user_id` from JWT
5. **Type Hints**: All functions must have complete type annotations
6. **Testing**: Write pytest tests in `/backend/tests/`

**Example Endpoint**:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from db import get_session
from middleware.auth import get_current_user_id
from models import Task, TaskCreate, TaskResponse

router = APIRouter(prefix="/api", tags=["Tasks"])

@router.post("/tasks", status_code=201, response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    session: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new task for the authenticated user.

    Args:
        task_data: Task creation data (title, description)
        session: Database session
        user_id: Authenticated user ID from JWT

    Returns:
        Created task with all fields
    """
    new_task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description
    )
    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)
    return new_task
```

## Code Standards

### General

- **Formatting**: Use Prettier (frontend) and Black (backend)
- **Linting**: Fix all ESLint (frontend) and Flake8 (backend) warnings
- **Comments**: Explain *why*, not *what* (code should be self-documenting)
- **Naming**: Use descriptive names (avoid abbreviations like `tmp`, `val`, `res`)

### TypeScript (Frontend)

- Enable strict mode in `tsconfig.json`
- Use interfaces for props and data types
- Avoid `any` type (use `unknown` if truly unknown)
- Use functional components with hooks
- Prefer Server Components over Client Components

### Python (Backend)

- Use type hints for all function signatures
- Use Pydantic models for validation
- Use async/await for I/O operations
- Follow PEP 8 style guide
- Use docstrings for all public functions

## Testing

### Frontend Tests

```bash
cd frontend
npm run test
```

**Example Component Test**:

```tsx
import { render, screen } from '@testing-library/react';
import TaskItem from '@/components/TaskItem';

test('renders task title', () => {
  const task = { id: 1, title: 'Buy groceries', completed: false };
  render(<TaskItem task={task} />);
  expect(screen.getByText('Buy groceries')).toBeInTheDocument();
});
```

### Backend Tests

```bash
cd backend
pytest
```

**Example API Test**:

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_task():
    response = client.post(
        "/api/tasks",
        json={"title": "Test task"},
        headers={"Authorization": "Bearer valid_token"}
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test task"
```

## Security Guidelines

### Critical Security Rules

1. **Never commit secrets**: Use `.env` files (git-ignored)
2. **User Isolation**: All database queries MUST filter by `user_id`
3. **Permission Checks**: Verify ownership before updates/deletes
4. **Input Validation**: Validate all user inputs with Pydantic/Zod
5. **JWT Validation**: All protected endpoints must require valid JWT
6. **Error Messages**: Don't expose internal details to users

### Security Checklist

Before submitting a PR, verify:

- [ ] No hardcoded secrets or API keys
- [ ] All database queries filter by `user_id`
- [ ] Permission checks before update/delete operations
- [ ] Input validation on all user-provided data
- [ ] JWT middleware applied to all protected routes
- [ ] Error messages don't reveal sensitive information
- [ ] CORS configured to allow only trusted origins

## Submitting Changes

### 1. Run Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test
```

### 2. Run Linting

```bash
# Backend
cd backend
black .
flake8 .

# Frontend
cd frontend
npm run lint
```

### 3. Commit Changes

Use descriptive commit messages following [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add task completion toggle"
git commit -m "fix: resolve user isolation bug in task query"
git commit -m "docs: update API documentation"
```

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:

- **Title**: Brief description of changes
- **Description**: Detailed explanation of what changed and why
- **Testing**: How you tested the changes
- **Screenshots**: If UI changes, include before/after screenshots

## Pull Request Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: Maintainer reviews code for quality and security
3. **Approval**: PR approved if all checks pass
4. **Merge**: Changes merged to main branch

## Questions or Issues?

- Check `/specs` for feature specifications
- Review `CLAUDE.md` files for development guidelines
- Open an issue for bugs or feature requests

## Code of Conduct

- Be respectful and constructive in all interactions
- Follow the project's coding standards
- Help others learn and improve

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
