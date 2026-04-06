# Analytics — Vercel

**Stack:** `@vercel/analytics`

---

## When To Use

**Use for:** Core Web Vitals, page views, automatic tracking on Vercel deployments.

## Dependencies

```bash
bun add @vercel/analytics
```

## File Placement

```
src/components/core/
└── analytics-provider.tsx → Client component, renders in production only
```

## Conventions

- `<Analytics />` component from `@vercel/analytics/react` added to root layout `<body>`.
- Production-only: check `process.env.NODE_ENV === 'production'` before rendering.
- Zero-config on Vercel deployments — just add the component.

## References

- Vercel Analytics: https://vercel.com/docs/analytics

## Verification

1. `bun build && bun start`
2. DevTools Network → filter `/_vercel/insights` → confirm requests
