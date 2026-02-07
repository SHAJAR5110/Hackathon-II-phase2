# React Hooks Patterns & Anti-Patterns

## useState - State Management

### ✅ Good Patterns

**Functional Updates**
```typescript
// When new state depends on previous state
const [count, setCount] = useState(0)

// ✅ Use functional update
const increment = () => setCount(prev => prev + 1)

// ❌ Avoid direct reference (can be stale)
const incrementBad = () => setCount(count + 1)
```

**Object State Updates**
```typescript
interface User {
  name: string
  email: string
  age: number
}

const [user, setUser] = useState<User>({
  name: '',
  email: '',
  age: 0
})

// ✅ Spread previous state
const updateEmail = (email: string) => {
  setUser(prev => ({ ...prev, email }))
}

// ❌ Don't mutate state directly
const updateEmailBad = (email: string) => {
  user.email = email // WRONG
  setUser(user)
}
```

**Lazy Initialization**
```typescript
// ✅ For expensive initial state
const [data, setData] = useState(() => {
  const stored = localStorage.getItem('data')
  return stored ? JSON.parse(stored) : []
})

// ❌ Runs on every render
const [dataBad, setDataBad] = useState(
  localStorage.getItem('data') 
    ? JSON.parse(localStorage.getItem('data')!) 
    : []
)
```

### ❌ Anti-Patterns

**Derived State**
```typescript
// ❌ Don't store derived state
const [items, setItems] = useState<Item[]>([])
const [itemCount, setItemCount] = useState(0) // Unnecessary!

// ✅ Calculate during render or use useMemo
const [items, setItems] = useState<Item[]>([])
const itemCount = items.length
```

**State for Values Already Available**
```typescript
// ❌ Don't duplicate props in state
function UserCard({ user }: { user: User }) {
  const [currentUser, setCurrentUser] = useState(user) // Unnecessary
  return <div>{currentUser.name}</div>
}

// ✅ Use props directly
function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>
}
```

## useEffect - Side Effects

### ✅ Good Patterns

**Data Fetching**
```typescript
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    let cancelled = false
    
    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) throw new Error('Failed to fetch')
        
        const data = await response.json()
        
        // Prevent state update if component unmounted
        if (!cancelled) {
          setUser(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    fetchUser()
    
    // Cleanup function
    return () => {
      cancelled = true
    }
  }, [userId]) // Re-run when userId changes
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!user) return <div>No user found</div>
  
  return <div>{user.name}</div>
}
```

**Event Listeners**
```typescript
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    window.addEventListener('resize', handleResize)
    
    // ✅ Always cleanup event listeners
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, []) // Empty deps = runs once
  
  return <div>Window: {size.width} x {size.height}</div>
}
```

**Subscriptions**
```typescript
function ChatMessages({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  
  useEffect(() => {
    const subscription = subscribeToChat(chatId, (newMessage) => {
      setMessages(prev => [...prev, newMessage])
    })
    
    // ✅ Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [chatId])
  
  return <div>{/* Render messages */}</div>
}
```

### ❌ Anti-Patterns

**Missing Dependencies**
```typescript
// ❌ Missing dependency - stale closure
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([])
  
  useEffect(() => {
    fetchResults(query).then(setResults)
  }, []) // Missing 'query' dependency!
  
  return <div>{/* ... */}</div>
}

// ✅ Include all dependencies
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([])
  
  useEffect(() => {
    fetchResults(query).then(setResults)
  }, [query]) // Correct
  
  return <div>{/* ... */}</div>
}
```

**Setting State in Render**
```typescript
// ❌ Side effect in render
function Component({ data }: { data: any }) {
  const [processed, setProcessed] = useState([])
  
  // WRONG - causes infinite loop!
  setProcessed(processData(data))
  
  return <div>{/* ... */}</div>
}

// ✅ Use useEffect or useMemo
function Component({ data }: { data: any }) {
  const processed = useMemo(() => processData(data), [data])
  return <div>{/* ... */}</div>
}
```

## useMemo - Expensive Calculations

### ✅ When to Use

```typescript
// ✅ Expensive calculation
const expensiveValue = useMemo(() => {
  return items
    .filter(item => item.active)
    .map(item => item.price * item.quantity)
    .reduce((sum, price) => sum + price, 0)
}, [items])

// ✅ Object/array in dependencies
const filters = useMemo(() => ({
  category: 'electronics',
  maxPrice: 1000
}), []) // Stable reference

// ✅ Avoid re-computation in child component
function Parent() {
  const config = useMemo(() => ({
    theme: 'dark',
    locale: 'en'
  }), [])
  
  return <Child config={config} />
}
```

### ❌ When NOT to Use

