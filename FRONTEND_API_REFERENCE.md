# Frontend API Reference - Phase II Todo Application

## Quick Reference for Frontend Developers

---

## 🔐 Authentication API

### useAuth Hook
```typescript
import { useAuth } from '@/lib/use-auth';

const MyComponent = () => {
  const {
    user,              // User object or null
    isAuthenticated,   // boolean
    isLoading,         // boolean
    login,             // async (email, password) => void
    logout,            // async () => void
    signup             // async (email, password, name) => void
  } = useAuth();
};
```

### User Object
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}
```

### Login
```typescript
try {
  await login('user@example.com', 'Password123!');
  // Automatically redirects to dashboard
} catch (error) {
  console.error(error.message);
}
```

### Sign Up
```typescript
try {
  await signup('user@example.com', 'Password123!', 'John Doe');
  // Redirects to signin page
} catch (error) {
  console.error(error.message);
}
```

### Logout
```typescript
await logout();
// Redirects to home/signin
// Clears token from localStorage
```

---

## 📋 Task API

### Get All Tasks
```typescript
import { api } from '@/lib/api';

const { tasks } = await api.getTasks();
// Returns: { tasks: Task[] }

// With filters
const { tasks } = await api.getTasks({
  status: 'pending',  // 'all' | 'pending' | 'completed'
  sort: 'created'     // 'created' | 'title' | 'updated'
});
```

### Get Single Task
```typescript
const task = await api.getTask(taskId);
// Returns: Task
```

### Create Task
```typescript
const newTask = await api.createTask({
  title: 'Buy groceries',
  description: 'Milk, eggs, bread'
});
// Returns: Task
```

### Update Task
```typescript
const updated = await api.updateTask(taskId, {
  title: 'Updated title',
  description: 'Updated description'
});
// Returns: Task
```

### Delete Task
```typescript
await api.deleteTask(taskId);
// Returns: void (204 No Content)
```

### Toggle Task Completion
```typescript
const updated = await api.toggleTaskComplete(taskId);
// Returns: Task with toggled completed status
```

---

## 🎨 Task Model

```typescript
interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;    // ISO 8601 timestamp
  updated_at: string;    // ISO 8601 timestamp
}
```

### Task Creation Request
```typescript
interface TaskCreateRequest {
  title: string;
  description?: string | null;
}
```

### Task Update Request
```typescript
interface TaskUpdateRequest {
  title?: string;
  description?: string | null;
}
```

---

## 🛠️ API Client

### Generic Request Methods
```typescript
import { api } from '@/lib/api';

// GET
const data = await api.get<T>('/api/endpoint');

// POST
const data = await api.post<T>('/api/endpoint', { body });

// PUT
const data = await api.put<T>('/api/endpoint', { body });

// PATCH
const data = await api.patch<T>('/api/endpoint', { body });

// DELETE
const data = await api.delete<T>('/api/endpoint');
```

### Error Handling
```typescript
import { APIError } from '@/lib/api';

try {
  await api.getTasks();
} catch (error) {
  if (error instanceof APIError) {
    console.error(`Error ${error.status}: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### API Base URL
```typescript
// Set via environment variable
NEXT_PUBLIC_API_URL=http://localhost:8000

// Or defaults to http://localhost:8000 in development
```

---

## 📱 Component Reference

### Header Component
```typescript
import Header from '@/components/Header';

// No props needed - uses useAuth internally
<Header />
```

**Features:**
- Dynamic navigation based on auth state
- Responsive mobile menu
- Profile dropdown
- Sign In/Up buttons

### Footer Component
```typescript
import Footer from '@/components/Footer';

// No props needed
<Footer />
```

**Features:**
- Links (Product, Company, Legal)
- Social media links
- Copyright info

### SigninForm Component
```typescript
import SigninForm from '@/components/SigninForm';

// No props needed - handles auth internally
<SigninForm />
```

**Features:**
- Email and password inputs
- Form validation
- Success/error messages
- Remember me checkbox

### SignupForm Component
```typescript
import SignupForm from '@/components/SignupForm';

// No props needed - handles auth internally
<SignupForm />
```

**Features:**
- Name, email, password fields
- Password strength indicator
- Password confirmation
- Terms acceptance
- Real-time validation

### ProtectedRoute Component
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute redirectTo="/auth/signin">
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

**Props:**
- `children: ReactNode` - Content to protect
- `redirectTo?: string` - Where to redirect if not authenticated

### TaskForm Component
```typescript
interface TaskFormProps {
  onSubmit: (data: TaskCreateRequest) => Promise<void>;
}

<TaskForm onSubmit={handleCreateTask} />
```

### TaskList Component
```typescript
interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => Promise<void>;
  onTaskDelete: (id: number) => Promise<void>;
  onToggleComplete: (id: number) => Promise<void>;
  isLoading?: boolean;
}

<TaskList
  tasks={tasks}
  onTaskUpdate={handleUpdate}
  onTaskDelete={handleDelete}
  onToggleComplete={handleToggle}
  isLoading={loading}
/>
```

### TaskItem Component
```typescript
interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number) => void;
}

