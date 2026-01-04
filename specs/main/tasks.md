# Tasks: Phase II - Todo Full-Stack Web Application

**Input**: Design documents from `/specs/` (overview.md, features/, api/, database/, ui/)
**Plan**: `/specs/main/plan.md`
**Specs**: `/specs/features/task-crud.md`, `/specs/features/authentication.md`

**Agent Assignments**:
- 🎨 **Frontend-Expert Agent**: All frontend tasks (Next.js pages, React components, Tailwind CSS, API client, component tests)
- ⚙️ **Backend-Dev-Orchestrator Agent**: All backend tasks (FastAPI, SQLModel, JWT middleware, database, API tests)
- 🔗 **Coordination**: Clear API contract at `/specs/api/rest-endpoints.md` + database schema at `/specs/database/schema.md`

**Organization**: Tasks grouped by user story to enable independent, parallel implementation by both agents. Setup and Foundational phases are shared infrastructure; user story phases are parallelizable.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize monorepo structure, project dependencies, and development environment

**Agents**: Both (Frontend-Expert for frontend setup, Backend-Dev-Orchestrator for backend setup)

- [ ] T001 Create monorepo folder structure: `/frontend`, `/backend`, `/specs` with README.md in each
- [ ] T002 ⚙️ Initialize Python backend project: Create `/backend/requirements.txt`, `/backend/main.py`, `/backend/.env.example`
- [ ] T003 🎨 Initialize Next.js frontend project: Create `/frontend/package.json`, `/frontend/tsconfig.json`, `/frontend/tailwind.config.js`, `/frontend/.env.local.example`
- [ ] T004 [P] 🎨 Configure frontend TypeScript and Tailwind CSS: Update `/frontend/tsconfig.json`, `/frontend/tailwind.config.js` for strict mode
- [ ] T005 [P] ⚙️ Configure backend Python environment: Setup `/backend/requirements.txt` with FastAPI, SQLModel, python-jose, asyncpg, pytest dependencies
- [ ] T006 Create root `CLAUDE.md` with project overview and development workflow
- [ ] T007 [P] 🎨 Create `/frontend/CLAUDE.md` with Next.js guidelines, component patterns, API client architecture, Tailwind usage
- [ ] T008 [P] ⚙️ Create `/backend/CLAUDE.md` with FastAPI guidelines, route organization, middleware patterns, SQLModel usage
- [ ] T009 [P] Create git ignores and root documentation (README.md, CONTRIBUTING.md)

**Checkpoint**: Project structure initialized, dependencies listed, development guidelines documented.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core infrastructure that blocks all user story implementation

**⚠️ CRITICAL**: Both agents must complete this phase before user story work begins

### Database & ORM Layer (Backend)

- [ ] T010 ⚙️ Create database schema migration: `/backend/db.py` with SQLModel setup, Neon connection pooling, async session factory
- [ ] T011 ⚙️ Create base Task model in `/backend/models.py`: ID, user_id (FK), title, description, completed, created_at, updated_at fields with validation
- [ ] T012 ⚙️ Create database indexes: (user_id), (completed), (user_id, completed), (user_id, created_at DESC) via SQLAlchemy index definitions
- [ ] T013 ⚙️ Verify Neon connection and schema initialization: Test `/backend/db.py` can connect and create tables on startup

### Authentication & JWT Middleware (Backend)

- [ ] T014 ⚙️ Create JWT validation middleware: `/backend/middleware/auth.py` that extracts user_id from JWT token in Authorization header, validates signature using BETTER_AUTH_SECRET
- [ ] T015 ⚙️ Create Pydantic models for auth: `/backend/models.py` add UserResponse model (id, email, name, created_at) and TaskResponse model with full fields
- [ ] T016 ⚙️ Setup error handling framework: `/backend/main.py` implement HTTPException handlers for 400, 401, 403, 404, 500 responses
- [ ] T017 ⚙️ Create FastAPI app initialization: `/backend/main.py` with CORS setup, JWT middleware registration, dependency injection for auth

### Frontend Authentication & API Client (Frontend)

