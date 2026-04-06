# Loading And Streaming

`loading.tsx`, Suspense boundaries, and skeleton patterns.

---

## Dependencies

None. Uses built-in Next.js and React APIs.

## File Structure

```
src/app/
├── loading.tsx                    → Root loading state
├── (dashboard)/
│   ├── loading.tsx                → Dashboard loading state
│   ├── analytics/
│   │   └── loading.tsx            → Route-specific loading
```

Each route segment can have its own `loading.tsx`. It wraps the `page.tsx` in a `<Suspense>` boundary automatically.

## Implementation

### Route-Level Loading

`loading.tsx` activates during navigation and initial load:

```tsx
export default function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
    </div>
  )
}
```

### Skeleton Components

For content-aware loading states, build skeleton components:

```tsx
export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-6">
      <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
```

### Section-Level Suspense

When different page sections load at different speeds:

```tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}
```

The page shell renders immediately. Each section streams in as its data resolves.

### Nested Suspense

Outer boundaries resolve first, inner boundaries resolve independently:

```tsx
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<ContentSkeleton />}>
    <Content />
  </Suspense>
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
</Suspense>
```

## Common Patterns

### When To Use loading.tsx vs Suspense

| Pattern | Use when |
|---|---|
| `loading.tsx` | Full-page loading during navigation |
| `<Suspense>` | Section-level streaming within a page |
| Inline skeleton | Component has its own loading state (e.g., data table with pagination) |

### Avoid Loading Waterfalls

Wrong — sequential loading:

```tsx
export default async function Page() {
  const user = await getUser()
  const posts = await getPosts(user.id)
  const comments = await getComments(posts[0].id)
  return <Display user={user} posts={posts} comments={comments} />
}
```

Right — parallel fetching with streaming:

```tsx
export default async function Page() {
  const user = await getUser()
  return (
    <>
      <UserHeader user={user} />
      <Suspense fallback={<PostsSkeleton />}>
        <PostsSection userId={user.id} />
      </Suspense>
    </>
  )
}
```

### Loading For Layouts

Route group layouts can also have `loading.tsx`. The loading state applies to all child routes:

```
src/app/(dashboard)/
├── layout.tsx
├── loading.tsx     → Shows for all /dashboard/* navigations
├── settings/page.tsx
└── projects/page.tsx
```

## Verification

1. Navigate between routes → `loading.tsx` skeleton appears briefly
2. Slow data source → Suspense fallback renders, content streams in
3. Multiple Suspense boundaries → sections appear independently
4. No layout shift → skeleton matches final content dimensions
