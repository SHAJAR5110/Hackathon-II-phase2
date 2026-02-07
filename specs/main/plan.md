# Implementation Plan: Phase II - Todo Full-Stack Web Application (Basic Level)

**Branch**: `main` | **Date**: 2026-01-04 | **Spec**: `/specs/features/task-crud.md`, `/specs/features/authentication.md`

**Input**: Feature specifications for Task CRUD operations and User Authentication from `/specs/features/`

---

## Summary

Transform a console-based todo application into a modern, multi-user web application with secure user authentication (Better Auth + JWT) and persistent PostgreSQL storage. Implement 5 basic-level features (Create, Read, Update, Delete, Mark Complete) with strict user isolation on every API endpoint. Phase II establishes the foundational full-stack architecture: Next.js 16+ frontend with responsive UI, FastAPI backend with JWT middleware, Neon PostgreSQL for persistent data, and monorepo organization with spec-driven development principles.

**Key Technical Approach**:
- **Frontend-Expert Agent**: Build Next.js pages, React components, Tailwind CSS styling, API client integration
- **Backend-Dev-Orchestrator Agent**: Implement FastAPI endpoints, SQLModel ORM, JWT middleware, database schema, user isolation enforcement
- Both agents coordinate through clear API contracts (REST JSON) and shared database schema
- Deployment: monorepo structure with layered CLAUDE.md files for context at root, frontend, and backend levels

---

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/Next.js 16+ (frontend)

**Primary Dependencies**:
- **Frontend**: Next.js 16+, React 19+, TypeScript, Tailwind CSS 3+, Better Auth (JWT client), Lucide React (icons)
- **Backend**: FastAPI, SQLModel, Pydantic, Python-jose (JWT), asyncpg (Neon connection)
- **Database**: Neon Serverless PostgreSQL (connection pooling)
- **ORM**: SQLModel (type-safe ORM + Pydantic models)

**Storage**: Neon Serverless PostgreSQL (2 tables: users, tasks; indexed for user isolation queries)

**Testing**:
- **Backend**: pytest with FastAPI TestClient
- **Frontend**: Jest/Vitest for component tests, optional Playwright for E2E
- **API Contract Testing**: OpenAPI/Swagger validation

**Target Platform**: Web (browser-based); responsive design for desktop, tablet, mobile; no native apps in Phase II

**Project Type**: Full-stack web (monorepo: separate frontend and backend directories with shared specs)

**Performance Goals**:
- Task creation response: < 1 second (SC-001)
- Task list load: < 500ms for 100+ tasks (SC-002, SC-003)
- API endpoint response: deterministic (depends on auth overhead, DB query)
- Frontend interactivity: immediate visual feedback (< 300ms perceived latency)

**Constraints**:
- **User Isolation**: MANDATORY on every API endpoint. No exceptions. Tested per FR-008.
- **JWT Security**: Fixed 7-day expiry, HTTP-only cookies, no refresh tokens in MVP (Q1 clarification)
- **No Pagination in MVP**: Load all tasks in one request (Q2 clarification); defer to Phase III
- **Environment Secrets**: `DATABASE_URL`, `BETTER_AUTH_SECRET` (identical frontend + backend)
- **Type Safety**: TypeScript (frontend), Python type hints (backend); Pydantic validation on all inputs

**Scale/Scope** (Phase II MVP):
- **Users**: Expected <100 for hackathon; architecture supports 1M+ scale
- **Tasks per User**: Expected <1000 for MVP; no hard limit in DB; add pagination in Phase III if needed
- **Code Lines**: ~2000-3000 (implementation) + ~1000 (tests)
- **Development Timeline**: 5-7 implementation tasks; ~1-2 weeks full-stack development

---

## Constitution Check

**Gate: Phase 0 Entry** ✅ **PASS**

