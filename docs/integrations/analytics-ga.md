# Analytics — Google Analytics 4

**Stack:** Google Analytics 4 (via `next/script`)

---

## When To Use

**Use for:** custom event tracking, audience segmentation, marketing attribution.

Can run simultaneously with Vercel Analytics.

## Dependencies

None. Loaded via `next/script` — no npm package needed.

## Env Variables

| Variable | Browser | Required |
|---|---|---|
| `NEXT_PUBLIC_ANALYTICS_ID` | Yes | No (omitting disables GA4 silently) |

Update `src/lib/env.ts` (optional field).

## File Placement

```
src/components/core/
└── analytics-provider.tsx → Client component, renders in production only (shared with Vercel Analytics)

src/lib/
└── analytics.ts → Custom event tracking utility (gtag wrapper, no-ops when unavailable)

src/types/
└── gtag.d.ts → Window.gtag type declaration
```

## Conventions

- GA4 script loaded via `next/script` with `strategy="afterInteractive"`.
- Production-only: check `process.env.NODE_ENV === 'production'` before rendering scripts.
- Custom events: use a `trackEvent` utility that no-ops when `gtag` is unavailable.

## References

- GA4 setup: https://developers.google.com/analytics/devguides/collection/ga4
- next/script: https://nextjs.org/docs/app/api-reference/components/script

## Verification

1. `bun build && bun start`
2. DevTools Network → filter `gtag` → confirm `200`
3. GA4 dashboard → Realtime → confirm hits
