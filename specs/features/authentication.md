# Feature Specification: User Authentication (Better Auth + JWT)

**Feature Branch**: `02-authentication`
**Created**: 2026-01-04
**Status**: Draft
**Input**: Implement user signup/signin using Better Auth with JWT token generation and validation across frontend and backend.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Signup (Priority: P1)

As a new user, I want to create an account with my email and password so that I can access the application and store my personal tasks.

**Why this priority**: Signup is the gate to the entire application. Without it, users cannot access the system.

**Independent Test**: Can be fully tested by creating a new account with valid credentials and verifying the user can immediately log in. Demonstrates account creation.

**Acceptance Scenarios**:

1. **Given** a user is on the signup page, **When** they enter a valid email, password (min 8 chars), and name, **Then** an account is created and they are logged in
2. **Given** a user is signing up, **When** they enter an email that already exists, **Then** an error is shown: "Email already registered"
3. **Given** a user is signing up, **When** they enter a password shorter than 8 characters, **Then** an error is shown and signup is blocked
4. **Given** a user is signing up, **When** they enter an invalid email format, **Then** an error is shown
5. **Given** a user successfully signs up, **When** they are logged in, **Then** a JWT token is issued and stored in an HTTP-only cookie

---

### User Story 2 - User Signin (Priority: P1)

As an existing user, I want to log in with my email and password so that I can access my tasks.

**Why this priority**: Users must be able to authenticate to use the app. Essential functionality.

**Independent Test**: Can be fully tested by signing in with valid credentials and verifying the user is authenticated and can access their tasks.

**Acceptance Scenarios**:

1. **Given** a registered user is on the signin page, **When** they enter correct email and password, **Then** they are logged in and redirected to the task list
2. **Given** a user is signing in, **When** they enter an incorrect password, **Then** an error is shown: "Invalid email or password"
3. **Given** a user is signing in, **When** they enter an email that doesn't exist, **Then** an error is shown: "Invalid email or password"
4. **Given** a user successfully signs in, **When** the session is established, **Then** a JWT token is issued and stored securely
5. **Given** a user is signed in, **When** they navigate to any protected page, **Then** the JWT token is automatically attached to all API requests

---

### User Story 3 - JWT Token Validation (Priority: P1)

As the system, I must verify that every API request from an authenticated user contains a valid JWT token so that I can enforce user isolation and security.

**Why this priority**: Without token validation, the system has no security. This is non-negotiable for user isolation.

**Independent Test**: Can be fully tested by making API requests with/without valid tokens and verifying 401 for missing tokens and 403 for invalid signatures.

**Acceptance Scenarios**:

1. **Given** a user makes an API request without a JWT token, **When** the backend processes the request, **Then** it responds with 401 Unauthorized
2. **Given** a user makes an API request with an expired JWT token, **When** the backend verifies it, **Then** it responds with 401 Unauthorized
3. **Given** a user makes an API request with a tampered JWT token, **When** the backend verifies the signature, **Then** it responds with 401 Unauthorized
4. **Given** a user makes an API request with a valid JWT token, **When** the backend verifies it, **Then** the user_id is extracted and used to filter all data access
5. **Given** a user logs in, **When** the JWT token is issued, **Then** it contains claims for user_id, email, and issued-at timestamp

---

### User Story 4 - Token Expiry & Session Duration (Priority: P2)

As a user, I want my session to persist across page refreshes but expire after a fixed period so that my account is secure if I leave my computer unattended.

**Why this priority**: P2 because the MVP uses fixed token expiry with no automatic refresh; refresh tokens are a Phase III enhancement.

**Independent Test**: Can be fully tested by verifying the session persists across page refreshes and expires after 7 days, requiring re-login.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they refresh the browser within the 7-day token lifetime, **Then** they remain logged in (JWT is restored from secure storage)
2. **Given** a user is logged in, **When** their JWT expires (7 days from issuance), **Then** subsequent API calls return 401 and they are prompted to log in again
3. **Given** a user's token has expired, **When** they attempt to access the app, **Then** they see the signin page and must log in again to continue

---

### User Story 5 - User Logout (Priority: P1)

As a user, I want to log out so that I can end my session and prevent others from accessing my account on shared computers.

**Why this priority**: Essential for security. Users must be able to end their session.

