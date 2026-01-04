# Frontend Development Guidelines - Todo Application

## Overview

This directory contains the Next.js 16+ frontend for the Phase II Todo Full-Stack Web Application. Follow these guidelines for all frontend development work.

## Technology Stack

- **Framework**: Next.js 16+ (App Router, Server Components)
- **Language**: TypeScript 5.3+ (strict mode enabled)
- **Styling**: Tailwind CSS 3.4+ (utility-first approach)
- **Authentication**: Better Auth (JWT-based)
- **Icons**: Lucide React
- **State Management**: React 19 hooks, Context API (no external state library)
- **HTTP Client**: Native fetch API with centralized wrapper

## Core Principles

### 1. Server Components First

**Default**: All components are Server Components unless interactivity is required.

```tsx
// ✅ Good: Server Component (default)
export default function TaskList() {
  const tasks = await fetchTasks(); // Can use async/await
  return <div>{tasks.map(task => ...)}</div>;
}

// ✅ Good: Client Component (when needed)
'use client';
export default function TaskForm() {
  const [title, setTitle] = useState('');
  // Interactive state requires Client Component
}
```

**Use Client Components only for:**
- User interactions (onClick, onChange, onSubmit)
- Browser APIs (localStorage, window, document)
- React hooks (useState, useEffect, useContext)
- Real-time features (WebSocket, SSE)

### 2. TypeScript Strict Mode

**All code must pass TypeScript strict checks**:

```tsx
// ✅ Good: Explicit types
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

function TaskItem({ task }: { task: Task }) {
  return <div>{task.title}</div>;
}

// ❌ Bad: Implicit any
function TaskItem({ task }) { // Error: Parameter 'task' implicitly has an 'any' type
  return <div>{task.title}</div>;
}
```

**Key rules:**
- No implicit `any` types
- All function parameters must have types
- Props must use interfaces or types
- Use `unknown` instead of `any` when type is truly unknown

### 3. Centralized API Client

**ALL API calls must go through `/lib/api.ts`**:

```tsx
// ✅ Good: Using centralized API client
import { api } from '@/lib/api';

async function getTasks() {
  const data = await api.get<{ tasks: Task[] }>('/api/tasks');
  return data.tasks;
}

// ❌ Bad: Direct fetch calls
async function getTasks() {
  const res = await fetch('http://localhost:8000/api/tasks'); // Don't do this
}
```

**Why?**
- Automatic JWT token attachment
- Consistent error handling
- Type-safe responses
- Centralized configuration (base URL, headers)

### 4. Tailwind CSS Only

**Use Tailwind utility classes; avoid custom CSS**:

```tsx
// ✅ Good: Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
  <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
    Edit
  </button>
</div>

// ❌ Bad: Inline styles or custom CSS
<div style={{ padding: '16px', backgroundColor: 'white' }}> // Don't do this
</div>

// ❌ Bad: Custom CSS classes in separate files
<div className="custom-card"> // Avoid unless absolutely necessary
</div>
```

**Responsive Design**:
```tsx
// Mobile-first responsive design
<div className="
  w-full p-4           {/* Mobile */}
  md:w-1/2 md:p-6     {/* Tablet (768px+) */}
  lg:w-1/3 lg:p-8     {/* Desktop (1024px+) */}
">
```

### 5. Component Organization

**File structure**:
```
components/
├── TaskList.tsx       # List of tasks
├── TaskItem.tsx       # Individual task card
├── TaskForm.tsx       # Create/edit task form
├── Header.tsx         # Navigation header
├── AuthLayout.tsx     # Auth page layout
└── ui/                # Reusable UI components
    ├── Button.tsx
    ├── Input.tsx
    └── Modal.tsx
```

**Component patterns**:
```tsx
// ✅ Good: Props interface, descriptive names
interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, data: Partial<Task>) => void;
  onDelete: (id: number) => void;
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  // Component logic
}

// ❌ Bad: No types, unclear naming
export default function Item({ data, cb1, cb2 }) {
  // Don't do this
}
```

### 6. Error Handling

**Handle errors gracefully with user-friendly messages**:

```tsx
'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function TaskForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/api/tasks', { title: 'New task' });
      // Success: redirect or refresh
    } catch (err) {
      // Display user-friendly error
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 mb-4 text-sm text-danger-dark bg-danger-light rounded-md">
          {error}
        </div>
      )}
      {/* Form fields */}
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}
```

