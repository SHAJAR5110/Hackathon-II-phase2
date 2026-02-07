# Component Patterns - Server vs Client Components

## Decision Tree: Server or Client Component?

```
Does the component need:
├─ Interactivity (onClick, onChange, etc.)? → CLIENT
├─ React hooks (useState, useEffect, etc.)? → CLIENT
├─ Browser APIs (localStorage, window, etc.)? → CLIENT
├─ Event listeners? → CLIENT
├─ Context providers that use hooks? → CLIENT
│
├─ Data fetching from database? → SERVER
├─ Access to backend-only resources? → SERVER
├─ Sensitive operations (auth, payments)? → SERVER
├─ Large dependencies (stays on server)? → SERVER
└─ Static content? → SERVER (default)
```

## Server Components (Default in App Router)

### ✅ Use Server Components For:

**1. Data Fetching**
```typescript
// app/users/page.tsx
import { db } from "@/lib/db"

export default async function UsersPage() {
  // Direct database access (secure, server-side only)
  const users = await db.query("SELECT id, name, email FROM users")
  
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

**2. Backend Resource Access**
```typescript
// app/profile/page.tsx
import { getServerSession } from "next-auth"

export default async function ProfilePage() {
  // Server-only authentication
  const session = await getServerSession()
  
  // Direct file system access
  const content = await fs.readFile("private/data.json", "utf-8")
  
  return <div>{content}</div>
}
```

**3. Sensitive Operations**
```typescript
// app/checkout/page.tsx
export default async function CheckoutPage() {
  // API keys stay on server, never exposed to browser
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: "usd"
  })
  
  return <CheckoutForm clientSecret={paymentIntent.client_secret} />
}
```

**4. Reducing Client Bundle**
```typescript
// Heavy dependencies stay on server
import { marked } from "marked"
import { readFile } from "fs/promises"

export default async function BlogPost() {
  const content = await readFile("posts/blog.md", "utf-8")
  const html = marked(content) // Large library runs on server only
  
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

### Server Component Example: Dashboard
```typescript
// app/dashboard/page.tsx
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export default async function Dashboard() {
  // All this runs on server
  const user = await getCurrentUser()
  const stats = await db.query(`
    SELECT COUNT(*) as total_orders,
           SUM(amount) as revenue
    FROM orders
    WHERE user_id = ?
  `, [user.id])
  
  const recentOrders = await db.query(`
    SELECT * FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 5
  `, [user.id])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <StatsCard title="Total Orders" value={stats.total_orders} />
        <StatsCard title="Revenue" value={`$${stats.revenue}`} />
      </div>
      
      <RecentOrdersList orders={recentOrders} />
    </div>
  )
}

// StatsCard can also be a Server Component
function StatsCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
```

## Client Components (Mark with "use client")

### ✅ Use Client Components For:

**1. Interactivity**
```typescript
// components/toggle-button.tsx
"use client"

import { useState } from "react"

export function ToggleButton() {
  const [isOn, setIsOn] = useState(false)
  
  return (
    <button
      onClick={() => setIsOn(!isOn)}
      className={`px-4 py-2 rounded ${isOn ? "bg-blue-500" : "bg-gray-300"}`}
    >
      {isOn ? "On" : "Off"}
    </button>
  )
}
```

**2. React Hooks**
```typescript
// components/timer.tsx
"use client"

import { useState, useEffect } from "react"

export function Timer() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return <div>Time elapsed: {count}s</div>
}
```

**3. Browser APIs**
```typescript
// components/theme-toggle.tsx
"use client"

import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  
  useEffect(() => {
    // Access localStorage (browser only)
    const saved = localStorage.getItem("theme") as "light" | "dark"
    if (saved) setTheme(saved)
  }, [])
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark")
  }
  
  return (
    <button onClick={toggleTheme}>
      Toggle {theme === "light" ? "Dark" : "Light"} Mode
    </button>
  )
}
```

**4. Event Listeners**
```typescript
// components/click-outside.tsx
"use client"

import { useRef, useEffect } from "react"

export function ClickOutside({ onClickOutside }: { onClickOutside: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside()
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClickOutside])
  
  return <div ref={ref}>Click outside to trigger</div>
}
```

### Client Component Example: Interactive Form
```typescript
// components/contact-form.tsx
"use client"

import { useState } from "react"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) throw new Error("Failed to submit")
      
      setStatus("success")
      setFormData({ name: "", email: "", message: "" })
    } catch (error) {
      setStatus("error")
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
        className="w-full px-4 py-2 border rounded"
        required
      />
      
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        className="w-full px-4 py-2 border rounded"
        required
      />
      
      <textarea
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="Message"
        className="w-full px-4 py-2 border rounded"
        rows={4}
        required
      />
      
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-6 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        {status === "loading" ? "Sending..." : "Send"}
      </button>
      
      {status === "success" && (
        <p className="text-green-600">Message sent successfully!</p>
      )}
      
      {status === "error" && (
        <p className="text-red-600">Failed to send message. Try again.</p>
      )}
    </form>
  )
}
```

## Composition: Server + Client Together

### Pattern 1: Client Wrapper Around Server Content
```typescript
// app/page.tsx (Server Component)
import { db } from "@/lib/db"
import { ClientWrapper } from "@/components/client-wrapper"

export default async function Page() {
  const data = await db.query("SELECT * FROM items")
  
  // Pass server data to client component
  return <ClientWrapper data={data} />
}

// components/client-wrapper.tsx (Client Component)
"use client"

import { useState } from "react"

export function ClientWrapper({ data }: { data: any[] }) {
  const [filter, setFilter] = useState("")
  
  const filtered = data.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  )
  
  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter..."
      />
      
      {filtered.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### Pattern 2: Client Component Inside Server Layout
```typescript
// app/layout.tsx (Server Component)
import { Navigation } from "@/components/navigation"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {/* Client component for interactivity */}
        <Navigation />
        
        {/* Server components for pages */}
        {children}
      </body>
    </html>
  )
}

