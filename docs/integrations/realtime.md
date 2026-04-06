# Realtime

**Stack:** Supabase Realtime (no extra dependency)

---

## When To Use

**Use for:** live data updates (chat, notifications, dashboards), presence tracking (online users, live cursors).

**Don't use for:** data that doesn't need to be live (use server fetching + revalidation).

**Prerequisite:** Enable Realtime on target tables under Database > Replication > Supabase Realtime.

## Dependencies

None additional. Uses `@supabase/supabase-js` from auth setup.

## File Placement

```
src/hooks/
├── use-channel.ts     → Generic channel subscription
├── use-db-changes.ts  → DB INSERT/UPDATE/DELETE listener
└── use-presence.ts    → Presence tracking (online users)
```

## Conventions

- One hook per concern, each in its own file in `hooks/`.
- Each hook owns its own channel. Do not share channels across components.
- Always `unsubscribe()` in the effect cleanup.
- Filter by relevant columns (e.g. `room_id=eq.${roomId}`) to reduce payload.
- Presence: use `track()` on subscribe, `untrack()` on cleanup.
- Debounce high-frequency updates (e.g. live cursors on `pointermove`).

## References

- Supabase Realtime guide: https://supabase.com/docs/guides/realtime
- Postgres Changes: https://supabase.com/docs/guides/realtime/postgres-changes
- Presence: https://supabase.com/docs/guides/realtime/presence
- Broadcast: https://supabase.com/docs/guides/realtime/broadcast

## Verification

1. Open page in two tabs
2. DB changes: insert a row in Supabase Table Editor → appears in both tabs
3. Presence: each tab shows the other in online list → close one → list updates
4. Network panel: active `wss://` connection to Supabase URL
