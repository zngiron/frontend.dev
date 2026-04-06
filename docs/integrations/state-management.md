# State Management

**Stack:** Zustand

---

## When To Use

**Use for:** shared client UI state (sidebar, modals, theme), cross-tree state where prop drilling is impractical, ephemeral state not persisted to server.

**Don't use for:** server data (use Server Components + `data/api/`), form state (use React Hook Form), URL-driven state (use search params).

## Dependencies

```bash
bun add zustand
```

## File Placement

```
src/stores/
├── ui.store.ts
└── [domain].store.ts
```

One store per domain. No monolithic stores.

## Conventions

- Export as `use[Name]Store` (e.g. `useUIStore`).
- Define the interface above the `create` call.
- Functional `set` when new value depends on previous state. Object `set` for independent updates.
- Select minimal slices to avoid unnecessary re-renders. Never subscribe to the entire store with no selector.
- Test stores with `getState()` / `setState()` — no React rendering context needed.

## References

- Zustand docs: https://zustand.docs.pmnd.rs/getting-started/introduction
- Zustand recipes: https://zustand.docs.pmnd.rs/guides/practice-with-no-store-actions

## Verification

1. Store exports correctly typed
2. Sliced selectors trigger re-renders only for subscribed state
3. `getState()` / `setState()` work in Vitest without React