- [ ] T018 🎨 Create centralized API client: `/frontend/lib/api.ts` with fetch wrapper that automatically attaches JWT token to all requests via Authorization header
- [ ] T019 🎨 Create Better Auth integration: `/frontend/lib/auth.ts` with signup, signin, logout functions; store JWT in HTTP-only cookie
- [ ] T020 🎨 Create API types: `/frontend/lib/api.ts` define Task, User, TaskCreateRequest, TaskUpdateRequest TypeScript interfaces matching Pydantic models
- [ ] T021 🎨 Create authentication layout component: `/frontend/components/AuthLayout.tsx` with centered card, title, subtitle for signup/signin pages

### Frontend Foundation (Frontend)

- [ ] T022 [P] 🎨 Create app layout: `/frontend/app/layout.tsx` with root HTML setup, fonts, global styles, metadata
- [ ] T023 [P] 🎨 Create middleware.ts: `/frontend/middleware.ts` to redirect unauthenticated users to signin page
- [ ] T024 [P] 🎨 Create Tailwind CSS setup: `/frontend/styles/globals.css` with base styles, color palette, responsive breakpoints
- [ ] T025 🎨 Create Header component: `/frontend/components/Header.tsx` with app logo, user email display, logout button

**Checkpoint**: Database schema created, JWT middleware operational, API client ready, authentication infrastructure in place. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Create a New Task (Priority: P1) 🎯 MVP

**Goal**: Users can create new tasks with title and optional description, tasks are associated with authenticated user and immediately appear in list

**Independent Test**: Create task with valid title → task appears in list. Create task with invalid title → error shown. Verify task ownership (user isolation).

### Backend Implementation for US1 (Backend-Dev-Orchestrator)

- [ ] T026 ⚙️ [US1] Create POST /api/tasks endpoint in `/backend/routes/tasks.py`: Accept TaskCreateRequest (title, description), validate title length, extract user_id from JWT, insert into DB, return 201 with Task object
- [ ] T027 ⚙️ [US1] Add input validation to POST /api/tasks: Title required (1-200 chars), description optional (max 1000 chars), return 400 with descriptive errors
- [ ] T028 ⚙️ [US1] Add user isolation to POST /api/tasks: Task automatically associated with authenticated user's user_id, no cross-user creation possible
- [ ] T029 ⚙️ [US1] Create TaskService in `/backend/services/task_service.py`: create_task(user_id, title, description) method with DB insert logic
- [ ] T030 ⚙️ [US1] Add pytest integration test for task creation: `/backend/tests/test_tasks.py` test_create_task_success, test_create_task_missing_title, test_create_task_unauthorized

### Frontend Implementation for US1 (Frontend-Expert)

- [X] T031 🎨 [P] [US1] Create TaskForm component: `/frontend/components/TaskForm.tsx` with title input (1-200 chars), description textarea (max 1000 chars), submit button, error display
- [X] T032 🎨 [US1] Create Dashboard page: `/frontend/app/page.tsx` with TaskForm component, TaskList component (initially empty), error boundary
- [X] T033 🎨 [US1] Add form submission handling to TaskForm: Call `api.createTask()` via `/frontend/lib/api.ts`, handle 201 response, display success feedback
- [X] T034 🎨 [US1] Add error handling to TaskForm: Display validation errors (missing title, title too long), network errors, show "Try again" button
- [X] T035 🎨 [US1] Add validation feedback: Real-time character counter for title (X/200), description (X/1000); disable submit if title empty

### Integration & Testing for US1

- [ ] T036 🔗 [US1] Integration test: Signup → Signin → Create task with form → Verify task appears in GET /api/tasks response
- [ ] T037 🔗 [US1] Contract test: POST /api/tasks endpoint matches OpenAPI spec at `/specs/api/rest-endpoints.md`; verify 201, 400, 401, 403 responses

**Checkpoint**: User Story 1 complete and independently testable. Users can create tasks and see them listed. MVP foundation established.

---

## Phase 4: User Story 2 - View All Tasks (Priority: P1)

**Goal**: Users see all their tasks in a list with title, status (pending/completed), created_at; empty state shown if no tasks; list updates immediately on create

**Independent Test**: Create multiple tasks → all appear in list with correct data. Login as different user → see only own tasks (user isolation). Logout/login → tasks persist. Create task → list updates without refresh.

### Backend Implementation for US2 (Backend-Dev-Orchestrator)

