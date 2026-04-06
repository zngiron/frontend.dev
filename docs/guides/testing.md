# Testing

Vitest, Testing Library, and Playwright.

---

## Dependencies

All pre-installed (Tier 1). No setup required.

- `vitest.config.ts` — jsdom, React plugin, `@` path alias
- `playwright.config.ts` — `http://localhost:3000`, Chromium

## File Structure

```
tests/
├── unit/
│   ├── components/
│   ├── lib/
│   └── hooks/
├── integration/
│   └── api/
└── e2e/
```

Mirror `src/` structure inside `tests/unit/`. E.g., `src/components/ui/button.tsx` → `tests/unit/components/ui/button.test.tsx`.

| Type | Convention | Location |
|---|---|---|
| Unit | `name.test.tsx` | `tests/unit/` |
| Integration | `name.test.ts` | `tests/integration/` |
| E2E | `name.spec.ts` | `tests/e2e/` |

## Examples

### Component Test

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })

  it("calls onClick", async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Save</Button>)
    await userEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

### Hook Test

```ts
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useCounter } from "@/hooks/use-counter"

describe("useCounter", () => {
  it("increments", () => {
    const { result } = renderHook(() => useCounter(0))
    act(() => { result.current.increment() })
    expect(result.current.count).toBe(1)
  })
})
```

### Utility Test

```ts
import { describe, expect, it } from "vitest"
import { formatCurrency } from "@/lib/format-currency"

describe("formatCurrency", () => {
  it("formats USD", () => { expect(formatCurrency(1234.5)).toBe("$1,234.50") })
  it("handles zero", () => { expect(formatCurrency(0)).toBe("$0.00") })
})
```

### Integration Test

```ts
import { describe, expect, it } from "vitest"
import { GET } from "@/app/api/health/route"

describe("GET /api/health", () => {
  it("returns 200", async () => {
    const response = await GET(new Request("http://localhost/api/health"))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: "ok" })
  })
})
```

### E2E Test

```ts
import { expect, test } from "@playwright/test"

test("home page heading", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
})
```

## Commands

| Command | Runs |
|---|---|
| `bun run test` | Unit tests (single run) |
| `bun run test:watch` | Unit tests (watch mode) |
| `bun run test:e2e` | E2E tests (Playwright) |

## Common Patterns

- **Async assertions:** use `waitFor` when state updates asynchronously
- **Mocking:** `vi.mock("@/lib/analytics", () => ({ track: vi.fn() }))`
- **User events:** prefer `@testing-library/user-event` over `fireEvent`. Always `await` calls.

## CI

Add to `.github/workflows/ci.yml`:

```yaml
e2e-test:
  name: E2E Test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v6
    - uses: oven-sh/setup-bun@v2
    - run: bun install --frozen-lockfile
    - run: bunx playwright install --with-deps chromium
    - run: bun run test:e2e
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 7
```
