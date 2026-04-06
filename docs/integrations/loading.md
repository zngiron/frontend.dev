# Loading And Streaming

**Stack:** Next.js Loading UI + React Suspense

---

## When To Use

**`loading.tsx`:** route-level loading states. Automatically wraps the page in a Suspense boundary.

**`<Suspense>`:** granular loading states within a page. Wrap individual async components to stream them independently.

## Dependencies

None. Built-in Next.js and React features.

## File Placement

```
src/app/[route]/
└── loading.tsx       → Route-level loading (one per route segment)

src/components/ui/
└── skeleton.tsx      → Reusable skeleton component (install via shadcn)
```

## Conventions

- Every route with async data should have a `loading.tsx`.
- Use `<Suspense fallback={...}>` inside pages to stream independent data sections in parallel.
- Skeleton components from shadcn/ui for consistent loading appearance.
- Do not show loading states for data that's already cached or instant.
- Nest Suspense boundaries for progressive loading: shell first, then sections.

## References

- Next.js Loading UI: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
- React Suspense: https://react.dev/reference/react/Suspense
- Streaming with Suspense: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming#streaming-with-suspense

## Verification

1. Navigate to a route with `loading.tsx` → loading state appears instantly
2. Async sections wrapped in Suspense stream in progressively
3. Fast-cached data renders without flashing a loading state