- [ ] T038 ⚙️ [US2] Create GET /api/tasks endpoint in `/backend/routes/tasks.py`: Extract user_id from JWT, query all tasks where user_id matches (sorted by created_at DESC), return 200 with Task[] array
- [ ] T039 ⚙️ [US2] Add user isolation to GET /api/tasks: Query only tasks where user_id == authenticated user's ID; no cross-user data leakage
- [ ] T040 ⚙️ [US2] Add optional query parameters: status filter (all/pending/completed), sort option (created/title/updated); default: all tasks, sorted by created_at DESC
- [ ] T041 ⚙️ [US2] Create list_tasks method in `/backend/services/task_service.py`: Efficiently query tasks with indexes, handle large lists (100+ tasks), return ordered results
- [ ] T042 ⚙️ [US2] Add pytest test for task listing: `/backend/tests/test_tasks.py` test_list_tasks_success, test_list_tasks_empty, test_list_tasks_user_isolation, test_list_tasks_filters

### Frontend Implementation for US2 (Frontend-Expert)

- [X] T043 🎨 [P] [US2] Create TaskList component: `/frontend/components/TaskList.tsx` render array of Task objects, show title, status (checkmark or pending), created_at formatted, empty state message if tasks.length === 0
- [X] T044 🎨 [US2] Create TaskItem component: `/frontend/components/TaskItem.tsx` display single task with title, description, completion checkbox, edit/delete buttons, created_at timestamp
- [X] T045 🎨 [US2] Integrate TaskList into Dashboard: `/frontend/app/page.tsx` call `api.getTasks()` on page load, render TaskList with results, show loading spinner while fetching
- [X] T046 🎨 [US2] Add error handling to task list: Show error message if GET /api/tasks fails (network, 401 unauthorized, etc.), show retry button
- [X] T047 🎨 [US2] Add real-time list update on task create: After TaskForm.createTask() succeeds, refetch task list to show new task without page refresh
- [X] T048 🎨 [US2] Style TaskItem and TaskList components: Use Tailwind CSS, responsive grid for desktop/mobile, hover effects, visual distinction for completed vs pending

### Integration & Testing for US2

- [ ] T049 🔗 [US2] Integration test: Create 3 tasks → GET /api/tasks returns all 3 in order (oldest first). Verify user isolation (logged-in as User A, can't see User B's tasks).
- [ ] T050 🔗 [US2] Contract test: GET /api/tasks endpoint matches spec; verify response format, status codes (200, 401)

**Checkpoint**: User Story 2 complete. Users see all their tasks in a list, empty state shown for no tasks, list updates on new task creation without page refresh. User isolation verified.

---

## Phase 5: User Story 3 - Update a Task (Priority: P1)

**Goal**: Users can edit task title and description; changes persist immediately; updated_at timestamp updates; errors shown for invalid input; user isolation enforced

**Independent Test**: Edit task title → saved and displayed. Edit with empty title → error. Edit task owned by different user → 403 Forbidden. Verify updated_at changes.

### Backend Implementation for US3 (Backend-Dev-Orchestrator)

- [ ] T051 ⚙️ [US3] Create PUT /api/tasks/{id} endpoint in `/backend/routes/tasks.py`: Extract user_id from JWT, verify task.user_id == authenticated user (403 if not), update title/description, update updated_at, return 200 with updated Task object
- [ ] T052 ⚙️ [US3] Add input validation to PUT /api/tasks/{id}: Title (if provided) 1-200 chars, description (if provided) max 1000 chars, at least one field required for update, return 400 with errors
- [ ] T053 ⚙️ [US3] Add permission check to PUT /api/tasks/{id}: Verify user_id from JWT matches task.user_id; return 403 Forbidden if not (user isolation)
- [ ] T054 ⚙️ [US3] Create update_task method in `/backend/services/task_service.py`: Update task fields, set updated_at to current timestamp, commit to DB
- [ ] T055 ⚙️ [US3] Add pytest test for task update: `/backend/tests/test_tasks.py` test_update_task_success, test_update_task_permission_denied, test_update_task_invalid_input, test_update_task_not_found

### Frontend Implementation for US3 (Frontend-Expert)

