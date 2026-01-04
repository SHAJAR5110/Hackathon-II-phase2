# Specification: UI Components & Pages

**Created**: 2026-01-04
**Status**: Draft
**Technology**: Next.js 16+, React 19+, TypeScript, Tailwind CSS 3+

## Overview

Phase II frontend consists of authentication pages (signup/signin) and the main task dashboard. All components use:

- **Server Components by default** (Next.js 16+ App Router)
- **Client Components only when needed** (interactivity, state management)
- **Tailwind CSS** for styling (utility-first, no inline styles)
- **TypeScript** for type safety
- **Responsive Design** (mobile-first, supports iOS, Android, tablet, desktop)

## Pages & Routes

### Page: Home / Dashboard (`/`)

**Purpose**: Display authenticated user's task list or redirect to login if not authenticated.

**Route**: `/` (root path)

**Access**: Protected (redirect to `/auth/signin` if not authenticated)

**Components Used**:
- `<TaskList>` - Displays user's tasks
- `<TaskForm>` - Create new task
- `<Header>` - Navigation and logout button

**Functionality**:

1. **Dashboard Display** (when authenticated)
   - Show list of user's tasks (pending + completed)
   - Display task count
   - Show empty state if no tasks exist
   - Allow filtering by status (all/pending/completed) - Phase III+

2. **Create Task**
   - Form to add new task
   - Title field (required, 1-200 chars)
   - Description field (optional, max 1000 chars)
   - Submit button
   - Success message / error handling

3. **Header**
   - App logo/title
   - Logout button
   - User's email (optional)

**Responsive Behavior**:
- Mobile: Full-width layout, single column
- Tablet: Two-column (task form left, list right)
- Desktop: Similar to tablet with better spacing

---

### Page: Signup (`/auth/signup`)

**Purpose**: Allow new users to create an account.

**Route**: `/auth/signup`

**Access**: Public (redirect to `/` if already authenticated)

**Components Used**:
- `<SignupForm>` - Registration form
- `<AuthLayout>` - Centered auth page layout

**Form Fields**:

1. **Name** (text input)
   - Placeholder: "Full Name"
   - Required
   - Max 255 characters

2. **Email** (email input)
   - Placeholder: "you@example.com"
   - Required
   - Email validation (RFC 5322)
   - Error: "Email is invalid"
   - Error: "Email already registered"

3. **Password** (password input)
   - Placeholder: "At least 8 characters"
   - Required
   - Min 8 characters
   - Error: "Password must be at least 8 characters"
   - Show/hide toggle (optional)

4. **Sign Up Button** (primary button)
   - Text: "Create Account"
   - Disabled while submitting
   - Shows loading spinner

**Validation**:
- Real-time client-side validation
- Server-side validation on submit
- Clear error messages below each field

**Links**:
- "Already have an account? Sign in" → `/auth/signin`

**Responsive Behavior**:
- Mobile: Full-screen form, centered
- Desktop: Centered card (max 400px wide)

---

### Page: Signin (`/auth/signin`)

**Purpose**: Allow existing users to log in.

**Route**: `/auth/signin`

**Access**: Public (redirect to `/` if already authenticated)

**Components Used**:
- `<SigninForm>` - Login form
- `<AuthLayout>` - Centered auth page layout

**Form Fields**:

1. **Email** (email input)
   - Placeholder: "you@example.com"
   - Required
   - Error: "Invalid email or password"

2. **Password** (password input)
   - Placeholder: "Enter your password"
   - Required
   - Show/hide toggle (optional)
   - Error: "Invalid email or password"

3. **Sign In Button** (primary button)
   - Text: "Sign In"
   - Disabled while submitting
   - Shows loading spinner

**Links**:
- "Don't have an account? Sign up" → `/auth/signup`
- "Forgot password?" → (Phase III+, grayed out)

**Responsive Behavior**:
- Mobile: Full-screen form, centered
- Desktop: Centered card (max 400px wide)

---

## Components (Reusable)

