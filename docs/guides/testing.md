# Testing Setup Guide

> **Purpose:** Step-by-step guide for writing and running tests using Vitest, Testing Library, and Playwright.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

## Prerequisites

Vitest, Testing Library, and Playwright are already installed and configured — no setup is required before writing tests. The relevant config files are:

- `vitest.config.ts` — configures Vitest with jsdom, React plugin, and `@` path alias
- `playwright.config.ts` — configures Playwright to run against `http://localhost:3000` using Chromium

Do not modify these files without team approval.

## Dependencies

All testing dependencies are pre-installed as Tier 1. No additional packages are required.

## File Structure

All tests live under the `tests/` directory at the project root:

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

| Test Type | Convention | Location |
|---|---|---|
| Unit | `name.test.tsx` | `tests/unit/` mirroring `src/` |
| Unit (util) | `name.test.ts` | `tests/unit/` mirroring `src/` |
| E2E | `name.spec.ts` | `tests/e2e/` |

Mirror the `src/` directory structure inside `tests/unit/`. For example, a component at `src/components/ui/Button.tsx` has its test at `tests/unit/components/ui/Button.test.tsx`.

## Step-By-Step Implementation

### 1. Write A Component Test

Tests a rendered component using `@testing-library/react`.

```tsx
// tests/unit/components/ui/Button.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Save Changes</Button>);
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Save Changes</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### 2. Write A Hook Test

Tests a custom hook using `renderHook` from `@testing-library/react`.

```tsx
// tests/unit/hooks/useCounter.test.ts
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCounter } from "@/hooks/use-counter";

describe("useCounter", () => {
  it("initializes with the provided value", () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it("increments the count", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### 3. Write A Utility Test

Tests a pure function directly — no rendering required.

```ts
// tests/unit/lib/format-currency.test.ts
import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/format-currency";

describe("formatCurrency", () => {
  it("formats a number as USD", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("handles negative values", () => {
    expect(formatCurrency(-99.99)).toBe("-$99.99");
  });
});
```

### 4. Write An Integration Test

Integration tests for API routes live in `tests/integration/api/`. Import the route handler and invoke it with a mocked `Request` object, then assert on the `Response`.

```ts
// tests/integration/api/health.test.ts
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const request = new Request("http://localhost/api/health");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
  });
});
```

Keep integration tests focused on a single route or service boundary. Mock external dependencies (databases, third-party APIs) using `vi.mock`.

### 5. Write An E2E Test

E2E tests use Playwright and run against a live dev server. The server is started automatically by `playwright.config.ts` when tests are executed.

```ts
// tests/e2e/home.spec.ts
import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
  test("displays the main heading", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("captures a screenshot of the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("home.png");
  });
});
```

Playwright waits for elements automatically via `expect(...).toBeVisible()`. Avoid manual `waitForTimeout` calls — prefer locator-based assertions instead.

### 6. Run Tests

| Command | What It Runs |
|---|---|
| `bun run test` | All unit tests (Vitest, single run) |
| `bun run test:watch` | Unit tests in watch mode |
| `bun run test:e2e` | E2E tests (Playwright) |

### 7. Add E2E Tests To CI

The existing `ci.yml` does not include a Playwright job. Add the following job to `.github/workflows/ci.yml` to run E2E tests on every pull request.

```yaml
  e2e-test:
    name: E2E Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
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

Place this job alongside the existing `unit-test` job. The `upload-artifact` step preserves the HTML report so failures can be investigated after a run.

## Environment Variables

None required. All testing tools operate locally and do not depend on any environment configuration.

## Common Patterns

### Async Testing With `waitFor`

Use `waitFor` when an assertion depends on state that updates asynchronously after an interaction.

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("shows a success message after submission", async () => {
  render(<ContactForm />);

  await userEvent.click(screen.getByRole("button", { name: "Submit" }));

  await waitFor(() => {
    expect(screen.getByText("Message sent.")).toBeInTheDocument();
  });
});
```

### Mocking Modules

Use `vi.mock` to replace a module for the duration of a test file. Place the call at the top level — Vitest hoists it automatically.

```ts
import { vi } from "vitest";

vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
}));
```

To assert on the mock inside a test, import and cast it:

```ts
import { track } from "@/lib/analytics";

expect(track).toHaveBeenCalledWith("page_view", { path: "/" });
```

### User Event Simulation

Prefer `@testing-library/user-event` over `fireEvent` — it more closely models real browser interactions, including focus, keyboard events, and pointer events.

```tsx
import userEvent from "@testing-library/user-event";

it("types into a text field", async () => {
  render(<SearchInput />);

  const input = screen.getByRole("textbox", { name: "Search" });
  await userEvent.type(input, "dashboard");

  expect(input).toHaveValue("dashboard");
});
```

Always `await` `userEvent` calls — they are asynchronous.

## Verification

1. Run `bun run test` and confirm all unit tests pass.
2. Run `bun run test:e2e` and confirm all E2E tests pass.
3. Check the Playwright HTML report for screenshots and traces.