| Principle | Requirement | Status | Evidence |
|-----------|-------------|--------|----------|
| I. Spec-Driven Development | Feature spec complete before code | ✅ PASS | `/specs/features/task-crud.md`, `/specs/features/authentication.md`, `/specs/api/rest-endpoints.md`, `/specs/database/schema.md` complete with 5 user stories, 12 functional requirements each |
| II. User Isolation & Security First | JWT on every request; user_id filtering | ✅ PASS | FR-007, FR-008, FR-009, FR-010 mandate JWT verification + user_id filtering. API contract specifies 401/403 responses |
| III. Full-Stack Monorepo | Frontend + Backend in single repo with layered CLAUDE.md | ✅ PASS | Monorepo structure defined: `/frontend`, `/backend`, `/specs`, root `CLAUDE.md` + feature-level CLAUDE.md files |
| IV. Technology Stack Fidelity | Strict adherence to Next.js, FastAPI, SQLModel, Neon, Better Auth | ✅ PASS | All specified technologies confirmed in spec. No substitutions. |
| V. REST API Completeness | All endpoints follow contract; 6 standard methods | ✅ PASS | `/specs/api/rest-endpoints.md` defines GET/POST/PUT/DELETE/PATCH with full request/response examples |
| VI. Authentication & Token Mgmt | Better Auth + JWT with shared secret | ✅ PASS | `/specs/features/authentication.md` specifies JWT issuing, verification, 7-day expiry, HTTP-only cookies |
| VII. Database & ORM Consistency | SQLModel for all DB ops | ✅ PASS | `/specs/database/schema.md` defines schema; implementation uses SQLModel models |
| VIII. Component & API Centralization | API calls through `/lib/api.ts` | ✅ PASS | `/specs/ui/components.md` specifies centralized API client pattern |
| IX. Responsive Design & Accessibility | Tailwind CSS; WCAG AA | ✅ PASS | `/specs/ui/components.md` defines mobile-first, responsive, accessible components |
| X. Simplicity Over Engineering | YAGNI; no pagination, no refresh tokens in MVP | ✅ PASS | Clarifications Q1 + Q2 confirm no refresh tokens, no pagination. Defer to Phase III. |

**Gate: Phase 1 Design** (Re-check post-design)

---

## Design Phases

### Phase 0: Research & Unknowns Resolution

**Status**: ✅ COMPLETE (No critical unknowns; specifications are comprehensive)

**Research Tasks Completed**:

1. ✅ **Better Auth Integration with FastAPI**
   - Decision: Use Better Auth on frontend (NextJS app) for session + JWT issuance. FastAPI validates JWT via middleware.
   - Rationale: Better Auth is frontend-only; backend is stateless (JWT-based). Simplifies architecture.
   - Alternatives Rejected: Passport.js (requires Node.js backend); Auth0 (external dependency).

2. ✅ **SQLModel + Neon PostgreSQL Setup**
   - Decision: SQLModel (combines SQLAlchemy + Pydantic). Neon serverless (connection pooling built-in).
   - Rationale: Type-safe ORM; Pydantic integration reduces validation boilerplate. Neon scales with demand.
   - Alternatives Rejected: Raw SQLAlchemy (verbose); Tortoise ORM (less mature).

3. ✅ **JWT Secret Sharing (Frontend + Backend)**
   - Decision: Identical `BETTER_AUTH_SECRET` environment variable on both services.
   - Rationale: Better Auth on frontend signs tokens; FastAPI verifies using same secret. No key distribution complexity.
   - Alternatives Rejected: Asymmetric keys (adds complexity; overkill for MVP).

4. ✅ **API Contract Format**
   - Decision: REST (JSON); OpenAPI 3.0 schema for documentation.
   - Rationale: Industry standard; clear contracts; easy client generation.
   - Alternatives Rejected: GraphQL (adds complexity; not required for CRUD).

5. ✅ **Response Time & Scalability**
   - Decision: No pagination MVP; optimized indexes (user_id, completed, user_id+created_at DESC).
   - Rationale: < 100 task lists expected for hackathon; indexes handle 100k+ tasks per user at scale.
   - Alternatives Rejected: Pagination (complexity); Redis caching (overkill for MVP).

