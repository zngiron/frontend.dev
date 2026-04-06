# Data Fetching

Server Component data patterns and TanStack Query for client-side fetching.

---

## Dependencies

Server-side fetching uses built-in Next.js and React APIs. For client-side fetching:

```bash
bun add @tanstack/react-query
```

## Decision Guide

| Need | Use |
|---|---|
| Initial page data, static/SSR reads | Server Components (fetch directly) |
| Cached server data shared across components | `React.cache` |
| Timed revalidation, tag-based cache | `unstable_cache` |
| Polling, auto-refresh, real-time dashboards | TanStack Query |
| Infinite scroll, paginated lists | TanStack Query |
| Optimistic updates on complex mutations | TanStack Query |
| Search-as-you-type, debounced queries | TanStack Query |
| Offline support, background sync | TanStack Query |

**Rule of thumb:** Start with Server Components. Reach for TanStack Query when the component needs client-side interactivity with data (polling, pagination, optimistic UI).

---

## Server-Side Fetching

### Direct Fetch In Server Components

```tsx
export default async function DashboardPage() {
  const stats = await getStats()
  return <StatsDisplay stats={stats} />
}
```

No loading state needed at the component level — use `loading.tsx` or `<Suspense>` at the route/section level.

### Deduplication With React.cache

`src/lib/services/user.service.ts`:

```ts
import { cache } from 'react'

import { createClient } from '@/lib/supabase/server'

export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
})
```

Multiple components calling `getUser()` in the same render tree share one request.

### Fetch With Caching

```ts
import { unstable_cache } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export const getPublicPosts = unstable_cache(
  async () => {
    const supabase = await createClient()
    const { data } = await supabase.from('posts').select('*').eq('published', true)
    return data ?? []
  },
  ['public-posts'],
  { revalidate: 60, tags: ['posts'] }
)
```

- First argument: async function
- Second argument: cache key array
- Third argument: `revalidate` (seconds) and/or `tags`

### Parallel Fetching

Fetch independent data in parallel, not sequentially:

```tsx
export default async function DashboardPage() {
  const [stats, notifications, activity] = await Promise.all([
    getStats(),
    getNotifications(),
    getRecentActivity(),
  ])

  return (
    <>
      <StatsDisplay stats={stats} />
      <NotificationList notifications={notifications} />
      <ActivityFeed activity={activity} />
    </>
  )
}
```

### Streaming With Suspense

For independent sections that can load at different speeds:

```tsx
import { Suspense } from 'react'

export default async function DashboardPage() {
  return (
    <>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<ActivitySkeleton />}>
        <ActivitySection />
      </Suspense>
    </>
  )
}
```

Each `<Suspense>` boundary streams independently. The page shell renders immediately.

### Revalidation After Mutation

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { revalidateTag } from 'next/cache'

export async function createPost(data: FormData) {
  // ... insert post
  revalidatePath('/dashboard')
  revalidateTag('posts')
}
```

---

## Client-Side Fetching (TanStack Query)

### Setup

`src/lib/query-client.ts`:

```ts
import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  })
}
```

Add `QueryClientProvider` to `src/components/core/providers.tsx`:

```tsx
'use client'

import { useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import { makeQueryClient } from '@/lib/query-client'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient)
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

Wrap in the existing `Providers` component.

### Query Keys

`src/lib/query-keys.ts` — centralized, type-safe keys:

```ts
export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    list: (filters: { status?: string }) => [...queryKeys.posts.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.posts.all, 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
  },
} as const
```

### Basic Query

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'

import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'

export function PostList() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: queryKeys.posts.list({}),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('posts').select('*')
      if (error) throw error
      return data
    },
  })

  if (isLoading) return <PostsSkeleton />
  if (error) return <p className="text-destructive">Failed to load posts.</p>
  return <ul>{posts?.map((post) => <PostItem key={post.id} post={post} />)}</ul>
}
```

### Polling

```tsx
useQuery({
  queryKey: queryKeys.notifications.unread(),
  queryFn: fetchUnreadNotifications,
  refetchInterval: 10_000,
})
```

### Infinite Scroll

```tsx
'use client'

import { useInfiniteQuery } from '@tanstack/react-query'

import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'

const PAGE_SIZE = 20

export function InfinitePostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: queryKeys.posts.list({}),
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = createClient()
      const { data } = await supabase
        .from('posts')
        .select('*')
        .range(pageParam, pageParam + PAGE_SIZE - 1)
        .order('created_at', { ascending: false })
      return data ?? []
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
  })

  return (
    <>
      {data?.pages.flat().map((post) => <PostItem key={post.id} post={post} />)}
      {hasNextPage && (
        <button type="button" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </>
  )
}
```

### Optimistic Updates

```tsx
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-keys'

export function useToggleLike(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to toggle like')
      return res.json()
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) })
      const previous = queryClient.getQueryData(queryKeys.posts.detail(postId))
      queryClient.setQueryData(queryKeys.posts.detail(postId), (old: any) => ({
        ...old,
        liked: !old.liked,
      }))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKeys.posts.detail(postId), context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) })
    },
  })
}
```

### Prefetching From Server Components

Hydrate TanStack Query cache with server-fetched data to avoid client refetch:

```tsx
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-keys'

export default async function PostsPage() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: queryKeys.posts.list({}),
    queryFn: getPostsFromServer,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList />
    </HydrationBoundary>
  )
}
```

---

## Common Patterns

### Conditional Fetching

```tsx
export default async function ProfilePage({ params }: PageProps<'/profile/[id]'>) {
  const { id } = await params
  const profile = await getUserProfile(id)
  if (!profile) notFound()
  return <ProfileCard profile={profile} />
}
```

### Error Handling (Server)

Let errors propagate to `error.tsx`. Don't wrap every fetch in try/catch — the error boundary handles it. Only catch when you need a specific fallback:

```tsx
const data = await getData().catch(() => null)
if (!data) return <EmptyState />
```

## Verification

1. Server Component fetches data without client JS — check Network tab for no client-side requests
2. `React.cache` deduplication — add `console.log` to service, confirm single log per render
3. Revalidation — mutate data, verify page reflects changes without manual refresh
4. TanStack Query polling — set `refetchInterval`, confirm periodic requests in Network tab
5. Optimistic update — toggle like, confirm instant UI update before server response
