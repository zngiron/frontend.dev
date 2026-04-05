# State Management Setup Guide

> **Purpose:** Step-by-step guide for adding Zustand state management to the project.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

## Prerequisites

No state management library is pre-installed in this project. Zustand is classified as a **Tier 2 dependency**, meaning it must be approved and installed deliberately rather than assumed to be present.

Before proceeding, confirm:

- You have a genuine need for shared client-side state that cannot be handled by React's built-in `useState` or `useReducer` at the component level.
- The data in question is not server state (use Server Components and `React.cache` instead) and is not form state (use React Hook Form instead).
- A team lead or reviewer has approved the addition of this dependency.

## Dependencies

Install Zustand using Bun:

```bash
bun add zustand
```

No additional peer dependencies or type packages are required. Zustand ships with TypeScript definitions.

## File Structure

All stores live under `src/stores/`. Each store occupies its own file and follows the `name.store.ts` naming convention.

```
src/stores/
├── ui.store.ts
└── [feature].store.ts
```

Keep stores focused on a single domain. Avoid creating a single monolithic store for the entire application.

## Step-By-Step Implementation

### 1. Install Zustand

Run the install command from the project root:

```bash
bun add zustand
```

Verify that `zustand` appears in the `dependencies` section of `package.json` after installation.

### 2. Create The Stores Directory

```bash
mkdir -p src/stores
```

### 3. Create A Store File

Create a new file inside `src/stores/` using the naming convention `name.store.ts`. For example, a store that manages UI-level state would be named `ui.store.ts`.

### 4. Implement A Typed Store

The following is a complete example of a well-typed Zustand store. Define the state shape and all actions inside a single TypeScript interface, then pass it as the generic to `create`.

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

Key conventions to follow:

- Name the exported hook `use[Name]Store` (e.g. `useUIStore`, `useCartStore`).
- Define the interface above the `create` call, not inline.
- Use the functional form of `set` (i.e. `set((state) => ...)`) whenever the new value depends on the previous state.
- Use the object form of `set` (i.e. `set({ key: value })`) for independent updates.

### 5. Use The Store In A Component

Import the hook directly and select only the slice of state your component needs. Selecting a minimal slice prevents unnecessary re-renders when unrelated parts of the store update.

```ts
import { useUIStore } from "@/stores/ui.store"

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  return (
    <aside data-open={sidebarOpen}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  )
}
```

Avoid subscribing to the entire store object (e.g. `useUIStore()` with no selector), as this causes the component to re-render on every state change regardless of relevance.

## Environment Variables

None required. Zustand operates entirely on the client and does not depend on any environment configuration.

## Common Patterns

### When To Use Zustand

Use Zustand for:

- Client-side UI state such as sidebar visibility, modal open/closed status, and active theme.
- State that must be shared between components that are not in the same component tree and where prop drilling would be impractical.
- Ephemeral application state that does not need to be persisted to the server.

Do not use Zustand for:

- **Server data.** Data fetched from an API or database should be managed with Server Components and `React.cache`. Do not duplicate server data into a Zustand store.
- **Form state.** Use React Hook Form for all form inputs, validation, and submission handling.
- **URL-driven state.** Filters, pagination, and search terms belong in the URL via search parameters so that the state is shareable and bookmarkable.

### Testing Stores

Zustand stores can be tested in isolation with Vitest without needing to mount any React components.

```ts
// src/stores/ui.store.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import { useUIStore } from "./ui.store"

describe("useUIStore", () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarOpen: false,
      theme: "system",
    })
  })

  it("initializes with sidebarOpen false and theme system", () => {
    const { sidebarOpen, theme } = useUIStore.getState()
    expect(sidebarOpen).toBe(false)
    expect(theme).toBe("system")
  })

  it("toggleSidebar sets sidebarOpen to true", () => {
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it("toggleSidebar toggles back to false on second call", () => {
    useUIStore.getState().toggleSidebar()
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(false)
  })

  it("setTheme updates the theme value", () => {
    useUIStore.getState().setTheme("dark")
    expect(useUIStore.getState().theme).toBe("dark")
  })
})
```

Key testing patterns:

- Use `useUIStore.getState()` to read state and call actions directly without hooks or React.
- Use `useUIStore.setState(...)` in `beforeEach` to reset the store to a known baseline before each test. This prevents state from leaking between tests.
- Do not import or call the hook (`useUIStore()`) in test files — that requires a React rendering context. Use `getState()` and `setState()` instead.

## Verification

To confirm the store is wired up correctly, create a temporary component that reads from and writes to the store, then render it in the browser.

```ts
// src/components/debug/StoreDebug.tsx
"use client"

import { useUIStore } from "@/stores/ui.store"

export function StoreDebug() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)

  return (
    <div>
      <p>Sidebar open: {String(sidebarOpen)}</p>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <p>Theme: {theme}</p>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
    </div>
  )
}
```

Mount this component in a page, interact with the buttons, and confirm the displayed values update accordingly. Remove the component once verification is complete.