**Independent Test**: Can be fully tested by logging out and verifying subsequent requests to protected endpoints result in 401.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they click the logout button, **Then** their session is terminated and JWT token is cleared
2. **Given** a user has logged out, **When** they attempt to access a protected page, **Then** they are redirected to the login page
3. **Given** a user has logged out, **When** they attempt to make an API request, **Then** it fails with 401 Unauthorized

---

### Edge Cases

- What happens if a user signs up with a name containing special characters or non-ASCII characters? (Should accept and display correctly)
- What happens if a user attempts to sign up twice with the same email in rapid succession? (Should handle gracefully, only create one account)
- How does the system handle a user clearing browser cookies while logged in? (Should require re-login on next API request)
- What happens if a JWT token is compromised? (Better Auth + HTTPS should mitigate; no revocation mechanism in MVP)
- What if a user deletes their account? (Out of scope for MVP; assume accounts are not deletable)

---

## Clarifications *(Session 2026-01-04)*

- **Q1**: Should the MVP implement automatic token refresh or fixed expiry? → **A: Fixed 7-day token expiry with NO automatic refresh. Users must log in again when the token expires. Refresh token implementation is deferred to Phase III.**

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use Better Auth library on the frontend to manage user signup/signin/logout
- **FR-002**: System MUST validate email format (RFC 5322 standard) and reject invalid emails
- **FR-003**: System MUST enforce password minimum length of 8 characters
- **FR-004**: System MUST hash passwords using bcrypt or equivalent before storing in the database
- **FR-005**: System MUST issue a JWT token upon successful signin/signup containing user_id, email, and iat (issued-at) claim
- **FR-006**: System MUST store JWT token in an HTTP-only, secure cookie to prevent XSS token theft
- **FR-007**: System MUST use the BETTER_AUTH_SECRET environment variable (shared between frontend and backend) to sign and verify JWTs
- **FR-008**: System MUST decode and validate JWT tokens in FastAPI middleware before allowing access to protected routes
- **FR-009**: System MUST set JWT token expiry to 7 days from issuance
- **FR-010**: System MUST return 401 Unauthorized with message "Invalid or expired token" when JWT is missing, expired, or tampered
- **FR-011**: System MUST extract user_id from JWT payload and pass it to route handlers for user isolation enforcement
- **FR-012**: System MUST clear the JWT token cookie upon logout, invalidating the session
- **FR-013**: System MUST prevent duplicate email registrations (email column UNIQUE constraint in database)
- **FR-014**: System MUST provide clear error messages for each failure scenario (e.g., "Email already registered", "Invalid password")

### Key Entities *(include if feature involves data)*

- **User**: Managed by Better Auth; includes id (string, primary key), email (string, unique), password_hash (string, bcrypt), name (string), created_at (timestamp), updated_at (timestamp)
- **Session**: Managed implicitly by Better Auth; JWT token contains session data
- **JWT Token**: Payload includes user_id, email, iat, exp (expiry = iat + 7 days)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can sign up with email and password in under 2 seconds (including network round-trip)
- **SC-002**: Users can sign in and be redirected to the task list in under 1 second
- **SC-003**: All passwords are hashed and never stored in plaintext
- **SC-004**: JWT tokens are verified on 100% of protected API requests; no unverified requests reach business logic
- **SC-005**: Sessions persist across page refreshes (users remain logged in without re-entering credentials)
- **SC-006**: Logout clears the session completely; subsequent API requests return 401 Unauthorized
- **SC-007**: Invalid or expired tokens result in 401 Unauthorized within 100ms (no false positives allowing access)

## Assumptions

- Better Auth is correctly configured and handles signup/signin/logout on the frontend
- JWT tokens are issued with a 7-day expiry by Better Auth
- The BETTER_AUTH_SECRET is identical on frontend and backend (environment variable)
- Passwords are hashed using bcrypt (Better Auth handles this automatically)
- HTTP-only cookies are used to store the JWT token (prevents JavaScript access)
- HTTPS is enforced in production (tokens are transmitted over secure connections only)
- **Token Expiry & Refresh (Clarified Q1)**: MVP uses fixed 7-day token expiry with NO automatic refresh or refresh tokens. When a token expires, users must log in again. Refresh token implementation is deferred to Phase III.
- Email verification is not required for MVP (accounts are active immediately upon signup)

## Out of Scope (Phase II)

- Email verification / confirmation
- Password reset via email
- Two-factor authentication (2FA)
- Social login (Google, GitHub, etc.)
- Account deletion
- User profile editing
- Role-based access control (RBAC)
- Session revocation / token blacklist
- Device tracking or login history
