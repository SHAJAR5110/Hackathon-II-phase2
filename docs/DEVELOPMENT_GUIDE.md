# Development Guide - Phase II Todo Application

## Quick Start

### 1. Setup Environment
```bash
# Frontend
cd frontend
npm install
cp .env.example .env.local

# Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Start Development Server
```bash
# Frontend (from frontend directory)
npm run dev

# Open http://localhost:3000
```

### 3. Start Backend Server
```bash
# Backend (from backend directory)
python -m uvicorn main:app --reload --port 8000
```

---

## Project Structure Reference

### Frontend Directory Tree
```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── auth/
│   │   ├── signin/page.tsx       # Login page
│   │   └── signup/page.tsx       # Signup page
│   └── dashboard/
│       └── page.tsx             # Protected dashboard
├── components/                  # React components
│   ├── Header.tsx               # Navigation header
│   ├── Footer.tsx               # Footer
│   ├── SigninForm.tsx           # Login form
│   ├── SignupForm.tsx           # Signup form
│   ├── ProtectedRoute.tsx       # Route protection
│   ├── TaskForm.tsx             # Task creation/editing
│   ├── TaskList.tsx             # Task list display
│   ├── TaskItem.tsx             # Task card component
│   ├── DeleteConfirmModal.tsx   # Delete confirmation
│   ├── AuthLayout.tsx           # Auth page layout
│   └── [other components]
├── lib/                         # Utilities & hooks
│   ├── api.ts                   # API client
│   ├── auth-context.tsx         # Auth state management
│   ├── use-auth.ts              # Auth hook
│   ├── auth.ts                  # Auth utilities
│   └── [other utilities]
├── styles/
│   └── globals.css              # Global styles
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── .env.example                 # Environment template
├── tailwind.config.js           # Tailwind configuration
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies

Backend:
├── main.py                      # FastAPI app
├── requirements.txt             # Python dependencies
├── routes/                      # API routes
│   ├── auth.py                 # Auth endpoints
│   ├── tasks.py                # Task endpoints
│   └── users.py                # User endpoints
├── models/                      # Database models
│   ├── task.py                 # Task model
│   ├── user.py                 # User model
│   └── [other models]
├── middleware/                  # Middleware
│   └── auth.py                 # JWT middleware
├── .env                         # Environment variables
└── [other files]
```

---

## Common Development Tasks

### Adding a New Page
```typescript
// app/new-page/page.tsx
import Header from '@/components/Header';

export default function NewPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Your content */}
      </main>
    </div>
  );
}
```

### Adding a New Component
```typescript
// components/NewComponent.tsx
interface NewComponentProps {
  title: string;
  onAction: (value: string) => void;
}

export default function NewComponent({ title, onAction }: NewComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {/* Component content */}
    </div>
  );
}
```

### Adding API Functionality
```typescript
// In lib/api.ts, add to the api object:
async getNewFeature(): Promise<NewFeatureResponse> {
  return api.get<NewFeatureResponse>('/api/new-feature');
},
```

### Using Authentication
```typescript
// In client components
'use client';
import { useAuth } from '@/lib/use-auth';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return <div>Welcome, {user?.name}</div>;
}
```

### Making API Calls
```typescript
'use client';
import { api } from '@/lib/api';

export default function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/api/endpoint')
      .then(setData)
      .catch(err => console.error(err));
  }, []);

  return <div>{/* Use data */}</div>;
}
```

### Using Tailwind Classes
```tsx
// Mobile-first responsive design
<div className="
  w-full p-4           // Mobile
  md:w-1/2 md:p-6     // Tablet
  lg:w-1/3 lg:p-8     // Desktop
  flex items-center justify-between
  bg-white rounded-lg shadow-md
  hover:shadow-lg transition-shadow
">
  Content
</div>

// Dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

// Responsive grid
<div className="
  grid grid-cols-1        // Mobile: 1 column
  md:grid-cols-2         // Tablet: 2 columns
  lg:grid-cols-3         // Desktop: 3 columns
  gap-4
">
```

---

## Testing During Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
npm run lint -- --fix  # Auto-fix issues
```

