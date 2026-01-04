# Backend - Todo Full-Stack Web Application

## Overview

FastAPI backend with SQLModel ORM, JWT authentication, and PostgreSQL (Neon) database.

## Tech Stack

- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: JWT validation (tokens issued by Better Auth)
- **Testing**: pytest with FastAPI TestClient

## Getting Started

### Prerequisites

- Python 3.11+
- pip
- PostgreSQL database (Neon recommended)

### Installation

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```
DATABASE_URL=postgresql://user:password@host/database
BETTER_AUTH_SECRET=your-secret-key-here
```

**IMPORTANT**: Use the same `BETTER_AUTH_SECRET` as the frontend.

### Development

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API documentation available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Testing

```bash
pytest                          # Run all tests
pytest tests/test_tasks.py      # Run specific test file
pytest -v                       # Verbose output
pytest --cov                    # With coverage report
```

## Project Structure

```
backend/
├── main.py                    # FastAPI app entry point
├── models.py                  # SQLModel ORM models
├── db.py                      # Database connection
├── middleware/
│   └── auth.py               # JWT validation middleware
├── routes/
│   └── tasks.py              # Task CRUD endpoints
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (local)
└── tests/
    ├── test_tasks.py         # Task endpoint tests
    └── test_auth.py          # Auth middleware tests
```

## API Endpoints

### Tasks

- `GET /api/tasks` - List all tasks for authenticated user
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/complete` - Toggle completion status

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

See `/specs/api/rest-endpoints.md` for complete API documentation.

## Database Schema

### Tables

- **users**: Managed by Better Auth (id, email, password_hash, name, created_at, updated_at)
- **tasks**: User tasks (id, user_id, title, description, completed, created_at, updated_at)

### Indexes

- `idx_tasks_user_id`: Fast filtering by user
- `idx_tasks_completed`: Fast filtering by status
- `idx_tasks_user_completed`: Composite index for user + status
- `idx_tasks_user_created_desc`: Sorted list of user's tasks

See `/specs/database/schema.md` for complete schema documentation.

## Security

- **JWT Validation**: All endpoints validate JWT tokens before processing
- **User Isolation**: All queries filtered by authenticated user's ID
- **Input Validation**: Pydantic models validate all request data
- **Error Handling**: Proper HTTP status codes (400, 401, 403, 404, 500)

## Development Guidelines

See `CLAUDE.md` for detailed development patterns and best practices.

## Key Patterns

- Async FastAPI for all I/O operations
- Middleware-based JWT validation
- SQLModel for type-safe ORM
- User isolation enforced at route handler level
- Pydantic for request/response validation

## Deployment

This application is designed for deployment on platforms supporting Python and PostgreSQL:
- Railway
- Render
- Fly.io
- Docker containers

## Learn More

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