- [X] T056 🎨 [US3] Add edit mode to TaskItem: Click edit button → inline form appears with title/description inputs (pre-filled with current values)
- [X] T057 🎨 [US3] Create edit form with save/cancel: Update `/frontend/components/TaskItem.tsx` with form submit button, cancel button, error display
- [X] T058 🎨 [US3] Call PUT /api/tasks/{id} on save: Call `api.updateTask(id, {title?, description?})` from edit form, handle 200 response, update local task state
- [X] T059 🎨 [US3] Handle edit errors: Display 400 (invalid input), 403 (permission denied), 404 (not found), show user-friendly error messages
- [X] T060 🎨 [US3] Add edit UI feedback: Show loading spinner during PUT request, disable inputs while saving, highlight recently updated tasks
- [X] T061 🎨 [US3] Style edit form: Use Tailwind CSS to create inline edit interface, match TaskItem styling, show cancel button clearly

### Integration & Testing for US3

- [ ] T062 🔗 [US3] Integration test: Create task → Edit title → GET /api/tasks confirms title changed and updated_at newer. Verify permission denied for cross-user edit.
- [ ] T063 🔗 [US3] Contract test: PUT /api/tasks/{id} endpoint matches spec; verify response format, status codes (200, 400, 403, 404, 401)

**Checkpoint**: User Story 3 complete. Users can edit tasks, validation enforced, permissions checked, updated_at tracked. All edits reflected in task list.

---

## Phase 6: User Story 4 - Mark Task as Complete (Priority: P1)

**Goal**: Users can toggle task completion status with checkbox; completed tasks shown with checkmark and strikethrough; updated_at updates; user isolation enforced

**Independent Test**: Toggle task completion → status changes, checkmark appears. Click again → status reverts. Verify visual feedback immediate. Check updated_at changed.

### Backend Implementation for US4 (Backend-Dev-Orchestrator)

- [ ] T064 ⚙️ [US4] Create PATCH /api/tasks/{id}/complete endpoint in `/backend/routes/tasks.py`: Extract user_id, verify ownership (403 if not), toggle completed field (false → true, true → false), update updated_at, return 200 with updated Task
- [ ] T065 ⚙️ [US4] Add permission check to PATCH /api/tasks/{id}/complete: Verify user_id from JWT matches task.user_id; return 403 Forbidden if not (user isolation)
- [ ] T066 ⚙️ [US4] Create toggle_complete method in `/backend/services/task_service.py`: Toggle task.completed, set updated_at, commit to DB
- [ ] T067 ⚙️ [US4] Add pytest test for task completion toggle: `/backend/tests/test_tasks.py` test_toggle_complete_pending_to_completed, test_toggle_complete_back_to_pending, test_toggle_complete_permission_denied

### Frontend Implementation for US4 (Frontend-Expert)

- [X] T068 🎨 [US4] Add checkbox to TaskItem: `/frontend/components/TaskItem.tsx` add checkbox input that reflects task.completed status
- [X] T069 🎨 [US4] Call PATCH endpoint on checkbox change: Call `api.toggleTaskComplete(id)` when checkbox clicked, handle 200 response, update local task state
- [X] T070 🎨 [US4] Add visual feedback for completed tasks: Apply strikethrough CSS (line-through) to completed task titles, reduce opacity, show checkmark icon
- [X] T071 🎨 [US4] Show loading state during toggle: Disable checkbox while PATCH request pending, show spinner, re-enable on success/error
- [X] T072 🎨 [US4] Handle toggle errors: Display errors (403, 404, 401), allow retry, show error message below task

### Integration & Testing for US4

- [ ] T073 🔗 [US4] Integration test: Create task (pending) → Toggle complete → task.completed = true, strikethrough visible. Toggle again → reverts to pending, strikethrough removed.
- [ ] T074 🔗 [US4] Contract test: PATCH /api/tasks/{id}/complete matches spec; verify 200, 403, 404, 401 responses

**Checkpoint**: User Story 4 complete. Users can toggle task completion, visual feedback immediate, updated_at tracked. All completion states persist across sessions.

---

## Phase 7: User Story 5 - Delete a Task (Priority: P2)

**Goal**: Users can delete tasks; deletion is permanent; deleted tasks removed from list immediately; user isolation enforced

