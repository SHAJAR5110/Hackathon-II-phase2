# Performance Optimization - Next.js Best Practices

## Image Optimization

### Use next/image for All Images

**Benefits:**
- Automatic WebP/AVIF generation
- Lazy loading by default
- Responsive images
- Prevents layout shift (CLS)

**Implementation:**
```typescript
import Image from "next/image"

// Fixed dimensions
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // For above-fold images
/>

// Responsive (fill parent)
<Image
  src="/banner.jpg"
  alt="Banner"
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// External images
<Image
  src="https://example.com/image.jpg"
  alt="External"
  width={800}
  height={600}
  unoptimized // For external domains if needed
/>
```

**Configuration (next.config.js):**
```javascript
module.exports = {
  images: {
    domains: ["example.com", "cdn.example.com"],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
}
```

## Code Splitting & Lazy Loading

### Dynamic Imports for Heavy Components

```typescript
// app/dashboard/page.tsx
import dynamic from "next/dynamic"

// Lazy load heavy chart component
const AnalyticsChart = dynamic(() => import("@/components/analytics-chart"), {
  loading: () => <div>Loading chart...</div>,
  ssr: false // Disable server-side rendering if needed
})

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <AnalyticsChart />
    </div>
  )
}
```

### Code Splitting by Route

```typescript
// Next.js automatically code-splits by route
// Each page only loads its required JavaScript

// app/about/page.tsx - Only loaded when visiting /about
export default function AboutPage() {
  return <div>About</div>
}

// app/contact/page.tsx - Only loaded when visiting /contact
export default function ContactPage() {
  return <div>Contact</div>
}
```

## Data Fetching Optimization

### Server Components for Initial Data

```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  // Fetch on server, no client-side loading
  const posts = await db.query("SELECT * FROM posts")
  
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

### Parallel Data Fetching

```typescript
// ❌ Sequential (slow)
export default async function Page() {
  const user = await fetchUser()
  const posts = await fetchPosts() // Waits for user to complete
  const comments = await fetchComments() // Waits for posts to complete
  
  return <div>{/* ... */}</div>
}

// ✅ Parallel (fast)
export default async function Page() {
  // Fetch all in parallel
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ])
  
  return <div>{/* ... */}</div>
}
```

### Streaming with Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from "react"

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Fast component loads immediately */}
      <UserInfo />
      
      {/* Slow component streams in */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <Analytics />
      </Suspense>
      
      <Suspense fallback={<RecentActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}

async function Analytics() {
  // Slow data fetch
  const data = await fetchAnalytics()
  return <AnalyticsChart data={data} />
}

async function RecentActivity() {
  // Another slow fetch
  const activities = await fetchActivities()
  return <ActivityList activities={activities} />
}
```

### Request Deduplication

```typescript
// Next.js automatically dedupes identical fetch requests
// These will only make ONE network request:

export default async function Page() {
  const user1 = await fetch("https://api.example.com/user/1").then(r => r.json())
  const user2 = await fetch("https://api.example.com/user/1").then(r => r.json())
  const user3 = await fetch("https://api.example.com/user/1").then(r => r.json())
  
  // Only ONE request made, result cached and reused
}
```

## Caching Strategies

### Static Generation (Fastest)

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await db.query("SELECT slug FROM posts")
  
  return posts.map(post => ({
    slug: post.slug
  }))
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await db.query(
    "SELECT * FROM posts WHERE slug = ?",
    [params.slug]
  )
  
  return <article>{post.content}</article>
}
```

### Revalidation (ISR)

```typescript
// Revalidate every 60 seconds
export const revalidate = 60

export default async function Page() {
  const data = await fetch("https://api.example.com/data")
  return <div>{/* ... */}</div>
}
```

### On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from "next/cache"

export async function POST(req: Request) {
  const { path, tag } = await req.json()
  
  if (path) {
    revalidatePath(path)
  }
  
  if (tag) {
    revalidateTag(tag)
  }
  
  return Response.json({ revalidated: true })
}

// Usage in data fetching
export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    next: { tags: ["posts"] }
  })
  
  return <div>{/* ... */}</div>
}
```

## Bundle Size Optimization

### Analyze Bundle

```bash
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
})

module.exports = withBundleAnalyzer({
  // Next.js config
})

# Run analysis
ANALYZE=true npm run build
```

### Tree Shaking

```typescript
// ❌ Imports entire library
import _ from "lodash"
const result = _.debounce(fn, 300)

// ✅ Import only what you need
import debounce from "lodash/debounce"
const result = debounce(fn, 300)

// ✅ Even better: Use native alternatives
const debounce = (fn: Function, delay: number) => {
  let timeout: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}
```

