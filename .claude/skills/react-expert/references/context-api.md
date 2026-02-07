# Context API - Patterns & Best Practices

## Basic Context Setup

### Simple Context Pattern

```typescript
// contexts/ThemeContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

// Create context with undefined default (enforces provider usage)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook for consuming context
export function useTheme() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  
  return context
}
```

**Usage:**
```typescript
// App.tsx
function App() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  )
}

// components/ThemeToggle.tsx
import { useTheme } from '@/contexts/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  )
}
```

## Advanced Context with Reducer

### Authentication Context

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  loading: boolean
  error: Error | null
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: Error }
  | { type: 'LOGOUT' }

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, error: null }
    
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload }
    
    case 'LOGOUT':
      return { user: null, loading: false, error: null }
    
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: false,
    error: null
  })
  
  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      dispatch({ type: 'LOGIN_START' })
      
      try {
        const response = await fetch('/api/auth/me')
        
        if (response.ok) {
          const user = await response.json()
          dispatch({ type: 'LOGIN_SUCCESS', payload: user })
        } else {
          dispatch({ type: 'LOGOUT' })
        }
      } catch (error) {
        dispatch({ type: 'LOGIN_ERROR', payload: error as Error })
      }
    }
    
    checkAuth()
  }, [])
  
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' })
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        throw new Error('Login failed')
      }
      
      const user = await response.json()
      dispatch({ type: 'LOGIN_SUCCESS', payload: user })
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error as Error })
      throw error
    }
  }
  
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    dispatch({ type: 'LOGOUT' })
  }
  
  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  
  return context
}
```

## Performance Optimization - Split Contexts

### ❌ Anti-Pattern: Single Context for Everything

```typescript
// ❌ BAD - All consumers re-render on any state change
interface AppContextType {
  user: User
  theme: Theme
  notifications: Notification[]
  settings: Settings
  // ... 20 more properties
}

function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppContextType>(initialState)
  
  // Any state change re-renders ALL consumers
  return (
    <AppContext.Provider value={state}>
      {children}
    </AppContext.Provider>
  )
}
```

### ✅ Good Pattern: Split into Multiple Contexts

```typescript
// ✅ GOOD - Separate concerns, granular re-renders

// contexts/UserContext.tsx
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

// contexts/ThemeContext.tsx
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// contexts/NotificationContext.tsx
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

// App.tsx - Compose providers
function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <NotificationProvider>
          <Layout />
        </NotificationProvider>
      </ThemeProvider>
    </UserProvider>
  )
}
```

## Performance - Memoize Context Value

### ❌ Anti-Pattern: Creating New Object on Every Render

```typescript
// ❌ BAD - New object reference on every render
function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  
  // This creates a new object every render!
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}
```

### ✅ Good Pattern: useMemo for Context Value

```typescript
// ✅ GOOD - Stable reference unless dependencies change
import { useMemo } from 'react'

function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  
  // Only create new object when user or setUser changes
  const value = useMemo(() => ({ user, setUser }), [user])
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
```

## Split State and Dispatch Contexts

### ✅ Advanced Pattern: Separate State and Actions

```typescript
// contexts/TodoContext.tsx
import { createContext, useContext, useReducer, useMemo, ReactNode } from 'react'

interface Todo {
  id: string
  text: string
  completed: boolean
}

interface TodoState {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
}

type TodoAction =
  | { type: 'ADD_TODO'; text: string }
  | { type: 'TOGGLE_TODO'; id: string }
  | { type: 'DELETE_TODO'; id: string }
  | { type: 'SET_FILTER'; filter: TodoState['filter'] }

// Separate contexts for state and dispatch
const TodoStateContext = createContext<TodoState | undefined>(undefined)
const TodoDispatchContext = createContext<React.Dispatch<TodoAction> | undefined>(undefined)

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: Date.now().toString(), text: action.text, completed: false }
        ]
      }
    
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
        )
      }
    
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.id)
      }
    
    case 'SET_FILTER':
      return { ...state, filter: action.filter }
    
    default:
      return state
  }
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all'
  })
  
  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  )
}

