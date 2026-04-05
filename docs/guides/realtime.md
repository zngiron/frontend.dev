# Realtime Setup Guide

> **Purpose:** Step-by-step guide for adding Supabase Realtime subscriptions to the project.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

## Prerequisites

- Supabase project created at [supabase.com](https://supabase.com)
- Realtime enabled for the project — verify under **Project Settings > Replication** in the Supabase dashboard
- For database change listeners: Realtime enabled on the target table under **Database > Replication > Supabase Realtime**
- Auth guide completed — the browser Supabase client from that guide is reused here

## Dependencies

No additional dependencies are required. Realtime is part of `@supabase/supabase-js`, which was installed in the auth guide:

```bash
# Already installed — no action needed
bun add @supabase/ssr @supabase/supabase-js
```

## File Structure

Realtime subscriptions are managed through custom hooks located in `src/hooks/`. Each hook encapsulates a single channel or subscription concern.

```
src/hooks/
├── use-channel.ts          ← Generic channel subscription hook
├── use-db-changes.ts       ← Database INSERT / UPDATE / DELETE listener
└── use-presence.ts         ← Presence tracking (online users, live cursors)
```

## Step-By-Step Implementation

### 1. Create A Generic Channel Hook

`src/hooks/use-channel.ts` — establishes a named channel and tears it down on unmount. Use this as the foundation for more specific hooks.

```ts
"use client"

import { useEffect, useRef } from "react"

import type { RealtimeChannel } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/client"

export function useChannel(channelName: string): RealtimeChannel | null {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(channelName)

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channelRef.current = channel
      }
    })

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [channelName])

  return channelRef.current
}
```

### 2. Create A Database Change Listener Hook

`src/hooks/use-db-changes.ts` — listens for `INSERT`, `UPDATE`, and `DELETE` events on a specified table. Accepts an optional filter to scope changes to a subset of rows.

```ts
"use client"

import { useEffect } from "react"

import type {
  RealtimePostgresChangesFilter,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/client"

type Event = "INSERT" | "UPDATE" | "DELETE" | "*"

interface UseDbChangesOptions<T extends Record<string, unknown>> {
  schema?: string
  table: string
  event?: Event
  filter?: string
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void
}

export function useDbChanges<T extends Record<string, unknown>>({
  schema = "public",
  table,
  event = "*",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseDbChangesOptions<T>): void {
  useEffect(() => {
    const supabase = createClient()

    const filterConfig: RealtimePostgresChangesFilter<typeof event> = {
      event,
      schema,
      table,
      ...(filter ? { filter } : {}),
    }

    const channel = supabase
      .channel(`db-changes:${schema}:${table}`)
      .on("postgres_changes", filterConfig, (payload) => {
        onChange?.(payload as RealtimePostgresChangesPayload<T>)

        if (payload.eventType === "INSERT") {
          onInsert?.(payload as RealtimePostgresChangesPayload<T>)
        } else if (payload.eventType === "UPDATE") {
          onUpdate?.(payload as RealtimePostgresChangesPayload<T>)
        } else if (payload.eventType === "DELETE") {
          onDelete?.(payload as RealtimePostgresChangesPayload<T>)
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [schema, table, event, filter, onInsert, onUpdate, onDelete, onChange])
}
```

**Usage example** — listen for new rows inserted into a `messages` table:

```tsx
"use client"

import { useState } from "react"

import { useDbChanges } from "@/hooks/use-db-changes"

interface Message {
  id: string
  content: string
  created_at: string
}

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([])

  useDbChanges<Message>({
    table: "messages",
    event: "INSERT",
    onInsert: (payload) => {
      if (payload.new && "id" in payload.new) {
        setMessages((prev) => [...prev, payload.new as Message])
      }
    },
  })

  return (
    <ul>
      {messages.map((msg) => (
        <li key={msg.id}>{msg.content}</li>
      ))}
    </ul>
  )
}
```

### 3. Create A Presence Tracking Hook

`src/hooks/use-presence.ts` — tracks which users are online in a shared channel. Each connected client broadcasts its own state (e.g., user ID, cursor position) and receives the state of all other connected clients.

```ts
"use client"

import { useEffect, useRef, useState } from "react"

import type { RealtimePresenceState } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/client"

interface UsePresenceOptions<T extends Record<string, unknown>> {
  channelName: string
  userState: T
}

interface UsePresenceResult<T extends Record<string, unknown>> {
  presenceState: RealtimePresenceState<T>
  isSubscribed: boolean
}

export function usePresence<T extends Record<string, unknown>>({
  channelName,
  userState,
}: UsePresenceOptions<T>): UsePresenceResult<T> {
  const [presenceState, setPresenceState] = useState<RealtimePresenceState<T>>(
    {}
  )
  const [isSubscribed, setIsSubscribed] = useState(false)
  const userStateRef = useRef(userState)
  userStateRef.current = userState

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`presence:${channelName}`)

    channel
      .on("presence", { event: "sync" }, () => {
        setPresenceState(channel.presenceState<T>())
      })
      .on("presence", { event: "join" }, () => {
        setPresenceState(channel.presenceState<T>())
      })
      .on("presence", { event: "leave" }, () => {
        setPresenceState(channel.presenceState<T>())
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsSubscribed(true)
          await channel.track(userStateRef.current)
        }
      })

    return () => {
      channel.untrack()
      channel.unsubscribe()
      setIsSubscribed(false)
    }
  }, [channelName])

  return { presenceState, isSubscribed }
}
```

**Usage example** — display a list of online users in a shared room:

```tsx
"use client"

import { usePresence } from "@/hooks/use-presence"

interface UserState {
  userId: string
  displayName: string
}

interface OnlineUsersProps {
  userId: string
  displayName: string
}

export function OnlineUsers({ userId, displayName }: OnlineUsersProps) {
  const { presenceState, isSubscribed } = usePresence<UserState>({
    channelName: "room:lobby",
    userState: { userId, displayName },
  })

  const onlineUsers = Object.values(presenceState).flat()

  return (
    <div>
      <p>{isSubscribed ? "Connected" : "Connecting..."}</p>
      <ul>
        {onlineUsers.map((user) => (
          <li key={user.userId}>{user.displayName}</li>
        ))}
      </ul>
    </div>
  )
}
```

## Environment Variables

Realtime uses the same Supabase environment variables established in the auth guide. No additional variables are required.

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

Both variables are embedded in the browser bundle via `NEXT_PUBLIC_` prefix. The Realtime client runs exclusively in Client Components — the service role key is not used here.

## Common Patterns

### Chat Messages

Subscribe to `INSERT` events on a `messages` table scoped to a specific room using the `filter` option:

```ts
useDbChanges<Message>({
  table: "messages",
  event: "INSERT",
  filter: `room_id=eq.${roomId}`,
  onInsert: (payload) => {
    if (payload.new && "id" in payload.new) {
      setMessages((prev) => [...prev, payload.new as Message])
    }
  },
})
```

Ensure Row Level Security permits the authenticated user to read the filtered rows, or the subscription will receive no events.

### Live Notifications

Subscribe to `INSERT` events on a `notifications` table filtered by the current user's ID to push in-app notifications without polling:

```ts
useDbChanges<Notification>({
  table: "notifications",
  event: "INSERT",
  filter: `user_id=eq.${userId}`,
  onInsert: (payload) => {
    if (payload.new && "id" in payload.new) {
      showToast(payload.new as Notification)
    }
  },
})
```

### Live Cursors

Extend `usePresence` by including `x` and `y` coordinates in the user state and calling `channel.track` with updated coordinates on `pointermove`. Debounce pointer events before tracking to avoid flooding the channel.

```ts
usePresence<CursorState>({
  channelName: `document:${documentId}`,
  userState: { userId, x: cursorX, y: cursorY },
})
```

Re-track on cursor movement by updating `userState` and calling `channel.track` directly on the channel ref. The `sync` presence event fires on all peers whenever any client updates its tracked state.

### Cleanup

All hooks in `src/hooks/` follow the same cleanup contract: the `useEffect` return function calls `channel.unsubscribe()` (and `channel.untrack()` for presence channels) before the component unmounts or the effect re-runs.

**Do not** share a single channel instance across multiple components. Each hook creates and owns its own channel. Supabase allows multiple channels per client — this is the intended pattern.

```ts
// Correct — each hook manages its own channel lifecycle
useEffect(() => {
  const channel = supabase.channel("my-channel")
  channel.subscribe()

  return () => {
    channel.unsubscribe() // Always unsubscribe in the cleanup function
  }
}, [])
```

If a hook's dependency array changes (e.g., the `table` or `channelName` prop changes), React re-runs the effect, which triggers cleanup of the previous channel before the new one is created. This is handled automatically by the hooks above.

## Verification

1. Start the dev server: `bun dev`
2. Open the target page in two separate browser tabs (or two different browsers)
3. For database change listeners: insert, update, or delete a row in the Supabase Table Editor — the change should appear in both tabs within one second
4. For presence tracking: observe that each tab shows the other tab's user in the online list; close one tab and confirm the other tab's list updates within a few seconds
5. Open the browser console **Network** panel and filter by `WebSocket` — confirm an active `wss://` connection to your Supabase project URL
6. Check the Supabase dashboard under **Realtime > Inspector** to monitor live events and confirm messages are being received by the server