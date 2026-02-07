# Specification: REST API Endpoints

**Created**: 2026-01-04
**Status**: Draft
**Scope**: Phase II Basic Level - All task CRUD operations with JWT authentication

## Overview

All endpoints require a valid JWT token in the Authorization header (Bearer scheme). The JWT token is issued by Better Auth upon login and contains the user_id claim. The backend verifies the token and extracts the user_id to enforce user isolation on all queries.

## Base URL

- Development: `http://localhost:8000`
- Production: `https://api.example.com`

## Authentication

Every request to a protected endpoint MUST include:

```
Authorization: Bearer <JWT_TOKEN>
```

If the token is missing, expired, or invalid, the server responds with `401 Unauthorized`.

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Descriptive error message",
  "status": 400
}
```

Common HTTP status codes:

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input (missing required field, value out of range, etc.)
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User lacks permission (e.g., trying to delete another user's task)
- **404 Not Found**: Resource does not exist
- **500 Internal Server Error**: Server error

---

## API Endpoints

### 1. Get All Tasks for Authenticated User

**Endpoint**: `GET /api/tasks`

**Authentication**: Required (JWT)

**Description**: Retrieve all tasks belonging to the authenticated user. Includes title, status, created_at, updated_at.

**Query Parameters** (optional):

- `status`: Filter by completion status. Values: `"all"` (default), `"pending"`, `"completed"`
- `sort`: Sort order. Values: `"created"` (default, newest first), `"title"` (alphabetical), `"updated"` (most recent changes first)

**Request Example**:

```
GET /api/tasks?status=pending&sort=created
Authorization: Bearer eyJhbGc...
```

**Response (200 OK)**:

```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": "user123",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-01-04T10:00:00Z",
      "updated_at": "2026-01-04T10:00:00Z"
    },
    {
      "id": 2,
      "user_id": "user123",
      "title": "Finish project",
      "description": null,
      "completed": true,
      "created_at": "2026-01-03T15:30:00Z",
      "updated_at": "2026-01-04T09:45:00Z"
    }
  ]
}
```

**Response (401 Unauthorized)** - Missing or invalid token:

```json
{
  "detail": "Invalid or expired token"
}
```

**Business Rules**:

- Returns only tasks owned by the authenticated user (filtered by user_id)
- Returns empty array if user has no tasks
- Tasks are ordered by creation date (newest first) unless otherwise specified

---

### 2. Create a New Task

**Endpoint**: `POST /api/tasks`

**Authentication**: Required (JWT)

**Description**: Create a new task for the authenticated user.

**Request Body**:

```json
{
  "title": "Write documentation",
  "description": "Document the API endpoints"
}
```

**Field Validation**:

- `title`: String, required, 1-200 characters
- `description`: String, optional, max 1000 characters

**Response (201 Created)**:

```json
{
  "id": 3,
  "user_id": "user123",
  "title": "Write documentation",
  "description": "Document the API endpoints",
  "completed": false,
  "created_at": "2026-01-04T10:15:00Z",
  "updated_at": "2026-01-04T10:15:00Z"
}
```

**Response (400 Bad Request)** - Missing title:

```json
{
  "detail": "Title is required"
}
```

**Response (400 Bad Request)** - Title too long:

```json
{
  "detail": "Title must be between 1 and 200 characters"
}
```

**Response (401 Unauthorized)**:

```json
{
  "detail": "Invalid or expired token"
}
```

**Business Rules**:

- Task is automatically associated with the authenticated user (user_id extracted from JWT)
- Task starts with `completed = false` (pending status)
- Task timestamps (created_at, updated_at) are set to the current server time

---

### 3. Get Single Task Details

**Endpoint**: `GET /api/tasks/{task_id}`

**Authentication**: Required (JWT)

**Path Parameters**:

- `task_id`: Integer, the ID of the task to retrieve

**Response (200 OK)**:

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

**Response (404 Not Found)** - Task doesn't exist or belongs to another user:

```json
{
  "detail": "Task not found"
}
```

**Response (401 Unauthorized)**:

```json
{
  "detail": "Invalid or expired token"
}
```

**Business Rules**:

- Returns 404 if the task doesn't exist OR if it belongs to a different user (user isolation)

---

### 4. Update a Task

**Endpoint**: `PUT /api/tasks/{task_id}`

**Authentication**: Required (JWT)

**Path Parameters**:

- `task_id`: Integer, the ID of the task to update

**Request Body** (all fields optional, but at least one must be provided):

```json
{
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, and pasta"
}
```

**Field Validation**:

- `title`: String, optional, 1-200 characters if provided
- `description`: String, optional, max 1000 characters if provided

**Response (200 OK)**:

```json
{
  "id": 1,
  "user_id": "user123",
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, and pasta",
  "completed": false,
  "created_at": "2026-01-04T10:00:00Z",
  "updated_at": "2026-01-04T10:30:00Z"
}
```

**Response (400 Bad Request)** - Title too long:

```json
{
  "detail": "Title must be between 1 and 200 characters"
}
```

**Response (403 Forbidden)** - Task belongs to another user:

```json
{
  "detail": "You do not have permission to update this task"
}
```

**Response (404 Not Found)**:

```json
{
  "detail": "Task not found"
}
```

**Business Rules**:

- Only the task owner can update it (verified via user_id from JWT)
- updated_at is automatically set to the current server time
- created_at never changes
- If no fields are provided in the request body, a 400 error is returned

---

### 5. Delete a Task

**Endpoint**: `DELETE /api/tasks/{task_id}`

**Authentication**: Required (JWT)

**Path Parameters**:

- `task_id`: Integer, the ID of the task to delete

**Response (204 No Content)** - Successfully deleted (empty body):

```
[empty]
```

**Response (403 Forbidden)** - Task belongs to another user:

```json
{
  "detail": "You do not have permission to delete this task"
}
```

**Response (404 Not Found)**:

```json
{
  "detail": "Task not found"
}
```

**Response (401 Unauthorized)**:

```json
{
  "detail": "Invalid or expired token"
}
```

**Business Rules**:

- Only the task owner can delete it
- Deletion is permanent; the task is removed from the database
- A 204 response indicates success with no response body

---

### 6. Toggle Task Completion Status

**Endpoint**: `PATCH /api/tasks/{task_id}/complete`

**Authentication**: Required (JWT)

**Path Parameters**:

- `task_id`: Integer, the ID of the task to toggle

**Request Body** (optional, for clarity):

```json
{
  "completed": true
}
```

Or simply omit the body to toggle (not recommended for clarity).

**Response (200 OK)**:

```json
{
  "id": 1,
  "user_id": "user123",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-04T10:00:00Z",
  "updated_at": "2026-01-04T10:45:00Z"
}
```

**Response (403 Forbidden)** - Task belongs to another user:

```json
{
  "detail": "You do not have permission to update this task"
}
```

**Response (404 Not Found)**:

```json
{
  "detail": "Task not found"
}
```

**Response (401 Unauthorized)**:

```json
{
  "detail": "Invalid or expired token"
}
```

**Business Rules**:

- Toggles the `completed` field: false → true, true → false
- updated_at is set to the current server time
- Returns the updated task object with the new state

---

## Request/Response Type Definitions

All request and response bodies use JSON format and are validated against these Pydantic models:

### Task Model

```
{
  "id": integer,
  "user_id": string,
  "title": string (1-200 chars),
  "description": string or null (max 1000 chars),
  "completed": boolean,
  "created_at": ISO 8601 timestamp,
  "updated_at": ISO 8601 timestamp
}
```

### CreateTaskRequest

```
{
  "title": string (1-200 chars, required),
  "description": string or null (optional, max 1000 chars)
}
```

### UpdateTaskRequest

```
{
  "title": string or null (1-200 chars if provided),
  "description": string or null (max 1000 chars if provided)
}
```

---

## Security & User Isolation

- **JWT Validation**: Every protected endpoint validates the JWT token and extracts the user_id before processing
- **User Isolation**: All endpoints filter queries by the authenticated user's ID; users cannot see or modify other users' tasks
- **Permission Checks**: Update and Delete endpoints verify the requesting user owns the task before allowing the operation
- **Error Messages**: 404 responses are used for both "not found" and "permission denied" scenarios to avoid leaking information about other users' tasks

---

## Rate Limiting

(Not implemented in MVP; can be added in future phases via middleware)

---

## API Contract Version

Version: 1.0.0
Last Updated: 2026-01-04

All endpoints are stable for Phase II. Future versions will be indicated by incrementing the version number and maintaining backward compatibility where possible.