```typescript
// ❌ Simple calculation (overhead not worth it)
const sum = useMemo(() => a + b, [a, b]) // Overkill

// ✅ Just calculate directly
const sum = a + b

// ❌ Primitive values (already stable)
const isValid = useMemo(() => email.includes('@'), [email]) // Unnecessary

// ✅ Calculate in render
const isValid = email.includes('@')
```

## useCallback - Memoized Functions

### ✅ When to Use

```typescript
// ✅ Function passed to memoized child
const Parent = () => {
  const [count, setCount] = useState(0)
  
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id)
    setCount(prev => prev + 1)
  }, []) // Stable reference
  
  return <MemoizedChild onClick={handleClick} />
}

// ✅ Function in useEffect dependencies
function Component({ userId }: { userId: string }) {
  const fetchUser = useCallback(async () => {
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  }, [userId])
  
  useEffect(() => {
    fetchUser().then(setUser)
  }, [fetchUser]) // Won't change unless userId changes
}
```

### ❌ When NOT to Use

```typescript
// ❌ Function not passed as prop or dependency
const handleClick = useCallback(() => {
  console.log('Clicked')
}, []) // Unnecessary if not passed anywhere

// ✅ Just use regular function
const handleClick = () => {
  console.log('Clicked')
}

// ❌ Function with many dependencies (defeats purpose)
const complexFunction = useCallback(() => {
  // Uses a, b, c, d, e, f, g...
}, [a, b, c, d, e, f, g]) // Will re-create often anyway

// ✅ Consider restructuring or just use regular function
```

## useReducer - Complex State

### ✅ When to Use

```typescript
type State = {
  data: User[]
  loading: boolean
  error: Error | null
  filters: {
    search: string
    category: string
  }
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: User[] }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }

const initialState: State = {
  data: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    category: 'all'
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload }
    
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload }
    
    case 'SET_SEARCH':
      return {
        ...state,
        filters: { ...state.filters, search: action.payload }
      }
    
    case 'SET_CATEGORY':
      return {
        ...state,
        filters: { ...state.filters, category: action.payload }
      }
    
    default:
      return state
  }
}

function UserList() {
  const [state, dispatch] = useReducer(reducer, initialState)
  
  useEffect(() => {
    dispatch({ type: 'FETCH_START' })
    
    fetchUsers()
      .then(data => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
      .catch(error => dispatch({ type: 'FETCH_ERROR', payload: error }))
  }, [])
  
  return (
    <div>
      <input
        value={state.filters.search}
        onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
      />
      {/* ... */}
    </div>
  )
}
```

## useRef - Persistent Values & DOM Access

### ✅ Good Patterns

**DOM Access**
```typescript
function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    // ✅ Focus input on mount
    inputRef.current?.focus()
  }, [])
  
  return <input ref={inputRef} />
}
```

**Storing Mutable Values (doesn't trigger re-render)**
```typescript
function Timer() {
  const [count, setCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const start = () => {
    if (intervalRef.current) return
    
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
  }
  
  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }
  
  useEffect(() => {
    return () => stop() // Cleanup
  }, [])
  
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  )
}
```

**Previous Value**
```typescript
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}

// Usage
function Component({ count }: { count: number }) {
  const prevCount = usePrevious(count)
  
  return (
    <div>
      Current: {count}, Previous: {prevCount}
    </div>
  )
}
```

## Custom Hooks - Reusable Logic

### ✅ Best Practices

**useLocalStorage**
```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return initialValue
    }
  })
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }
  
  return [storedValue, setValue] as const
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme: {theme}
    </button>
  )
}
```

**useDebounce**
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Usage
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  
  useEffect(() => {
    if (debouncedSearch) {
      // API call only after 500ms of no typing
      fetchResults(debouncedSearch)
    }
  }, [debouncedSearch])
  
  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

**useFetch**
```typescript
interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const json = await response.json()
      setData(json)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [url])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  return { data, loading, error, refetch: fetchData }
}

// Usage
function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error, refetch } = useFetch<User>(`/api/users/${userId}`)
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return <div>No data</div>
  
  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}
```

## Performance Optimization Summary

**Quick Reference Guide:**

| Hook | When to Use | When to Skip |
|------|-------------|--------------|
| `React.memo` | Expensive component that receives props | Simple components, components that always change |
| `useMemo` | Expensive calculations, object/array deps | Simple calculations, primitive values |
| `useCallback` | Functions passed to memoized children | Functions not passed as props |
| `useReducer` | Complex state with multiple sub-values | Simple state with 1-2 values |

**Golden Rules:**
1. Don't optimize prematurely - measure first
2. Fix dependency arrays before adding memoization
3. Memoization has overhead - use only when beneficial
4. Profile with React DevTools to find actual bottlenecks