### Remove Unused Dependencies

```bash
# Find unused dependencies
npx depcheck

# Remove unused packages
npm uninstall package-name
```

## React Performance

### Memoization

```typescript
// components/expensive-component.tsx
"use client"

import { memo, useMemo, useCallback } from "react"

interface Props {
  data: Item[]
  onItemClick: (id: string) => void
}

// Prevent re-renders when props haven't changed
export const ExpensiveList = memo(function ExpensiveList({ data, onItemClick }: Props) {
  // Memoize expensive calculations
  const sortedData = useMemo(() => {
    return data.sort((a, b) => a.name.localeCompare(b.name))
  }, [data])
  
  // Memoize callback to prevent child re-renders
  const handleClick = useCallback((id: string) => {
    onItemClick(id)
  }, [onItemClick])
  
  return (
    <div>
      {sortedData.map(item => (
        <ExpensiveItem
          key={item.id}
          item={item}
          onClick={handleClick}
        />
      ))}
    </div>
  )
})
```

### Virtual Lists for Long Lists

```typescript
"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef } from "react"

export function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5
  })
  
  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative"
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <Item item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Font Optimization

### next/font

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono"
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}

// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-roboto-mono)"]
      }
    }
  }
}
```

## Database Query Optimization

### Prevent N+1 Queries

```typescript
// ❌ N+1 Query Problem
export default async function PostsPage() {
  const posts = await db.query("SELECT * FROM posts")
  
  // Makes N additional queries (one per post)!
  const postsWithAuthors = await Promise.all(
    posts.map(async post => ({
      ...post,
      author: await db.query("SELECT * FROM users WHERE id = ?", [post.author_id])
    }))
  )
  
  return <div>{/* ... */}</div>
}

// ✅ Single Query with JOIN
export default async function PostsPage() {
  const posts = await db.query(`
    SELECT
      posts.*,
      users.name as author_name,
      users.email as author_email
    FROM posts
    JOIN users ON posts.author_id = users.id
  `)
  
  return <div>{/* ... */}</div>
}

// ✅ ORM with Eager Loading
const posts = await prisma.post.findMany({
  include: {
    author: true
  }
})
```

### Database Indexing

```sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_users_email ON users(email);

-- Composite index for multiple columns
CREATE INDEX idx_posts_status_date ON posts(status, published_at);
```

### Pagination

```typescript
// ❌ Loading all records (slow)
export default async function PostsPage() {
  const posts = await db.query("SELECT * FROM posts ORDER BY created_at DESC")
  return <div>{/* ... */}</div>
}

// ✅ Pagination
export default async function PostsPage({
  searchParams
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || "1")
  const perPage = 20
  const offset = (page - 1) * perPage
  
  const [posts, totalCount] = await Promise.all([
    db.query(
      "SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [perPage, offset]
    ),
    db.query("SELECT COUNT(*) as count FROM posts")
  ])
  
  const totalPages = Math.ceil(totalCount.count / perPage)
  
  return (
    <div>
      <PostList posts={posts} />
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  )
}
```

## Middleware Optimization

```typescript
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  // Keep middleware fast - only essential logic
  
  // Authentication check
  const token = req.cookies.get("auth-token")
  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  
  return NextResponse.next()
}

// Only run on specific routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*"
  ]
}
```

## Performance Monitoring

### Web Vitals

```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Custom Performance Tracking

```typescript
// lib/performance.ts
export function trackPerformance(name: string) {
  if (typeof window === "undefined") return
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`${name}:`, entry.duration)
      // Send to analytics
    }
  })
  
  observer.observe({ entryTypes: ["measure"] })
  
  performance.mark(`${name}-start`)
  
  return () => {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
  }
}

// Usage
const endTracking = trackPerformance("data-fetch")
await fetchData()
endTracking()
```

## Performance Checklist

- [ ] Using next/image for all images
- [ ] Images have proper sizes and priority attributes
- [ ] Heavy components lazy loaded with dynamic()
- [ ] Data fetched in Server Components when possible
- [ ] Parallel data fetching with Promise.all()
- [ ] Streaming with Suspense for slow components
- [ ] Static generation or ISR where appropriate
- [ ] Bundle analyzed and optimized
- [ ] Tree shaking for large libraries
- [ ] Fonts optimized with next/font
- [ ] Database queries optimized (no N+1)
- [ ] Proper indexing on database
- [ ] Pagination for large datasets
- [ ] Memoization for expensive calculations
- [ ] Virtual lists for long lists
- [ ] Middleware kept minimal and fast
- [ ] Web Vitals monitored