### Manual Testing
Use the [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for comprehensive testing.

### DevTools Debugging
1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for API calls
4. Check Application tab for localStorage
5. Check Elements tab for HTML structure

---

## Common Issues & Troubleshooting

### Issue: "useAuth must be used inside AuthProvider"
**Cause**: Using useAuth hook outside of AuthProvider
**Solution**: Ensure AuthProvider wraps your component in layout.tsx

### Issue: API calls returning 401 Unauthorized
**Cause**: Token is missing or invalid
**Solution**:
- Check localStorage for 'auth-token'
- Check API endpoint expects Bearer token
- Try logging in again

### Issue: Component rendering blank after login
**Cause**: Hydration mismatch
**Solution**:
- Use ProtectedRoute wrapper for protected pages
- Wait for useAuth to load in useEffect

### Issue: Styling not applying
**Cause**: Tailwind not processing classes
**Solution**:
- Check class name is in content paths in tailwind.config.js
- Verify Tailwind directives in globals.css
- Check for typos in class names

### Issue: Build failing with TypeScript errors
**Cause**: Type mismatches
**Solution**:
- Check return types of functions
- Verify prop types match usage
- Use `any` only if necessary

### Issue: Environment variables not working
**Cause**: Wrong file or format
**Solution**:
- Use NEXT_PUBLIC_ prefix for client-side vars
- Restart dev server after .env changes
- Check .env.local syntax (no spaces)

---

## Git Workflow

### Making a Commit
```bash
# Check status
git status

# Stage changes
git add .

# Commit with message
git commit -m "feat: describe your change"

# Push to remote
git push
```

### Commit Message Format
```
<type>: <description>

<optional body>

<optional footer>
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Examples**:
```
feat: add user profile page
fix: resolve auth token expiration issue
docs: update README with setup instructions
refactor: optimize task list component
```

---

## Environment Variables

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.production.com
```

**Note**: Only variables with `NEXT_PUBLIC_` prefix are available in browser.

---

## Performance Tips

### Component Optimization
```typescript
// Memoize expensive components
import { memo } from 'react';

const TaskItem = memo(function TaskItem({ task }) {
  return <div>{task.title}</div>;
});

export default TaskItem;
```

### Data Fetching
```typescript
// Use useEffect for side effects
useEffect(() => {
  const fetchData = async () => {
    const data = await api.getTasks();
    setTasks(data.tasks);
  };

  fetchData();
}, []);  // Add dependencies
```

### Lazy Loading
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { loading: () => <div>Loading...</div> }
);
```

---

## Code Style Guidelines

### Naming Conventions
- Components: PascalCase (Header, TaskList)
- Functions: camelCase (getTasks, handleSubmit)
- Constants: UPPER_SNAKE_CASE (API_BASE_URL)
- Files: Match content (TaskItem.tsx, api.ts)

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { api } from '@/lib/api';

// 2. Props interface
interface MyComponentProps {
  title: string;
  onSubmit: (value: string) => void;
}

// 3. Component function
export default function MyComponent({ title, onSubmit }: MyComponentProps) {
  // State hooks
  const [value, setValue] = useState('');

  // Effects
  useEffect(() => {
    // Setup
  }, []);

  // Event handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  // Render
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
}
```

### Always Include Type Annotations
```typescript
// ❌ Bad
function getValue() {
  return 42;
}

// ✅ Good
function getValue(): number {
  return 42;
}
```

---

## Useful npm Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm start            # Run production build
npm run lint         # Check code style
npm run type-check   # Check TypeScript

# Database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run with coverage report
```

---

## Debugging Tips

### Browser Console
```javascript
// Check authentication
localStorage.getItem('auth-token')
localStorage.getItem('user')

// Check API
fetch('http://localhost:8000/api/health')
  .then(r => r.json())
  .then(console.log)
```

### VS Code Extensions
- **ES7+ React Snippets** - Quick component generation
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **Tailwind CSS IntelliSense** - CSS completion
- **Thunder Client** - API testing

### React DevTools
- Inspect component props
- Track component re-renders
- Check context values

---

## Production Checklist

Before deploying:
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] TypeScript errors resolved
- [ ] Environment variables configured
- [ ] Sensitive data removed from code
- [ ] API URLs updated for production
- [ ] Build completes without errors
- [ ] Performance acceptable
- [ ] Security audit complete
- [ ] Documentation updated

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org)

---

## Support

For questions or issues:
1. Check the [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
2. Review [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)
3. Check frontend and backend CLAUDE.md files
4. Review relevant documentation links above