### Component: TaskList

**Purpose**: Display a list of tasks with options to edit, delete, and mark complete.

**Props**:

```typescript
interface TaskListProps {
  tasks: Task[];
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  isLoading?: boolean;
}
```

**State**: None (receives tasks via props)

**Features**:

1. **Empty State**
   - Message: "No tasks yet. Create one to get started!"
   - Icon: Checkmark or task icon
   - Visible when `tasks.length === 0`

2. **Task Items**
   - Display each task with `<TaskItem>` component
   - Ordered by created_at (newest first)
   - Checkbox to toggle completion status
   - Title and description (if present)
   - Edit and delete buttons
   - Visual distinction for completed tasks (strikethrough, opacity)

3. **Loading State**
   - Show skeleton loaders while `isLoading === true`
   - Animate placeholder bars

**Responsive Behavior**:
- Mobile: Single column, full width
- Tablet/Desktop: Single column, max 600px

---

### Component: TaskItem

**Purpose**: Display a single task with actions (edit, delete, toggle complete).

**Props**:

```typescript
interface TaskItemProps {
  task: Task;
  onComplete?: (taskId: number, completed: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  isLoading?: boolean;
}
```

**Features**:

1. **Checkbox** (toggle completion)
   - Checkmark when completed
   - Click to toggle status
   - Disabled while `isLoading === true`

2. **Task Content**
   - Title (bold, clickable for edit)
   - Description (if present, gray text)
   - Timestamps (created_at, optionally updated_at)

3. **Action Buttons**
   - Edit (pencil icon, triggers edit modal or inline edit)
   - Delete (trash icon, triggers confirmation modal)
   - Buttons disabled while `isLoading === true`

4. **Visual States**
   - **Pending**: Normal appearance
   - **Completed**: Strikethrough title, reduced opacity
   - **Loading**: Skeleton or spinner overlay

**Responsive Behavior**:
- Mobile: Full width, smaller buttons
- Desktop: Full width, side-by-side buttons

---

### Component: TaskForm

**Purpose**: Form to create or edit a task.

**Props**:

```typescript
interface TaskFormProps {
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
  initialValues?: Task;
  isLoading?: boolean;
  onCancel?: () => void;
}
```

**Features**:

1. **Title Input** (text)
   - Placeholder: "What needs to be done?"
   - Required
   - Max length indicator: "X / 200"
   - Error messages (required, too long)

2. **Description Input** (textarea)
   - Placeholder: "Add more details..."
   - Optional
   - Max length indicator: "X / 1000"
   - Error messages (too long)

3. **Buttons**
   - **Submit Button** (primary): "Create Task" or "Update Task"
   - **Cancel Button** (secondary): "Cancel" (if editing)
   - Both disabled while `isLoading === true`

4. **Error Handling**
   - Display field-level errors below inputs
   - Display form-level errors above form
   - Auto-dismiss success messages

**Responsive Behavior**:
- Mobile: Full width inputs
- Desktop: Similar, max 500px wide

---

### Component: SignupForm

**Purpose**: Form for user registration.

**Props**:

```typescript
interface SignupFormProps {
  onSubmit: (data: SignupRequest) => Promise<void>;
  isLoading?: boolean;
}
```

**Form Fields** (see signup page above)

**Features**:
- Real-time validation feedback
- Password strength indicator (optional)
- "Sign up with Google" button (Phase III+, grayed out)
- Link to signin page

---

### Component: SigninForm

**Purpose**: Form for user login.

**Props**:

```typescript
interface SigninFormProps {
  onSubmit: (data: SigninRequest) => Promise<void>;
  isLoading?: boolean;
}
```

**Form Fields** (see signin page above)

**Features**:
- Email and password inputs
- "Remember me" checkbox (Phase III+, optional)
- Link to signup page
- Forgotten password link (Phase III+, grayed out)

---

### Component: Header

**Purpose**: Navigation bar with user info and logout.

**Props**:

