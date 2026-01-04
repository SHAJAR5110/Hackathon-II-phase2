# Project Overview: Phase II - Todo Full-Stack Web Application

**Project Name**: Hackathon II Todo Application
**Phase**: II - Full-Stack Web Application (Basic Level)
**Created**: 2026-01-04
**Status**: Specification Phase

## Purpose

Transform a console-based todo application into a modern, multi-user web application with persistent storage, user authentication, and a responsive interface. Phase II focuses on foundational CRUD operations with secure user isolation.

## Vision

A simple yet powerful todo application where users can:
- Sign up and log in securely
- Create, view, update, and delete tasks
- Track task completion status
- Access their tasks from any device

## Current Phase Status

### Phase II: Full-Stack Web Application (CURRENT)

**Objectives**:
- ✅ Transform console app into web application
- ✅ Implement all 5 Basic Level features
- ✅ User authentication (signup/signin)
- ✅ REST API endpoints with JWT security
- ✅ Responsive frontend interface
- ✅ Persistent PostgreSQL database

**Features Included**:
1. User Authentication (Better Auth + JWT)
2. Task CRUD Operations (Create, Read, Update, Delete)
3. Mark Task Complete (Completion toggle)
4. Responsive UI (Next.js + Tailwind CSS)
5. REST API with user isolation

**Out of Scope (Phase III+)**:
- Task categories/tags
- Collaboration/sharing
- Task search/filtering (advanced)
- Due dates and priorities
- Chatbot integration
- Notifications
- Mobile app

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16+ (App Router) | Server/Client components, API routes, SSR |
| **Frontend UI** | React 19+ | Component library and state management |
| **Frontend Styling** | Tailwind CSS 3+ | Utility-first CSS; responsive design |
| **Frontend Language** | TypeScript | Type-safe frontend code |
| **Authentication** | Better Auth | JWT token management, signup/signin |
| **Backend** | Python FastAPI | REST API server; async request handling |
| **Backend ORM** | SQLModel | Type-safe ORM; Pydantic integration |
| **Database** | Neon Serverless PostgreSQL | Persistent data store; user isolation |
| **Environment** | Environment variables | Configuration management (secrets, URLs) |
| **Development** | Claude Code + Spec-Kit Plus | Spec-driven development; code generation |
| **API Protocol** | REST (JSON) | Standard HTTP methods and JSON payloads |
| **Authentication Method** | JWT (JSON Web Tokens) | Stateless, scalable authentication |

## Monorepo Structure

```
fullstack-app/
├── .specify/                    # Spec-Kit configuration and templates
│   ├── memory/
│   │   └── constitution.md      # Project governance and principles
│   ├── templates/               # Spec/plan/task templates
│   └── scripts/                 # Automation scripts
├── specs/                       # Feature specifications (Spec-Kit managed)
│   ├── overview.md              # This file
│   ├── features/
│   │   ├── task-crud.md         # Task CRUD operations
│   │   └── authentication.md    # User authentication
│   ├── api/
│   │   └── rest-endpoints.md    # REST API contract
│   ├── database/
│   │   └── schema.md            # PostgreSQL schema
│   └── ui/
│       └── pages.md             # UI components and pages (TBD)
├── frontend/                    # Next.js 16+ application
│   ├── CLAUDE.md                # Frontend development guidelines
│   ├── app/                     # Next.js App Router pages
│   │   ├── page.tsx             # Home / Dashboard
│   │   ├── auth/
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── signin/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── ...
│   ├── components/              # Reusable React components
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts               # Centralized API client
│   │   └── auth.ts              # Authentication utilities
│   ├── styles/
│   │   └── globals.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── .env.local               # Frontend environment variables
├── backend/                     # FastAPI Python application
│   ├── CLAUDE.md                # Backend development guidelines
│   ├── main.py                  # FastAPI app entry point
│   ├── models.py                # SQLModel ORM models
│   ├── routes/
│   │   ├── tasks.py             # Task CRUD endpoints
│   │   ├── auth.py              # Authentication endpoints (if needed)
│   │   └── ...
│   ├── db.py                    # Database connection and session
│   ├── middleware/
│   │   └── auth.py              # JWT validation middleware
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Backend environment variables
│   └── ...
├── CLAUDE.md                    # Root project guidelines
├── docker-compose.yml           # Local development environment (optional)
├── README.md                    # Project documentation
└── history/
    ├── prompts/                 # Prompt History Records (PHRs)
    │   ├── constitution/
    │   ├── task-crud/
    │   ├── authentication/
    │   └── general/
    └── adr/                     # Architecture Decision Records
```

