# Realtime

Supabase Realtime subscriptions.

---

## Dependencies

None additional. Uses `@supabase/supabase-js` from auth setup.

**Prerequisite:** Enable Realtime on target tables under **Database > Replication > Supabase Realtime**.

## File Structure

```
src/hooks/
├── use-channel.ts     → Generic channel subscription
├── use-db-changes.ts  → DB INSERT/UPDATE/DELETE listener
└── use-presence.ts    → Presence tracking (online users)
```

## Implementation

### Generic Channel Hook

`src/hooks/use-channel.ts`:

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
      if (status === "SUBSCRIBED") channelRef.current = channel
    })

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [channelName])

  return channelRef.current
}
```

### Database Change Listener

`src/hooks/use-db-changes.ts`:

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
      event, schema, table,
      ...(filter ? { filter } : {}),
    }

    const channel = supabase
      .channel(`db-changes:${schema}:${table}`)
      .on("postgres_changes", filterConfig, (payload) => {
        onChange?.(payload as RealtimePostgresChangesPayload<T>)
        if (payload.eventType === "INSERT") onInsert?.(payload as RealtimePostgresChangesPayload<T>)
        else if (payload.eventType === "UPDATE") onUpdate?.(payload as RealtimePostgresChangesPayload<T>)
        else if (payload.eventType === "DELETE") onDelete?.(payload as RealtimePostgresChangesPayload<T>)
      })
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [schema, table, event, filter, onInsert, onUpdate, onDelete, onChange])
}
```

### Presence Hook

`src/hooks/use-presence.ts`:

```ts
"use client"

import { useEffect, useRef, useState } from "react"

import type { RealtimePresenceState } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/client"

interface UsePresenceOptions<T extends Record<string, unknown>> {
  channelName: string
  userState: T
}

export function usePresence<T extends Record<string, unknown>>({
  channelName,
  userState,
}: UsePresenceOptions<T>) {
  const [presenceState, setPresenceState] = useState<RealtimePresenceState<T>>({})
  const [isSubscribed, setIsSubscribed] = useState(false)
  const userStateRef = useRef(userState)
  userStateRef.current = userState

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`presence:${channelName}`)

    channel
      .on("presence", { event: "sync" }, () => setPresenceState(channel.presenceState<T>()))
      .on("presence", { event: "join" }, () => setPresenceState(channel.presenceState<T>()))
      .on("presence", { event: "leave" }, () => setPresenceState(channel.presenceState<T>()))
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

## Common Patterns

### Chat Messages

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

### Live Notifications

Filter by `user_id=eq.${userId}` on a `notifications` table. Push to toast on insert.

### Live Cursors

Extend `usePresence` with `x`/`y` in user state. Re-track on debounced `pointermove`.

### Cleanup

Each hook owns its own channel. Don't share channels across components. Always `unsubscribe()` in the effect cleanup.

## Verification

1. Open page in two tabs
2. DB changes: insert a row in Supabase Table Editor → appears in both tabs
3. Presence: each tab shows the other in online list → close one → list updates
4. Network panel: active `wss://` connection to Supabase URL