// components/navigation.tsx (Client Component)
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

export function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav>
      <Link
        href="/"
        className={pathname === "/" ? "active" : ""}
      >
        Home
      </Link>
      <Link
        href="/about"
        className={pathname === "/about" ? "active" : ""}
      >
        About
      </Link>
    </nav>
  )
}
```

### Pattern 3: Split Interactive Parts Only
```typescript
// app/profile/page.tsx (Server Component)
import { db } from "@/lib/db"
import { EditButton } from "@/components/edit-button"

export default async function ProfilePage({ params }: { params: { id: string } }) {
  // Fetch data on server
  const user = await db.query(
    "SELECT id, name, email, bio FROM users WHERE id = ?",
    [params.id]
  )
  
  return (
    <div>
      {/* Static server-rendered content */}
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-gray-600">{user.email}</p>
      <p className="mt-4">{user.bio}</p>
      
      {/* Only the edit button needs client interactivity */}
      <EditButton userId={user.id} />
    </div>
  )
}

// components/edit-button.tsx (Client Component)
"use client"

import { useState } from "react"

export function EditButton({ userId }: { userId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  
  return (
    <button
      onClick={() => setIsEditing(!isEditing)}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
    >
      {isEditing ? "Cancel" : "Edit Profile"}
    </button>
  )
}
```

## Common Mistakes & Fixes

### ❌ Mistake 1: Client Component Accessing Database
```typescript
"use client"

import { db } from "@/lib/db" // ❌ Database not accessible in browser

export default function UserList() {
  const [users, setUsers] = useState([])
  
  useEffect(() => {
    const data = await db.query("SELECT * FROM users") // ❌ WILL FAIL
    setUsers(data)
  }, [])
  
  return <div>{/* ... */}</div>
}
```

### ✅ Fix: Fetch on Server, Pass to Client
```typescript
// app/users/page.tsx (Server Component)
import { db } from "@/lib/db"
import { UserList } from "@/components/user-list"

export default async function UsersPage() {
  const users = await db.query("SELECT * FROM users")
  return <UserList users={users} />
}

// components/user-list.tsx (Client Component)
"use client"

export function UserList({ users }: { users: User[] }) {
  const [filter, setFilter] = useState("")
  // ... client-side filtering logic
}
```

### ❌ Mistake 2: Server Component Using Hooks
```typescript
// app/page.tsx
export default function HomePage() {
  const [count, setCount] = useState(0) // ❌ Hooks not available in Server Components
  
  return <div>{count}</div>
}
```

### ✅ Fix: Mark as Client Component
```typescript
"use client"

export default function HomePage() {
  const [count, setCount] = useState(0) // ✅ Now works
  
  return <div>{count}</div>
}
```

### ❌ Mistake 3: Exposing Backend Data in Client Component
```typescript
"use client"

export function PaymentForm() {
  // ❌ CRITICAL: Stripe secret key exposed to browser!
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  
  return <form>{/* ... */}</form>
}
```

### ✅ Fix: Use API Route
```typescript
// app/api/create-payment/route.ts (Server-side)
export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY) // ✅ Secure
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: "usd"
  })
  
  return Response.json({ clientSecret: paymentIntent.client_secret })
}

// components/payment-form.tsx (Client Component)
"use client"

export function PaymentForm() {
  const [clientSecret, setClientSecret] = useState("")
  
  useEffect(() => {
    fetch("/api/create-payment", { method: "POST" })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret))
  }, [])
  
  return <form>{/* Use clientSecret with Stripe Elements */}</form>
}
```

## Best Practices Summary

**Server Components:**
- Default choice in App Router
- Use for data fetching, database access, sensitive operations
- Can import and use Client Components
- Cannot use hooks or event listeners

**Client Components:**
- Mark with "use client" directive
- Use for interactivity, hooks, browser APIs
- Can import other Client Components
- Cannot import Server Components (but can receive them as children)

**Composition:**
- Keep Client Components small and focused
- Fetch data in Server Components, pass to Client
- Split interactive parts into separate Client Components
- Use the "Client Wrapper" pattern for filtering/sorting server data