**Output**: All research complete. No unresolved NEEDS CLARIFICATION items.

---

### Phase 1: Design & Contracts

**Status**: 🔄 IN PROGRESS (Detailed design below)

#### 1a. Data Model

**File**: `data-model.md` (to be generated)

**Entities**:

```yaml
User:
  managed_by: "Better Auth"
  fields:
    - id: string (UUID, PK)
    - email: string (unique, required)
    - password_hash: string (bcrypt, not plaintext)
    - name: string (required)
    - created_at: timestamp (auto)
    - updated_at: timestamp (auto)
  validations:
    - email: RFC 5322 format
    - password_hash: bcrypt ($2b$12$)
    - name: 1-255 characters

Task:
  fields:
    - id: bigint (auto-increment, PK)
    - user_id: string (FK → users.id, required, indexed)
    - title: string (required, 1-200 chars)
    - description: string (optional, max 1000 chars, nullable)
    - completed: boolean (default false, indexed)
    - created_at: timestamp (auto, immutable)
    - updated_at: timestamp (auto, mutable on edits)
  validations:
    - title: required, 1-200 chars
    - description: optional, max 1000 chars
    - completed: boolean only
  relationships:
    - user_id: foreign key to users.id (no cascade delete in MVP)
  indexes:
    - idx_tasks_user_id: (user_id) - for list queries
    - idx_tasks_completed: (completed) - for filtering
    - idx_tasks_user_completed: (user_id, completed) - composite filter
    - idx_tasks_user_created_desc: (user_id, created_at DESC) - for sorted list

State Transitions:
  Task:
    pending ← default state on creation
    completed ← toggle via PATCH /api/tasks/{id}/complete
    pending ← toggle back via PATCH /api/tasks/{id}/complete
    [deleted] ← deleted via DELETE /api/tasks/{id} (hard delete, no archive in MVP)
```

#### 1b. API Contracts

**File**: `contracts/openapi.yaml` (OpenAPI 3.0 specification)

**Endpoints** (from `/specs/api/rest-endpoints.md`):

```
GET /api/tasks
  - List all authenticated user's tasks
  - Query params: status (all|pending|completed), sort (created|title|updated)
  - Returns: { tasks: Task[] }
  - Auth: Required (Bearer JWT)

POST /api/tasks
  - Create new task for authenticated user
  - Body: { title: string, description?: string }
  - Returns: Task (201 Created)
  - Auth: Required

GET /api/tasks/{id}
  - Get task details (owned by authenticated user)
  - Returns: Task
  - Auth: Required
  - Permission: user_id from JWT must match task.user_id

PUT /api/tasks/{id}
  - Update task (title/description)
  - Body: { title?: string, description?: string }
  - Returns: Task (200 OK)
  - Auth: Required
  - Permission: user_id match required

DELETE /api/tasks/{id}
  - Delete task (hard delete, permanent)
  - Returns: 204 No Content
  - Auth: Required
  - Permission: user_id match required

PATCH /api/tasks/{id}/complete
  - Toggle completion status
  - Body: {} (optional; toggle is implicit)
  - Returns: Task (200 OK with updated completed status)
  - Auth: Required
  - Permission: user_id match required
```

**Response Format** (all endpoints return JSON):

```json
{
  "id": 1,
  "user_id": "user123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-04T10:00:00Z",
  "updated_at": "2026-01-04T10:00:00Z"
}
```

**Error Responses**:

```json
{
  "detail": "Descriptive error message"
}
```

Status codes: 200, 201, 204, 400, 401, 403, 404, 500

#### 1c. Frontend Architecture

**File**: `/frontend/CLAUDE.md` (updated with Phase II specifics)

