# State Management

Zustand for client-side state.

---

## Dependencies

Tier 2 — install when needed:

```bash
bun add zustand
```

## When To Use

**Use for:** shared client UI state (sidebar, modals, theme), cross-tree state where prop drilling is impractical, ephemeral state not persisted to server.

**Don't use for:** server data (use Server Components + `React.cache`), form state (use React Hook Form), URL-driven state (use search params).

## File Structure

```
src/stores/
├── ui.store.ts
└── [feature].store.ts
```

One store per domain. No monolithic stores.

## Implementation

```ts
import { create } from "zustand"

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  theme: "light" | "dark" | "system"
  setTheme: (theme: UIState["theme"]) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  theme: "system",
  setTheme: (theme) => set({ theme }),
}))
```

Conventions:
- Export as `use[Name]Store`
- Define interface above `create`
- Functional `set` when new value depends on previous state
- Object `set` for independent updates

## Usage

Select minimal slices to avoid unnecessary re-renders:

```ts
const sidebarOpen = useUIStore((state) => state.sidebarOpen)
const toggleSidebar = useUIStore((state) => state.toggleSidebar)
```

Never subscribe to the entire store (`useUIStore()` with no selector).

## Testing

```ts
import { describe, it, expect, beforeEach } from "vitest"
import { useUIStore } from "./ui.store"

describe("useUIStore", () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarOpen: false, theme: "system" })
  })

  it("toggles sidebar", () => {
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it("sets theme", () => {
    useUIStore.getState().setTheme("dark")
    expect(useUIStore.getState().theme).toBe("dark")
  })
})
```

Use `getState()` / `setState()` in tests — no React rendering context needed.