**Independent Test**: Create task → Delete task → task no longer appears in GET /api/tasks. Verify 403 Forbidden for cross-user delete. Verify 404 on subsequent access.

### Backend Implementation for US5 (Backend-Dev-Orchestrator)

- [ ] T075 ⚙️ [US5] Create DELETE /api/tasks/{id} endpoint in `/backend/routes/tasks.py`: Extract user_id, verify ownership (403 if not), hard delete from DB, return 204 No Content
- [ ] T076 ⚙️ [US5] Add permission check to DELETE /api/tasks/{id}: Verify user_id from JWT matches task.user_id; return 403 Forbidden if not (user isolation)
- [ ] T077 ⚙️ [US5] Create delete_task method in `/backend/services/task_service.py`: Delete task from DB by ID, verify user ownership
- [ ] T078 ⚙️ [US5] Add pytest test for task deletion: `/backend/tests/test_tasks.py` test_delete_task_success, test_delete_task_permission_denied, test_delete_task_not_found

### Frontend Implementation for US5 (Frontend-Expert)

- [X] T079 🎨 [US5] Add delete button to TaskItem: `/frontend/components/TaskItem.tsx` add trash icon button, click opens confirmation modal
- [X] T080 🎨 [US5] Create delete confirmation modal: Show "Are you sure?" message, cancel and delete buttons, only delete on explicit confirmation
- [X] T081 🎨 [US5] Call DELETE endpoint on confirmation: Call `api.deleteTask(id)`, handle 204 response, remove task from local list immediately
- [X] T082 🎨 [US5] Handle delete errors: Display 403 (permission denied), 404 (not found), 401 (unauthorized), show retry option
- [X] T083 🎨 [US5] Add loading state during delete: Disable buttons while DELETE request pending, show spinner, close modal on success

### Integration & Testing for US5

- [ ] T084 🔗 [US5] Integration test: Create task → Delete task → GET /api/tasks no longer includes deleted task. Verify 403 Forbidden for cross-user delete.
- [ ] T085 🔗 [US5] Contract test: DELETE /api/tasks/{id} matches spec; verify 204, 403, 404, 401 responses

**Checkpoint**: User Story 5 complete. Users can delete tasks, deletion permanent, list updates immediately. All 5 basic-level features now functional.

---

## Phase 8: Authentication Features

**Goal**: Users can signup with email/password, signin to existing account, logout to end session. JWT tokens issued and validated. Session persists across browser refresh.

**Independent Test**: Signup with valid email/password → logged in, redirected to dashboard. Signin with wrong password → error. Logout → redirected to signin page.

### Backend Signup/Signin Endpoints (Backend-Dev-Orchestrator)

- [X] T086 ⚙️ Integrate Better Auth with FastAPI: Configure FastAPI to accept JWT tokens issued by Better Auth frontend, validate signature using BETTER_AUTH_SECRET
- [X] T087 ⚙️ Document auth flow: Update `/specs/api/rest-endpoints.md` with auth endpoints and JWT token format
- [X] T088 ⚙️ Add auth middleware testing: `/backend/tests/test_auth.py` test_valid_jwt, test_expired_jwt, test_missing_jwt, test_invalid_signature

### Frontend Signup/Signin Pages (Frontend-Expert)

- [X] T089 🎨 Create Signup page: `/frontend/app/auth/signup/page.tsx` with SignupForm component, link to signin
- [X] T090 🎨 Create Signin page: `/frontend/app/auth/signin/page.tsx` with SigninForm component, link to signup
- [X] T091 🎨 Create SignupForm component: `/frontend/components/SignupForm.tsx` with name, email, password inputs, validation, submit button
- [X] T092 🎨 Create SigninForm component: `/frontend/components/SigninForm.tsx` with email, password inputs, validation, submit button, remember me (optional)
- [X] T093 🎨 Integrate Better Auth signup: Call Better Auth signup function on SignupForm submit, handle success (redirect to dashboard), handle errors (email taken, etc.)
- [X] T094 🎨 Integrate Better Auth signin: Call Better Auth signin function on SigninForm submit, handle success (redirect to dashboard), handle errors (invalid credentials)
- [X] T095 🎨 Add logout button to Header: Call Better Auth logout, redirect to signin page
- [X] T096 🎨 Style auth pages: Create responsive, centered auth form layouts using Tailwind CSS