## Project Principles (from Constitution)

1. **Spec-Driven Development**: Every feature starts with a specification
2. **User Isolation & Security First**: JWT verification on every request; user data filtered by ID
3. **Full-Stack Monorepo**: Frontend and backend in single repo with layered CLAUDE.md files
4. **Technology Stack Fidelity**: Strict adherence to prescribed stack
5. **REST API Completeness**: All endpoints follow documented contract
6. **Authentication & Token Management**: Better Auth + JWT with shared secrets
7. **Database & ORM Consistency**: SQLModel for all database operations
8. **Component & API Client Centralization**: API calls through `/lib/api.ts`
9. **Responsive Design & Accessibility**: Tailwind CSS; mobile-first; ARIA support
10. **Simplicity Over Engineering**: YAGNI principles; minimal viable implementation

## Environment Variables

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_SECRET=<shared-secret>
```

**Backend (.env)**:
```
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>
BETTER_AUTH_SECRET=<shared-secret>
```

**Key**: The `BETTER_AUTH_SECRET` must be identical on frontend and backend for JWT signing/verification.

## Development Workflow

1. **Specification Phase**: Create/update specs in `/specs` (this phase)
2. **Planning Phase**: Create architecture plan in `spec.plan`
3. **Task Breakdown**: Create actionable tasks in `spec.tasks`
4. **Implementation Phase**: Execute tasks using `sp.implement` with agents
5. **Testing & Iteration**: Verify against acceptance criteria
6. **PHR & ADR Records**: Document decisions and learnings

## Success Metrics

### For Phase II Completion

- ✅ All 5 Basic Level features implemented and tested
- ✅ User authentication (signup/signin/logout) functional
- ✅ REST API endpoints all respond with correct status codes and data
- ✅ User isolation verified: no user can access/modify another user's tasks
- ✅ Frontend is responsive and mobile-friendly
- ✅ Database schema initialized and indexes created
- ✅ All code reviewed against Constitution principles
- ✅ PHRs and ADRs documented for significant decisions

### User Experience Targets

- **Task creation**: < 2 seconds from click to confirmation
- **Task list load**: < 500ms for users with 100+ tasks
- **Authentication**: < 2 seconds for signup/signin
- **Mobile responsiveness**: Works on iOS, Android, tablets, desktops
- **Accessibility**: WCAG AA compliance (keyboard nav, ARIA labels)

## Dependencies & Constraints

### External Services

- **Better Auth**: Authentication library (frontend + backend integration)
- **Neon PostgreSQL**: Database hosting (serverless)
- **GitHub**: Version control and deployment pipeline (optional)

### Constraints

- No external payment processing (out of scope)
- No email notifications or verification (Phase III+)
- No real-time collaboration (Phase III+)
- Single-region deployment (can be expanded later)

## Next Steps

1. **Clarification** (sp.clarify): Validate specifications for completeness and ask any clarification questions
2. **Planning** (sp.plan): Create detailed implementation plan with architecture decisions
3. **Task Breakdown** (sp.tasks): Generate actionable, dependency-ordered tasks
4. **Implementation** (sp.implement): Execute tasks using Claude Code with backend-dev-orchestrator and frontend-expert agents
5. **Review & Iterate**: Get feedback and make adjustments

## Links

- **Constitution**: `.specify/memory/constitution.md`
- **Feature Specs**: `specs/features/`
- **API Spec**: `specs/api/rest-endpoints.md`
- **Database Spec**: `specs/database/schema.md`
- **Architecture Plan**: `spec.plan` (to be created)
- **Implementation Tasks**: `spec.tasks` (to be created)