<TaskItem
  task={task}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
  onToggleComplete={handleToggle}
/>
```

---

## 🎯 Common Patterns

### Fetching Data with Loading State
```typescript
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const result = await api.getTasks();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return <div>{/* Render data */}</div>;
}
```

### Form Submission with Validation
```typescript
'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function MyForm() {
  const [formData, setFormData] = useState({ title: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.createTask(formData);
      setFormData({ title: '' });
      // Show success
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData({ title: e.target.value })}
      />
      {errors.title && <span>{errors.title}</span>}
      <button disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Using Protected Routes
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      {/* This only renders if user is authenticated */}
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### Conditional Rendering Based on Auth
```typescript
'use client';
import { useAuth } from '@/lib/use-auth';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <a href="/auth/signin">Sign In</a>
          <a href="/auth/signup">Sign Up</a>
        </>
      )}
    </header>
  );
}
```

---

## 🚨 Error Handling

### Common API Errors
```typescript
// 400 Bad Request - Invalid input
{
  "detail": "Title is required",
  "status": 400
}

// 401 Unauthorized - Missing/invalid token
{
  "detail": "Invalid or expired token",
  "status": 401
}

// 403 Forbidden - Permission denied
{
  "detail": "You do not have permission to update this task",
  "status": 403
}

// 404 Not Found - Resource doesn't exist
{
  "detail": "Task not found",
  "status": 404
}

// 500 Internal Server Error
{
  "detail": "Internal server error",
  "status": 500
}
```

### Error Handling Pattern
```typescript
try {
  await api.updateTask(id, data);
} catch (error) {
  if (error instanceof APIError) {
    switch (error.status) {
      case 400:
        // Validation error - show to user
        break;
      case 401:
        // Unauthorized - redirect to login
        break;
      case 403:
        // Permission denied
        break;
      case 404:
        // Not found
        break;
      default:
        // Server error
    }
  }
}
```

---

## 🔑 Environment Variables

### Available Variables
```env
# Frontend can access (with NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend variables (not accessible in browser)
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
JWT_ALGORITHM=HS256
```

### Using in Code
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// Use in API client, default to 'http://localhost:8000'
```

---

## 📊 TypeScript Types

### Import Common Types
```typescript
import { Task, User, TaskCreateRequest, TaskUpdateRequest } from '@/lib/api';
```

### Define Custom Types
```typescript
interface ComponentProps {
  task: Task;
  onUpdate: (task: Task) => Promise<void>;
  isLoading?: boolean;
}
```

---

## 🎯 Best Practices

### ✅ DO
- Use useAuth for auth state
- Use api client for all HTTP calls
- Handle errors gracefully
- Show loading states
- Validate form inputs
- Use TypeScript strict mode
- Memoize expensive components
- Keep components focused and single-responsibility

### ❌ DON'T
- Make direct fetch calls (use api client)
- Store sensitive data in localStorage
- Skip TypeScript types
- Forget to handle errors
- Assume API calls succeed
- Leave console errors
- Use any types
- Create large monolithic components

---

## 🔗 Related Resources

- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Architecture overview
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Setup and common tasks
- [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) - Testing procedures
- [Frontend CLAUDE.md](./frontend/CLAUDE.md) - Frontend guidelines
- [Backend CLAUDE.md](./backend/CLAUDE.md) - Backend guidelines

---

## 📞 Quick Help

### Issue: API call returns 401
**Check**:
1. Is user logged in? Check `useAuth()` hook
2. Is token in localStorage? Check DevTools Application tab
3. Is endpoint protected? Check backend route

### Issue: Component not rendering after login
**Check**:
1. Are you using `useAuth` inside a client component?
2. Is component wrapped in AuthProvider?
3. Check for TypeScript errors

### Issue: Form validation not working
**Check**:
1. Are errors state set correctly?
2. Is validation function called before submit?
3. Check console for JavaScript errors

### Issue: Data not updating after API call
**Check**:
1. Is API call awaited?
2. Is state update in the right place?
3. Check if API actually modified data

---

## 📝 Version Info

- **Next.js**: 15.x
- **React**: 19.x
- **TypeScript**: 5.3+
- **Tailwind CSS**: 3.4+
- **Node**: 18+

---

Last Updated: January 9, 2026