**Checkpoint**: Full authentication flow complete. Users can signup, signin, logout. Sessions persist across refresh. JWT validated on every API request.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Refinements, testing, documentation, and deployment readiness

### Testing & Quality Assurance

- [ ] T097 ⚙️ [P] Add comprehensive backend integration tests: `/backend/tests/test_integration.py` full user journey (signup → create task → list → update → complete → delete)
- [ ] T098 🎨 [P] Add frontend component tests: `/frontend/__tests__/components/` test TaskList, TaskItem, TaskForm, Header rendering
- [ ] T099 [P] API contract validation: Verify all endpoints match OpenAPI spec at `/specs/api/rest-endpoints.md`; validate request/response schemas
- [ ] T100 ⚙️ Add database transaction tests: Verify user isolation, concurrent operations, transaction rollback on errors
- [ ] T101 🎨 Test responsive design: Manual testing on mobile (iOS), tablet, desktop; verify Tailwind breakpoints working
- [ ] T102 🎨 Accessibility audit: Verify WCAG AA compliance (keyboard nav, ARIA labels, color contrast, form labels)

### Documentation & Deployment

- [ ] T103 Write `/backend/README.md`: Setup instructions, environment variables, running tests, deployment steps
- [ ] T104 🎨 Write `/frontend/README.md`: Setup instructions, npm commands, Tailwind customization, deployment steps
- [ ] T105 Write root `README.md`: Project overview, monorepo structure, development workflow, contributing guidelines
- [ ] T106 ⚙️ Create `/backend/.env.example` with required variables: DATABASE_URL, BETTER_AUTH_SECRET
- [ ] T107 🎨 Create `/frontend/.env.local.example` with required variables: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_BETTER_AUTH_SECRET
- [ ] T108 Validate quickstart.md: Follow `/specs/main/quickstart.md` setup steps, verify all components work end-to-end
- [ ] T109 [P] Run security checks: Backend (no secrets in code), Frontend (no credentials in client code), API (HTTPS in production)
- [ ] T110 [P] Performance optimization: Check task list response times (target <500ms for 100 tasks), optimize database indexes if needed

### Final Integration & Deployment Readiness

- [ ] T111 🔗 End-to-end user journey test: Signup → Signin → Create 5 tasks → List all → Edit one → Complete one → Delete one → Verify all work
- [ ] T112 🔗 Error scenario testing: Network failures, 401 unauthorized, 403 forbidden, 404 not found, validation errors - all handled gracefully
- [ ] T113 ⚙️ Database backup/restore test: Verify schema creation, migration rollback, data integrity
- [ ] T114 🎨 Verify JWT token lifecycle: Issue on signin, attach to requests, refresh (if implemented), expiry handling
- [ ] T115 Deploy to staging: Docker containers (optional), verify all endpoints accessible, run smoke tests

**Checkpoint**: Full feature complete, tested, documented. Ready for production deployment. MVP scope achieved with all 5 basic-level features + authentication.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
Phase 3-7 (User Stories 1-5) ← Can proceed in parallel
    ↓
Phase 8 (Authentication) ← Auth framework ready from Phase 2
    ↓
