# Sentry Setup Guide

> **Purpose:** Step-by-step guide for integrating Sentry error monitoring into the Front-End Development Framework.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

> **Compatibility Note:** This guide is written for the standard `@sentry/nextjs` SDK setup. This project uses Next.js 16.2, which is newer than the current Sentry SDK release cycle. Verify that the installed version of `@sentry/nextjs` lists Next.js 16 in its supported version range before proceeding. If the wizard or build output emits deprecation warnings, consult the [Sentry Next.js changelog](https://github.com/getsentry/sentry-javascript/blob/develop/packages/nextjs/CHANGELOG.md) for any required adjustments.

---

## Prerequisites

- A [Sentry](https://sentry.io) account with an active organization
- A Sentry project created under that organization (platform: **JavaScript → Next.js**)
- The project's **DSN**, **Auth Token**, **Organization slug**, and **Project name** copied from the Sentry dashboard

## Dependencies

```bash
bun add @sentry/nextjs
```

## File Structure

After completing the implementation steps below, the relevant files will be:

```
/                                  ← project root (or src/ if applicable)
├── sentry.client.config.ts        ← browser-side SDK initialization
├── sentry.server.config.ts        ← Node.js server-side SDK initialization
├── sentry.edge.config.ts          ← Edge runtime SDK initialization
├── instrumentation.ts             ← Next.js instrumentation hook (server + edge bootstrap)
└── instrumentation-client.ts      ← Next.js client instrumentation hook (browser bootstrap)

src/app/
└── error.tsx                      ← existing error boundary — updated to report to Sentry
```

> **Note:** `instrumentation.ts` and `instrumentation-client.ts` must be placed at the **root of the project** (or inside `src/` if you are using the `src` directory). Place them alongside `next.config.ts`, not inside `src/app/`.

## Step-By-Step Implementation

### 1. Install Dependencies

```bash
bun add @sentry/nextjs
```

### 2. Add Environment Variables

Add the following entries to `.env.example`:

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
SENTRY_AUTH_TOKEN=your-auth-token-here
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-name
```

Copy to `.env.local` and replace the placeholder values with the real credentials from your Sentry project settings.

- **DSN**: found under **Project Settings → Client Keys (DSN)**
- **Auth Token**: created under **User Settings → Auth Tokens** (requires `project:releases` and `org:read` scopes for source map uploads)
- **Org**: your Sentry organization slug (visible in the URL: `sentry.io/organizations/<slug>/`)
- **Project**: the Sentry project name

> `NEXT_PUBLIC_SENTRY_DSN` is prefixed with `NEXT_PUBLIC_` so the browser bundle can access it. The remaining variables are server-only and must never be exposed to the client.

### 3. Update The Environment Schema

Extend `src/lib/env.ts` to validate the Sentry DSN:

```ts
import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("App Name"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url(),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
})
```

> The server-only Sentry variables (`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`) are consumed by the Next.js build process and the Sentry webpack plugin directly — they do not need to be added to the runtime schema.

### 4. Create The Client Config

`sentry.client.config.ts` — initializes Sentry in the browser. This file runs once during hydration.

```ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of transactions for performance monitoring.
  // Increase toward 1.0 in lower-traffic environments.
  tracesSampleRate: 0.1,

  // Capture 10% of sessions for session replay.
  replaysSessionSampleRate: 0.1,

  // Always capture a replay when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
  ],

  // Disable in development to avoid noise.
  enabled: process.env.NODE_ENV === "production",
})
```

### 5. Create The Server Config

`sentry.server.config.ts` — initializes Sentry for the Node.js server runtime (Server Components, Route Handlers, Server Actions).

```ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,

  // Disable in development to avoid noise.
  enabled: process.env.NODE_ENV === "production",
})
```

### 6. Create The Edge Config

`sentry.edge.config.ts` — initializes Sentry for the Edge runtime (Edge Route Handlers, Edge middleware).

```ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,

  enabled: process.env.NODE_ENV === "production",
})
```

### 7. Create The Server Instrumentation File

`instrumentation.ts` — the Next.js instrumentation hook bootstraps the server-side and edge-side Sentry configs. Place this at the project root (or inside `src/` if using the `src` directory layout).

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config")
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config")
  }
}

export const onRequestError = Sentry.captureRequestError
```

Because `onRequestError` requires the Sentry import, add it at the top:

```ts
import * as Sentry from "@sentry/nextjs"

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config")
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config")
  }
}

export const onRequestError = Sentry.captureRequestError
```

