# Sentry

Error monitoring with `@sentry/nextjs`.

> Verify SDK supports Next.js 16 before proceeding.

---

## Dependencies

```bash
bun add @sentry/nextjs
```

## Env Variables

```env
NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
SENTRY_AUTH_TOKEN=your-auth-token-here
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-name
```

| Variable | Runtime | Required |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Browser + Server | Yes |
| `SENTRY_AUTH_TOKEN` | Build only | Yes (source maps) |
| `SENTRY_ORG` | Build only | Yes (source maps) |
| `SENTRY_PROJECT` | Build only | Yes (source maps) |

Add `NEXT_PUBLIC_SENTRY_DSN` to `src/lib/env.ts`. The others are consumed by the Sentry webpack plugin at build time.

## File Structure

```
/                              → Project root
├── sentry.client.config.ts    → Browser SDK init
├── sentry.server.config.ts    → Node.js server SDK init
├── sentry.edge.config.ts      → Edge runtime SDK init
├── instrumentation.ts         → Server + edge bootstrap
└── instrumentation-client.ts  → Browser bootstrap

src/app/error.tsx              → Updated to report to Sentry
```

## Implementation

### Client Config

`sentry.client.config.ts`:

```ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
  enabled: process.env.NODE_ENV === "production",
})
```

### Server Config

`sentry.server.config.ts`:

```ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
})
```

### Edge Config

`sentry.edge.config.ts` — same as server config.

### Instrumentation

`instrumentation.ts`:

```ts
import * as Sentry from "@sentry/nextjs"

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("../sentry.server.config")
  if (process.env.NEXT_RUNTIME === "edge") await import("../sentry.edge.config")
}

export const onRequestError = Sentry.captureRequestError
```

`instrumentation-client.ts`:

```ts
import "./sentry.client.config"
```

### Next Config

Wrap with `withSentryConfig` in `next.config.ts`:

```ts
import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const nextConfig: NextConfig = { reactCompiler: true }

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  disableLogger: true,
  reactComponentAnnotation: { enabled: true },
  hideSourceMaps: true,
})
```

### Error Boundary Integration

Update `src/app/error.tsx` to capture exceptions:

```tsx
import * as Sentry from "@sentry/nextjs"

// Inside the useEffect:
Sentry.captureException(error, { extra: { digest: error.digest } })
```

## Error Capture Layers

| Layer | Mechanism | Captures |
|---|---|---|
| `error.tsx` | `captureException` | React render/event/effect errors |
| `instrumentation.ts` | `onRequestError` | Server Component, Route Handler, Server Action errors |
| `sentry.client.config.ts` | Global handlers | Unhandled rejections, uncaught exceptions |

`error.digest` links client-side reports to server-side entries.

## Verification

1. Create `src/app/test-error/page.tsx` that throws an error
2. Visit `/test-error` → check Sentry Issues dashboard
3. Verify: error message, stack trace, route context
4. Delete the test route after verification

> In dev, `enabled: false` by default. Use `bun build && bun start` to test, or temporarily enable.