Phase 9 (Polish) ← All features complete
```

### User Story Dependencies

- **US1 (Create Task)**: Depends on Phase 2 foundational. Blocks no other stories.
- **US2 (View Tasks)**: Depends on Phase 2. Can run parallel with US1. Uses GET /api/tasks.
- **US3 (Update Task)**: Depends on Phase 2. Can run parallel with US1-2. Requires Task model from US1.
- **US4 (Complete Task)**: Depends on Phase 2. Can run parallel with US1-3. Requires Task model.
- **US5 (Delete Task)**: Depends on Phase 2 (P2 priority). Can run parallel with US1-4.
- **Authentication**: Depends on Phase 2 (JWT middleware). Can run parallel with user stories.

### Parallel Opportunities

**Phase 1 (Setup)**: All [P] tasks can run in parallel
- T004, T005 frontend/backend setup together
- T007, T008 CLAUDE.md files together
- T009 documentation together

**Phase 2 (Foundational)**: Backend and Frontend work in parallel
- Backend: T010-T017 (database, ORM, JWT middleware) can proceed independently
- Frontend: T018-T025 (API client, auth, components) can proceed independently
- Dependencies: Backend must complete database setup (T010-T013) before frontend can connect

**User Story Implementation**: Different developers can work on different stories in parallel
- Developer A: US1 (Create) - T026-T037
- Developer B: US2 (View) - T038-T050
- Developer C: US3 (Update) - T051-T063
- All stories share Phase 2 foundation and can work independently

**Example Parallel Execution (3-person team)**:

```
Timeline: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Team Member 1: [Setup] → [Foundational (DB)] → [US1 Create] → [Checkpoint]
Team Member 2: [Setup] → [Foundational (Auth/FE)] → [US2 View] → [Checkpoint]
Team Member 3: [Setup] → [Foundational (FE)] → [US3 Update] → [Checkpoint]
All: [Phase 8 Auth] → [Phase 9 Polish]
```

---

## Implementation Strategy

### MVP First (Recommended Start)

**Scope**: Phases 1-2 + Phase 3 (US1 Create) = Minimum viable product

1. **Week 1**: Complete Phase 1 (Setup) + Phase 2 (Foundational)
2. **Week 1-2**: Complete Phase 3 (User Story 1 - Create Task)
3. **Checkpoint**: Users can create tasks and see them in the list
4. **Deploy/Demo**: Validate MVP with stakeholders

### Incremental Delivery

**Scope**: Add each user story incrementally while maintaining working code

1. **Setup + Foundational** → Foundation ready (no user features yet)
2. **+ US1 (Create)** → Users can create tasks
3. **+ US2 (View)** → Users can see all tasks
4. **+ US3 (Update)** → Users can edit tasks
5. **+ US4 (Complete)** → Users can mark tasks done
6. **+ US5 (Delete)** → Users can remove tasks
7. **+ Authentication** → Full signup/signin/logout
8. **+ Polish** → Production ready

Each increment is independently deployable and testable.

### Parallel Team Strategy (3+ developers)

1. **Day 1-2**: All team members complete Phases 1-2 together
2. **Day 3+**: Developers split to work on different user stories in parallel
   - Backend developers: Work on US1-5 backend endpoints
   - Frontend developers: Work on US1-5 frontend components
   - DevOps/QA: Setup testing infrastructure, databases
3. **Daily standups**: Sync on API contracts, blockers, integration points
4. **Daily merges**: Merge small changes frequently to catch conflicts early
5. **Checkpoint tests**: After each user story, run full integration tests

---

## Notes

- **[P] marker**: Tasks marked [P] can run in parallel (different files, no blocking dependencies)
- **[Story] label**: Maps tasks to user stories for traceability (US1, US2, US3, US4, US5)
- **Agent assignment**: 🎨 Frontend-Expert, ⚙️ Backend-Dev-Orchestrator, 🔗 Coordination
- **Each user story**: Independently completable, testable, deployable
- **Commit frequently**: After each task or logical group to maintain history
- **Stop at checkpoints**: Validate story independently before proceeding
- **Cross-story dependencies**: Minimal - user stories isolated for parallel work
- **Specification**: All tasks reference exact file paths per `/specs/main/plan.md` architecture

---

## Task Summary

- **Total Tasks**: 115 implementation + testing tasks
- **Setup Phase (Phase 1)**: 9 tasks
- **Foundational Phase (Phase 2)**: 16 tasks (critical - blocks user stories)
- **User Story 1 (Create)**: 11 tasks
- **User Story 2 (View)**: 13 tasks
- **User Story 3 (Update)**: 13 tasks
- **User Story 4 (Complete)**: 11 tasks
- **User Story 5 (Delete)**: 11 tasks
- **Authentication (Phase 8)**: 18 tasks
- **Polish & QA (Phase 9)**: 14 tasks

**Backend-Dev-Orchestrator**: 55 tasks (database, ORM, JWT, FastAPI routes, backend tests)
**Frontend-Expert**: 47 tasks (Next.js pages, React components, Tailwind CSS, API client, component tests)
**Coordination**: 13 integration + contract tests

**Parallel Potential**: ~40 tasks marked [P] can run in parallel (different files, no blocking dependencies)
**Estimated Timeline**: 1-2 weeks with 2 developers (1 backend, 1 frontend), shorter with larger team
