# Testing

**Stack:** Vitest + Testing Library + Playwright

---

## When To Use

| Type | When | Tool |
|---|---|---|
| Unit | Pure functions, hooks, stores, utilities | Vitest |
| Component | UI behavior, user interactions | Vitest + Testing Library |
| Integration | API route handlers, Server Actions | Vitest |
| E2E | Full user flows, critical paths | Playwright |

## Dependencies

All pre-installed (Tier 1). No setup required.

- `vitest.config.ts` — jsdom, React plugin, `@` path alias
- `playwright.config.ts` — `http://localhost:3000`, Chromium

## File Placement

Mirror `src/` structure inside `tests/unit/`.

```
tests/
├── unit/
│   ├── components/   → mirrors src/components/
│   ├── lib/          → mirrors src/lib/
│   ├── hooks/        → mirrors src/hooks/
│   └── data/         → mirrors src/data/
├── integration/
│   └── api/          → Route handler tests
└── e2e/              → Full user flow tests
```

| Type | Naming | Location |
|---|---|---|
| Unit | `name.test.tsx` | `tests/unit/` |
| Integration | `name.test.ts` | `tests/integration/` |
| E2E | `name.spec.ts` | `tests/e2e/` |

## Conventions

- Prefer `@testing-library/user-event` over `fireEvent`. Always `await` user event calls.
- Use `waitFor` for async state updates.
- Test stores with `getState()` / `setState()` — no React rendering context needed.
- Mock external dependencies with `vi.mock()`. Never mock the module under test.
- Use `vi.fn()` for callback assertions.
- E2E: use `page.getByRole()` selectors for accessibility-first testing.

## Commands

| Command | Runs |
|---|---|
| `bun run test` | Unit + integration tests (single run) |
| `bun run test:watch` | Unit tests (watch mode) |
| `bun run test:e2e` | E2E tests (Playwright) |

## CI

Project-specific CI workflow in `.github/workflows/ci.yml`:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run typecheck

  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build

  e2e-test:
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

## References

- Vitest docs: https://vitest.dev/guide/
- Testing Library: https://testing-library.com/docs/react-testing-library/intro
- Playwright docs: https://playwright.dev/docs/intro

## Verification

1. `bun run test` passes with no errors
2. `bun run test:e2e` passes with Chromium
3. CI pipeline runs all jobs on PR to main