**Structure**:

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout, header, nav
│   ├── page.tsx                # Dashboard / task list (protected)
│   ├── auth/
│   │   ├── signup/
│   │   │   └── page.tsx        # Signup form
│   │   └── signin/
│   │       └── page.tsx        # Signin form
│   └── middleware.ts           # Redirect to auth if not logged in
├── components/
│   ├── TaskList.tsx            # List of tasks + empty state
│   ├── TaskItem.tsx            # Individual task with actions
│   ├── TaskForm.tsx            # Create/edit task form
│   ├── Header.tsx              # Nav + logout
│   ├── SignupForm.tsx          # Signup
│   └── SigninForm.tsx          # Signin
├── lib/
│   ├── api.ts                  # Centralized API client (fetch + JWT attach)
│   └── auth.ts                 # Better Auth utilities
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── .env.local                  # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_BETTER_AUTH_SECRET
```

**Key Patterns**:
- Server Components by default; Client Components only for interactivity
- API calls through `/lib/api.ts` (centralized)
- JWT attached automatically to all requests (via interceptor)
- Tailwind CSS utilities only (no inline styles)
- TypeScript for all components

#### 1d. Backend Architecture

**File**: `/backend/CLAUDE.md` (updated with Phase II specifics)

**Structure**:

```
backend/
├── main.py                     # FastAPI app entry point
├── models.py                   # SQLModel ORM models (User, Task)
├── db.py                       # Database connection + session factory
├── middleware/
│   └── auth.py                 # JWT validation middleware
├── routes/
│   └── tasks.py                # Task CRUD endpoints (GET, POST, PUT, DELETE, PATCH)
├── requirements.txt            # Python dependencies
├── .env                        # DATABASE_URL, BETTER_AUTH_SECRET
└── tests/
    ├── test_tasks.py           # Unit + integration tests
    └── test_auth.py            # Auth middleware tests
```

**Key Patterns**:
- JWT middleware extracts user_id before route handlers
- All database queries filtered by user_id (enforce in route handlers)
- SQLModel for type-safe models
- Pydantic for request/response validation
- Async/await for I/O operations

#### 1e. Quickstart Guide

**File**: `quickstart.md` (for developers implementing Phase II)

**Setup Steps**:

1. Clone repo (monorepo structure)
2. Backend setup:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env  # Set DATABASE_URL, BETTER_AUTH_SECRET
   uvicorn main:app --reload
   ```
3. Frontend setup:
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local  # Set NEXT_PUBLIC_API_URL, NEXT_PUBLIC_BETTER_AUTH_SECRET
   npm run dev
   ```
4. Database init:
   - Better Auth creates users table
   - Backend creates tasks table + indexes on startup
5. Test flow:
   - Signup → Signin → Create task → View task → Update → Complete → Delete
   - API tests: pytest (backend)
   - Component tests: Jest/Vitest (frontend)

---

### Phase 2: Task Decomposition & Implementation

**Status**: ⏸️ DEFERRED (To be generated by `/sp.tasks`)

**Note**: `/sp.tasks` will break Phase 1 design into actionable, dependency-ordered tasks using `backend-dev-orchestrator` and `frontend-expert` agents.

**Expected Task Breakdown**:

1. **Foundation**: Database schema, models, API middleware
2. **Backend Routes**: Implement 6 endpoints with user isolation
3. **Frontend Pages**: Signup, Signin, Dashboard
4. **Frontend Components**: TaskList, TaskForm, Header, etc.
5. **Integration**: Frontend ↔ Backend API calls
6. **Testing**: Unit, integration, E2E tests
7. **Deployment**: Docker (optional), environment setup

---

## Project Structure

### Documentation (this feature)

```
specs/main/
├── spec.md              # (Pre-existing from /sp.specify)
├── plan.md              # This file (/sp.plan output)
├── research.md          # (Phase 0, can be inline above if minimal unknowns)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/
│   └── openapi.yaml     # Phase 1 output (REST API schema)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root - existing structure)