```typescript
interface HeaderProps {
  user?: { email: string; name: string };
  onLogout?: () => void;
}
```

**Features**:

1. **Logo / Title**
   - App name: "Todo App" or similar
   - Clickable home link

2. **User Info** (if authenticated)
   - Display user's email or name
   - Dropdown menu (optional) with logout option

3. **Logout Button**
   - Text: "Logout" or "Sign Out"
   - Triggers logout confirmation
   - Redirects to signin after logout

**Responsive Behavior**:
- Mobile: Hamburger menu for user menu
- Desktop: Inline user info + logout button

---

### Component: AuthLayout

**Purpose**: Centered layout for authentication pages (signup/signin).

**Props**:

```typescript
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}
```

**Features**:

1. **Centered Card**
   - Max width: 400px
   - Padding: 2rem
   - White background, subtle shadow
   - Border radius: 8px

2. **Title & Subtitle**
   - H1 for title
   - Smaller text for subtitle
   - Centered alignment

3. **Form Content**
   - Children component (form) inside card

**Responsive Behavior**:
- Mobile: Full-screen, no card (edges-to-edges)
- Desktop: Centered card with margins

---

## Styling & Design System

### Tailwind CSS Classes

**Colors**:
- **Primary**: Blue (for buttons, links)
- **Secondary**: Gray (for text, borders)
- **Danger**: Red (for delete buttons, errors)
- **Success**: Green (for success messages)
- **Background**: White or off-white
- **Text**: Dark gray/charcoal

**Spacing**:
- **Base unit**: 4px (Tailwind default)
- **Padding**: `p-4` (1rem) for sections, `p-2` for inline
- **Margin**: `m-4` between major sections
- **Gap**: `gap-4` for flex/grid spacing

**Typography**:
- **Headings**: Bold, 1.5rem-2rem (H1), 1.25rem (H2), 1rem (H3)
- **Body text**: 0.95rem, line-height 1.6
- **Labels**: 0.875rem, medium weight

**Buttons**:
- **Primary**: Blue background, white text, padding `px-4 py-2`
- **Secondary**: Gray background, dark text
- **Danger**: Red background, white text
- **Disabled**: Reduced opacity, not-allowed cursor
- **Hover**: Darker shade
- **Active**: Darker shade, faster transition

**Form Inputs**:
- **Border**: 1px solid gray
- **Padding**: `px-3 py-2`
- **Border radius**: 4px
- **Focus**: Blue border, subtle shadow
- **Error**: Red border, red helper text

**Icons**:
- Use Lucide React for consistency
- Size: `24px` (1.5rem) by default
- Color: Inherit from parent or secondary color

### Responsive Breakpoints

- **Mobile**: `max-w-md` (< 640px)
- **Tablet**: `md:` breakpoint (640px - 1024px)
- **Desktop**: `lg:` breakpoint (> 1024px)

### Dark Mode (Optional, Phase III+)

- Not required for MVP
- Can be added with Tailwind's dark mode support
- User preference stored in localStorage

---

## Accessibility Requirements

### Keyboard Navigation

- All buttons and links must be keyboard accessible (tab key)
- Tab order should follow visual flow (left-to-right, top-to-bottom)
- No keyboard traps

### ARIA Labels

- Form inputs have associated labels (`<label htmlFor="...">`)
- Buttons have descriptive text or aria-labels
- Error messages linked to inputs via `aria-describedby`
- Lists use semantic `<ul>` or `<ol>` with `<li>` items

### Visual Indicators

- Focus outlines visible (blue outline or similar)
- Color not the only indicator (use icons + text)
- Sufficient contrast ratio (WCAG AA: 4.5:1 for normal text)

### Screen Reader Support

- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Skip-to-content link (optional)
- Form validation messages announced

---

## Out of Scope (Phase III+)

- Dark mode toggle
- Task categories/tags UI
- Advanced search/filter UI
- Task drag-and-drop
- Collaborative editing UI
- Social sharing
- PWA (offline support)
- Image/file upload UI