// Hook for state (consumers re-render when state changes)
export function useTodoState() {
  const context = useContext(TodoStateContext)
  if (context === undefined) {
    throw new Error('useTodoState must be used within TodoProvider')
  }
  return context
}

// Hook for dispatch (stable reference, won't cause re-renders)
export function useTodoDispatch() {
  const context = useContext(TodoDispatchContext)
  if (context === undefined) {
    throw new Error('useTodoDispatch must be used within TodoProvider')
  }
  return context
}
```

**Usage:**
```typescript
// Component only needs state - re-renders on state change
function TodoList() {
  const { todos, filter } = useTodoState()
  
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })
  
  return (
    <ul>
      {filteredTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}

// Component only needs dispatch - won't re-render on state changes!
function AddTodo() {
  const dispatch = useTodoDispatch()
  const [text, setText] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      dispatch({ type: 'ADD_TODO', text })
      setText('')
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add todo..."
      />
      <button type="submit">Add</button>
    </form>
  )
}
```

## Selector Pattern - Prevent Unnecessary Re-renders

```typescript
// contexts/CartContext.tsx
import { createContext, useContext, useState, useMemo, ReactNode } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  // Selectors
  selectItemCount: () => number
  selectTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  
  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      
      return [...prev, { ...item, quantity: 1 }]
    })
  }
  
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }
  
  // Memoized selectors
  const value = useMemo(() => ({
    items,
    addItem,
    removeItem,
    selectItemCount: () => items.reduce((sum, item) => sum + item.quantity, 0),
    selectTotal: () => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }), [items])
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider')
  }
  
  return context
}

// Usage with selector
function CartBadge() {
  const { selectItemCount } = useCart()
  const count = selectItemCount()
  
  return <span className="badge">{count}</span>
}

function CartTotal() {
  const { selectTotal } = useCart()
  const total = selectTotal()
  
  return <div>Total: ${total.toFixed(2)}</div>
}
```

## Composition Pattern - Provider Wrapper

```typescript
// contexts/AppProviders.tsx
import { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { ThemeProvider } from './ThemeContext'
import { CartProvider } from './CartContext'
import { NotificationProvider } from './NotificationContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

// App.tsx - Clean and simple
import { AppProviders } from '@/contexts/AppProviders'

function App() {
  return (
    <AppProviders>
      <Layout />
    </AppProviders>
  )
}
```

## Context with Local Storage Sync

```typescript
// contexts/PreferencesContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Preferences {
  theme: 'light' | 'dark'
  language: string
  notifications: boolean
}

interface PreferencesContextType {
  preferences: Preferences
  updatePreferences: (updates: Partial<Preferences>) => void
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

const defaultPreferences: Preferences = {
  theme: 'light',
  language: 'en',
  notifications: true
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    // Initialize from localStorage
    if (typeof window === 'undefined') return defaultPreferences
    
    try {
      const stored = localStorage.getItem('preferences')
      return stored ? JSON.parse(stored) : defaultPreferences
    } catch {
      return defaultPreferences
    }
  })
  
  // Sync to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('preferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }, [preferences])
  
  const updatePreferences = (updates: Partial<Preferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }
  
  const value = useMemo(
    () => ({ preferences, updatePreferences }),
    [preferences]
  )
  
  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  
  if (context === undefined) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  
  return context
}
```

## Best Practices Summary

✅ **DO:**
- Create custom hooks for consuming context
- Split contexts by domain/feature
- Memoize context values
- Separate state and dispatch contexts
- Use selectors to prevent unnecessary re-renders
- Throw errors when context is used outside provider

❌ **DON'T:**
- Put everything in one context
- Create new objects in render for context value
- Use context for high-frequency updates
- Forget to memoize context value
- Use context when props would be simpler

**Performance Tips:**
1. Split contexts to minimize re-renders
2. Use `useMemo` for context value
3. Separate state and dispatch contexts
4. Consider using libraries like Zustand or Jotai for complex state
5. Profile with React DevTools to identify bottlenecks