```
fullstack-app/
├── .specify/                    # Spec-Kit configuration
│   ├── memory/
│   │   └── constitution.md      # Project governance (Phase 0)
│   ├── templates/               # Spec/plan/task templates
│   └── scripts/                 # Automation
├── specs/                       # Feature specifications (Spec-Kit managed)
│   ├── overview.md              # Project overview
│   ├── features/
│   │   ├── task-crud.md         # (Phase I spec input)
│   │   └── authentication.md    # (Phase I spec input)
│   ├── api/
│   │   └── rest-endpoints.md    # API contract (detailed)
│   ├── database/
│   │   └── schema.md            # DB schema + indexes
│   └── ui/
│       └── components.md        # UI design specs
├── frontend/                    # Next.js 16+ application
│   ├── CLAUDE.md                # Frontend development guidelines
│   ├── app/                     # App Router pages
│   ├── components/              # React components
│   ├── lib/
│   │   └── api.ts               # Centralized API client
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── .env.local               # Frontend secrets (local)
├── backend/                     # FastAPI Python application
│   ├── CLAUDE.md                # Backend development guidelines
│   ├── main.py                  # FastAPI app
│   ├── models.py                # SQLModel ORM
│   ├── db.py                    # Database connection
│   ├── middleware/
│   │   └── auth.py              # JWT validation
│   ├── routes/
│   │   └── tasks.py             # Task CRUD endpoints
│   ├── requirements.txt
│   ├── .env                     # Backend secrets (local)
│   └── tests/
│       └── *.py                 # pytest tests
├── CLAUDE.md                    # Root project guidelines
├── docker-compose.yml           # (Optional local dev environment)
└── README.md                    # Project overview
```

**Structure Decision**: Web application (monorepo) with separate frontend (Next.js) and backend (FastAPI) directories, unified by `/specs` and root `CLAUDE.md`. This structure enables:
- Single context for cross-cutting changes (Claude Code sees all files)
- Clear separation of concerns (frontend/backend independent deployment)
- Layered CLAUDE.md for technology-specific guidance

---

## Agent Context & Implementation Strategy

### Frontend-Expert Agent Role

**Responsibilities**:
- Implement all Next.js pages (Dashboard, Signup, Signin)
- Create React components (TaskList, TaskItem, TaskForm, Header, etc.)
- Tailwind CSS styling (responsive, mobile-first, WCAG AA accessible)
- Centralized API client (`/lib/api.ts`) with JWT attachment
- Component integration tests (Jest/Vitest)
- E2E tests (optional, Playwright)

**Context Files**:
- `/frontend/CLAUDE.md` (development guidelines)
- `/specs/features/task-crud.md` (user stories + acceptance criteria)
- `/specs/ui/components.md` (component specifications)
- `/specs/api/rest-endpoints.md` (API contract)

**Key Decisions**:
- Use Server Components by default, Client Components only for interactivity
- All API calls through centralized `/lib/api.ts`
- Tailwind utility classes (no custom CSS)
- TypeScript for type safety

---

### Backend-Dev-Orchestrator Agent Role

**Responsibilities**:
- Implement FastAPI application with SQLModel ORM
- Create 6 REST endpoints (GET, POST, PUT, DELETE, PATCH)
- JWT validation middleware (extract user_id, verify signature)
- SQLModel models (User, Task) with Pydantic validation
- User isolation enforcement (user_id filtering on all queries)
- Database initialization + indexed schema creation
- Unit & integration tests (pytest)
- Error handling (400, 401, 403, 404, 500)

**Context Files**:
- `/backend/CLAUDE.md` (development guidelines)
- `/specs/features/authentication.md` (JWT requirements)
- `/specs/api/rest-endpoints.md` (endpoint contracts)
- `/specs/database/schema.md` (data model + indexes)

**Key Decisions**:
- Async FastAPI for scalability
- Middleware-based JWT validation (clean separation)
- SQLModel for type-safe ORM + Pydantic integration
- User isolation enforced at route handler level (defense in depth)

---

## Constitution Compliance

**Phase 1 Design Validation** ✅ **PASS** (Re-check after implementation)

