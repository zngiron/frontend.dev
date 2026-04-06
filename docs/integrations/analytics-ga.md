# Analytics — Google Analytics

**Stack:** Google Analytics (via `@next/third-parties`)

---

## When To Use

**Use for:** custom event tracking, audience segmentation, marketing attribution.

Can run simultaneously with Vercel Analytics.

## Dependencies

```bash
bun add @next/third-parties
```

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
└── analytics.ts → Custom event tracking utility (sendGAEvent wrapper, no-ops when unavailable)
```

## Conventions

- Use `<GoogleAnalytics gaId={id} />` from `@next/third-parties/google` in root layout or analytics provider.
- Production-only: check `process.env.NODE_ENV === 'production'` before rendering.
- Custom events: use `sendGAEvent` from `@next/third-parties/google`. Wrap in a `trackEvent` utility that no-ops when the analytics ID is unavailable.
- No manual `gtag.d.ts` needed — types are provided by the package.

## References

- @next/third-parties Google Analytics: https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-analytics
- GA4 setup: https://developers.google.com/analytics/devguides/collection/ga4

## Verification

1. `bun build && bun start`
2. DevTools Network → filter `gtag` → confirm `200`
3. GA4 dashboard → Realtime → confirm hits
