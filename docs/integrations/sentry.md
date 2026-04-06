# Sentry

**Stack:** `@sentry/nextjs`

> Verify SDK version supports Next.js 16 before proceeding → see `docs/FRAMEWORK.md`.

---

## When To Use

**Use for:** error monitoring, performance tracing, session replay in production.

## Dependencies

```bash
bun add @sentry/nextjs
```

## Env Variables

| Variable | Runtime | Required |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Browser + Server | Yes |
| `SENTRY_AUTH_TOKEN` | Build only | Yes (source maps) |
| `SENTRY_ORG` | Build only | Yes (source maps) |
| `SENTRY_PROJECT` | Build only | Yes (source maps) |

Add `NEXT_PUBLIC_SENTRY_DSN` to `src/lib/env.ts`. The others are consumed by the Sentry webpack plugin at build time.

## File Placement

```
/                              → Project root
├── sentry.client.config.ts    → Browser SDK init
├── sentry.server.config.ts    → Node.js server SDK init
├── sentry.edge.config.ts      → Edge runtime SDK init
├── instrumentation.ts         → Server + edge bootstrap
└── instrumentation-client.ts  → Browser bootstrap

src/app/error.tsx              → Updated to report to Sentry
next.config.ts                 → Wrapped with withSentryConfig
```

## Conventions

- `enabled: process.env.NODE_ENV === 'production'` in all config files.
- `tracesSampleRate: 0.1` — adjust based on traffic volume.
- `replaysSessionSampleRate: 0.1`, `replaysOnErrorSampleRate: 1.0` for replay.
- Wrap `next.config.ts` with `withSentryConfig` for source maps and component annotations.
- `error.tsx` calls `Sentry.captureException` in a `useEffect`. Pass `error.digest` as extra context.
- `instrumentation.ts` exports `onRequestError = Sentry.captureRequestError` for server-side capture.
- Three capture layers: error boundary (React errors), instrumentation (server errors), global handlers (unhandled).

## References

- Sentry Next.js guide: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Sentry source maps: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#configure-source-maps
- Session replay: https://docs.sentry.io/platforms/javascript/session-replay/

## Verification

1. Create a test page that throws an error
2. Visit in production mode (`bun build && bun start`)
3. Check Sentry Issues dashboard for the error with stack trace and route context
4. Delete the test page after verification
