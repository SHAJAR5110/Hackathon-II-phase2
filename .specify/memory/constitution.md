# Todo Full-Stack Web Application Constitution

<!-- This constitution establishes non-negotiable principles for Phase II of the Hackathon II project -->

## Core Principles

### I. Spec-Driven Development
Every feature development begins with a written specification in `/specs`. Specifications must include user stories, acceptance criteria, and API contracts before code is written. Claude Code and Spec-Kit Plus orchestrate all implementation. No code changes without corresponding spec documentation.

### II. User Isolation & Security First
Each API endpoint must enforce user isolation: authenticated users can only access and modify their own data. JWT tokens (issued by Better Auth) must be verified on every request. All queries are filtered by the authenticated user's ID. Security is non-negotiable and verified at system boundaries (user input, API routes, database queries).

### III. Full-Stack Monorepo Organization
Frontend (Next.js 16+) and backend (FastAPI) live in a single monorepo with layered CLAUDE.md files for context. `/specs` contains organized specifications; `/frontend` and `/backend` contain implementation code. This enables cross-cutting changes and centralized governance in a single development context.

### IV. Technology Stack Fidelity
Strictly adhere to the prescribed stack: Next.js 16+ (App Router), Python FastAPI, SQLModel ORM, Neon Serverless PostgreSQL, Better Auth (JWT), Tailwind CSS. No substitutions without explicit approval. Technology decisions must be justified by architectural requirements, not preference.

### V. REST API Contract Completeness
All endpoints follow the documented API contract in `/specs/api/rest-endpoints.md`. Required methods: GET (list), POST (create), GET (detail), PUT (update), DELETE (delete), PATCH (toggle). All endpoints require JWT authentication. Responses must be JSON and follow Pydantic/TypeScript type definitions. Errors return standard HTTP status codes with structured error messages.

### VI. Authentication & Token Management (Better Auth + JWT)
Better Auth manages user sessions and issues JWT tokens on login. Backend verifies JWTs using the shared `BETTER_AUTH_SECRET` environment variable. Tokens are attached to every API request via `Authorization: Bearer <token>` header. Frontend and backend must use identical secrets. Token expiry is automatic (7 days default). Stateless authentication eliminates shared session database requirements.

### VII. Database & ORM Consistency
All database operations use SQLModel for type safety and ORM consistency. Models are defined in `models.py`. Database schema matches `/specs/database/schema.md`. Connection strings are environment variables (`DATABASE_URL`). Migrations and schema changes are documented and reversible. No raw SQL except in migration scripts.

### VIII. Component & API Client Centralization
Frontend API calls must route through `/lib/api.ts`. No direct fetch() calls in components. Backend routes are organized under `/api/` with clear separation of concerns (routes, models, database). Reusable UI components live in `/components`. All business logic is server-side; frontend is presentation and state orchestration only.

### IX. Responsive Design & Accessibility
Frontend must be fully responsive using Tailwind CSS utility classes. No inline styles. Components follow existing patterns. Accessibility is not optional—form labels, ARIA attributes, and keyboard navigation are required. Mobile-first design approach.

### X. Simplicity Over Engineering
Start with the minimal viable implementation. YAGNI (You Aren't Gonna Need It) principles apply: don't add configurability, helpers, or abstractions for hypothetical future requirements. One-time operations don't need utility functions. Complex features are broken into small, testable tasks.

## Development & Testing Standards

**Testing Discipline**: Test-driven development is mandatory. Write tests before implementation. All code must have corresponding test coverage. Integration tests required for API endpoints and database interactions.

**Code Quality**: Type safety is enforced (TypeScript frontend, Python type hints backend). No silent failures. Explicit error handling at system boundaries. Clear, self-documenting code names (no obscure abbreviations).

**Observability & Debugging**: Structured logging in FastAPI. Frontend error boundaries capture and log exceptions. All API failures include descriptive error messages. Debug mode available in development.

## Data & Schema Management

**Source of Truth**: Neon PostgreSQL is the authoritative data store. All user data (tasks, authentication metadata) persists in PostgreSQL. Schema is defined in `/specs/database/schema.md` and implemented via SQLModel.

**Schema Evolution**: Schema changes are documented in migrations. All migrations are reversible. Breaking changes require data migration scripts. Schema-driven design: define schema first, then implement ORM models.

**Data Retention**: User data persists until deleted by the user. Soft deletes (timestamp-based) are preferred to hard deletes for audit trails where applicable.

## Deployment & Operations

**Environment Configuration**: Secrets (database URLs, JWT secrets, API keys) come from environment variables, never hardcoded. `.env` files are local development only and never committed.

**Stateless Architecture**: Both frontend and backend are stateless. Frontend session state comes from Better Auth (JWT). Backend state is only in PostgreSQL. Services can be restarted without data loss.

**Monitoring**: All errors are logged with context (user ID, request ID, timestamp). Frontend error boundaries report exceptions. Backend logs all API requests and errors to stdout (structured JSON).

## Governance

**Authority**: This constitution supersedes all other practices and team conventions. Any conflict between this document and other guidance is resolved in favor of this constitution.

**Amendments**: Constitution changes require explicit user approval. Changes are documented with rationale. Version numbering follows semantic versioning: MAJOR (backward-incompatible changes), MINOR (new principles/requirements), PATCH (clarifications/wording).

**Compliance Verification**: Every PR or implementation task must verify alignment with applicable principles. Code reviews must check user isolation, authentication, API contracts, and technology stack fidelity.

**Documentation**: Updated principles are reflected in dependent templates: `spec-template.md`, `plan-template.md`, `tasks-template.md`. CLAUDE.md files at project level and per-subsystem are authoritative runtime guidance.

**PHR & ADR Records**: Every user request generates a Prompt History Record (PHR) in `/history/prompts/`. Architectural decisions that are long-term, impact multiple components, or have significant tradeoffs generate Architecture Decision Records (ADRs) in `/history/adr/`.

---

**Version**: 1.0.0 | **Ratified**: 2026-01-04 | **Last Amended**: 2026-01-04