> `onRequestError` is a Next.js 15+ hook that fires whenever the server captures an error. Sentry's `captureRequestError` helper handles the forwarding automatically, including attaching the request path, method, and router context.

### 8. Create The Client Instrumentation File

`instrumentation-client.ts` — bootstraps the client-side Sentry config. Place this at the project root alongside `instrumentation.ts`.

```ts
import "./sentry.client.config"
```

> `instrumentation-client.ts` runs after the HTML document loads and before React hydration begins, making it the correct place to initialize client-side error tracking.

### 9. Update `next.config.ts`

Wrap the Next.js config with `withSentryConfig` to enable automatic source map uploads and the Sentry webpack plugin:

```ts
import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const nextConfig: NextConfig = {
  reactCompiler: true,
}

export default withSentryConfig(nextConfig, {
  // Sentry organization and project (matches env vars used by the CLI)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps during production builds only
  silent: !process.env.CI,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Automatically annotate React components with their display names for
  // cleaner stack traces in Sentry
  reactComponentAnnotation: {
    enabled: true,
  },

  // Upload source maps and hide them from the public bundle
  hideSourceMaps: true,

  // Tunnel Sentry events through your own domain to avoid ad-blocker interference
  // tunnelRoute: "/monitoring",
})
```

> The `SENTRY_AUTH_TOKEN` environment variable is read automatically by the Sentry webpack plugin during the build. Ensure it is set in your CI environment and in `.env.local` for local builds that upload source maps.

## Environment Variables

| Variable | Description | Runtime | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry Data Source Name — identifies the project | Browser + Server | Yes |
| `SENTRY_AUTH_TOKEN` | Auth token for source map uploads during build | Build only | Yes (for source maps) |
| `SENTRY_ORG` | Sentry organization slug | Build only | Yes (for source maps) |
| `SENTRY_PROJECT` | Sentry project name | Build only | Yes (for source maps) |

`NEXT_PUBLIC_SENTRY_DSN` is embedded in the browser bundle. All other Sentry variables are consumed exclusively at build time and must never appear in client-facing code.

## Common Patterns

### Error Boundary Integration

The existing `src/app/error.tsx` already displays a Sonner toast when a client-side error is caught. Extend it to also capture the error in Sentry:

```tsx
"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";
import { toast } from "sonner";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-toast and re-capture whenever the error instance changes
  useEffect(() => {
    // Report the error to Sentry, attaching the digest for correlation with server logs
    Sentry.captureException(error, {
      extra: {
        digest: error.digest,
      },
    })

    toast.error("Something went wrong. Please try again.")
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Something Went Wrong</h1>
      <button
        type="button"
        onClick={unstable_retry}
        className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Try Again
      </button>
    </main>
  );
}
```

**How the two integrations interact:**

| Layer | Mechanism | What It Captures |
|-------|-----------|-----------------|
| `error.tsx` (`captureException`) | Client-side React error boundary | Errors thrown during rendering, event handlers, and effects that bubble up to the boundary |
| `instrumentation.ts` (`onRequestError`) | Next.js server-side hook | Server Component errors, Route Handler errors, Server Action errors |
| `sentry.client.config.ts` (global handlers) | Unhandled promise rejections, uncaught exceptions | Errors that occur outside of React's render tree |

The `error.digest` field links a client-side error boundary report to the corresponding server-side entry in your logs, making cross-boundary debugging straightforward.

## Verification

1. Start the development server:

   ```bash
   bun dev
   ```

2. Create a temporary test route at `src/app/test-error/page.tsx`:

   ```tsx
   export default function TestErrorPage() {
     throw new Error("Sentry test error — delete this file after verification")
   }
   ```

3. Open [http://localhost:3000/test-error](http://localhost:3000/test-error) in your browser.

4. Navigate to your Sentry project dashboard → **Issues**. The error should appear within a few seconds.

5. Verify the following in the Sentry event:
   - The error message matches: `Sentry test error — delete this file after verification`
   - The stack trace points to `src/app/test-error/page.tsx`
   - The route context is populated (`/test-error`)

6. Delete the test route once verification is complete:

   ```bash
   rm -r src/app/test-error
   ```

> **Note:** In development, `enabled: process.env.NODE_ENV === "production"` prevents events from being sent to Sentry by default. To test in development, temporarily remove or change the `enabled` option in the relevant config file, or run a production build with `bun build && bun start`.