### 7. Authentication Flow

**Protected routes use middleware**:

```tsx
// middleware.ts (root level)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  if (!token && !request.nextUrl.pathname.startsWith('/auth')) {
    // Redirect to signin if not authenticated
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**Auth state in components**:

```tsx
'use client';
import { useAuth } from '@/lib/auth';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </header>
  );
}
```

### 8. Forms and Validation

**Client-side validation before submission**:

```tsx
'use client';
import { useState } from 'react';

export default function TaskForm() {
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return; // Don't submit if validation fails
    }

    // Submit form
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={errors.title ? 'border-danger' : 'border-gray-300'}
        />
        {errors.title && (
          <p className="text-sm text-danger-dark">{errors.title}</p>
        )}
      </div>
    </form>
  );
}
```

### 9. Performance Optimization

**Lazy load components when appropriate**:

```tsx
import dynamic from 'next/dynamic';

// ✅ Good: Lazy load heavy components
const TaskEditor = dynamic(() => import('@/components/TaskEditor'), {
  loading: () => <div>Loading editor...</div>,
  ssr: false, // Disable SSR if component uses browser APIs
});
```

**Optimize images**:

```tsx
import Image from 'next/image';

// ✅ Good: Use Next.js Image component
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority // For above-the-fold images
/>
```

### 10. Accessibility (WCAG AA)

**Semantic HTML and ARIA labels**:

```tsx
// ✅ Good: Accessible form
<form>
  <label htmlFor="task-title" className="sr-only">
    Task Title
  </label>
  <input
    id="task-title"
    type="text"
    aria-required="true"
    aria-describedby="title-error"
  />
  <span id="title-error" role="alert" aria-live="polite">
    {errors.title}
  </span>
</form>

// ✅ Good: Keyboard navigation
<button
  onClick={handleDelete}
  aria-label="Delete task"
  className="focus:outline-none focus:ring-2 focus:ring-primary-500"
>
  <TrashIcon />
</button>
```

## Common Patterns

### API Request Pattern

```tsx
import { api } from '@/lib/api';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// GET request
const tasks = await api.get<{ tasks: Task[] }>('/api/tasks');

// POST request
const newTask = await api.post<Task>('/api/tasks', {
  title: 'New task',
  description: 'Task details',
});

// PUT request
const updated = await api.put<Task>(`/api/tasks/${id}`, {
  title: 'Updated title',
});

// DELETE request
await api.delete(`/api/tasks/${id}`);

// PATCH request
const toggled = await api.patch<Task>(`/api/tasks/${id}/complete`, {});
```

### Loading States

```tsx
'use client';
import { useState, useEffect } from 'react';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await api.get<{ tasks: Task[] }>('/api/tasks');
        setTasks(data.tasks);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Loading tasks...</div>;
  }

  return <div>{/* Render tasks */}</div>;
}
```

### Empty States

```tsx
{tasks.length === 0 ? (
  <div className="text-center py-12 text-gray-500">
    <p className="text-lg">No tasks yet</p>
    <p className="text-sm mt-2">Create your first task to get started</p>
  </div>
) : (
  <ul>{tasks.map(task => ...)}</ul>
)}
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `TaskList.tsx`, `AuthLayout.tsx`)
- **Utilities**: camelCase (e.g., `api.ts`, `auth.ts`)
- **Pages (App Router)**: lowercase (e.g., `page.tsx`, `layout.tsx`)
- **Types**: PascalCase (e.g., `Task`, `User`, `TaskCreateRequest`)

## Testing

```tsx
// Component tests (Jest/Vitest)
import { render, screen } from '@testing-library/react';
import TaskItem from '@/components/TaskItem';

test('renders task title', () => {
  const task = { id: 1, title: 'Buy groceries', completed: false };
  render(<TaskItem task={task} />);
  expect(screen.getByText('Buy groceries')).toBeInTheDocument();
});
```

## Security Checklist

- [ ] No sensitive data (API keys, secrets) in client-side code
- [ ] All API requests include JWT token (via centralized client)
- [ ] User inputs sanitized before rendering (React does this by default)
- [ ] HTTPS enforced in production
- [ ] Auth middleware protects all non-public routes
- [ ] Error messages don't expose internal details

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)
- [Better Auth Documentation](https://better-auth.com/docs)