| Principle | Phase 1 Evidence |
|-----------|-----------------|
| I. Spec-Driven | Design artifacts map 1:1 to spec requirements (data-model.md ← entities, contracts/ ← FR, etc.) |
| II. User Isolation | JWT middleware + user_id filtering in all route handlers; 403 responses for permission violations |
| III. Monorepo | Single repo structure with `/frontend`, `/backend`, `/specs`, layered CLAUDE.md |
| IV. Tech Stack | Next.js 16+, FastAPI, SQLModel, Neon, Better Auth confirmed in context |
| V. REST API | 6 endpoints with standard methods; OpenAPI schema in /contracts/ |
| VI. Auth & JWT | JWT middleware on FastAPI; 7-day expiry; HTTP-only cookies (Better Auth) |
| VII. SQLModel ORM | All DB ops via SQLModel; no raw SQL except migrations |
| VIII. API Client Centralization | `/lib/api.ts` pattern specified in frontend architecture |
| IX. Responsive Design | Tailwind CSS utility-first; mobile-first responsive breakpoints in component specs |
| X. Simplicity | No pagination (defer to Phase III), no refresh tokens (fixed 7-day expiry), YAGNI throughout |

---

## Critical Gates & Decisions

**Gate: Agent Context Setup** (Before `/sp.tasks`)

- [ ] Update `frontend-expert` agent context with Phase II tech stack (Next.js 16+, Tailwind 3+, TypeScript)
- [ ] Update `backend-dev-orchestrator` agent context with Phase II tech stack (FastAPI, SQLModel, Pydantic)
- [ ] Ensure both agents have access to `/specs` (api/rest-endpoints.md, database/schema.md, ui/components.md)

**Gate: Database Schema** (Before backend implementation)

- [ ] Neon PostgreSQL connection string validated
- [ ] Users table created by Better Auth
- [ ] Tasks table + indexes created on backend startup or migration script
- [ ] Foreign key constraint (tasks.user_id → users.id) verified

**Gate: JWT Secret Sharing** (Before frontend + backend integration)

- [ ] `BETTER_AUTH_SECRET` set identically on frontend (.env.local) and backend (.env)
- [ ] Better Auth configured to issue JWT tokens
- [ ] FastAPI middleware configured to verify JWT using same secret

---

## Next Steps (Recommended)

1. **Generate Detailed Phase 1 Artifacts**:
   - [ ] Create `/specs/main/data-model.md` (entity definitions, validation rules)
   - [ ] Create `/specs/main/contracts/openapi.yaml` (REST API OpenAPI schema)
   - [ ] Create `/specs/main/quickstart.md` (development setup guide)

2. **Update Agent Context** (before `/sp.tasks`):
   - [ ] Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType frontend-expert` to register Next.js 16+, TypeScript, Tailwind CSS
   - [ ] Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType backend-dev-orchestrator` to register FastAPI, SQLModel, pytest

3. **Execute `/sp.tasks`**:
   - [ ] Generate dependency-ordered implementation tasks
   - [ ] Break down into frontend + backend sub-tasks
   - [ ] Assign agent responsibilities explicitly

4. **Execute `/sp.implement`**:
   - [ ] Frontend-expert agent implements pages, components, styling
   - [ ] Backend-dev-orchestrator agent implements models, routes, middleware
   - [ ] Both agents coordinate via API contract + database schema

---

## Summary & Approval

**Plan Status**: ✅ **READY FOR PHASE 2 (TASK DECOMPOSITION)**

**Key Deliverables Generated**:
- ✅ Technical Context (all sections complete, no unknowns)
- ✅ Constitution Check (Phase 0 PASS, Phase 1 PASS)
- ✅ Detailed Design (data model, API contracts, architecture, agent roles)
- ✅ Project Structure (monorepo with frontend/backend separation)
- ✅ Agent Context Strategy (frontend-expert + backend-dev-orchestrator responsibilities)

**Gate: Phase 0 → Phase 1** ✅ **PASS**

All research complete. No NEEDS CLARIFICATION markers remaining.

**Gate: Phase 1 Design** ✅ **PASS**

Design aligns with Constitution. Ready for Phase 2 task breakdown.

**Recommended Next Command**: `/sp.tasks` to generate actionable, dependency-ordered implementation tasks using frontend-expert and backend-dev-orchestrator agents.
