# Metadata And SEO

**Stack:** Next.js Metadata API (built-in)

---

## When To Use

**Use for:** page titles, descriptions, OG images, structured data (JSON-LD), sitemaps, canonical URLs.

## Dependencies

None. Uses built-in Next.js Metadata API.

## File Placement

```
src/app/
├── layout.tsx        → Root metadata with title template
├── sitemap.ts        → Dynamic sitemap generation
├── robots.ts         → Robots.txt generation
├── og/route.tsx      → Dynamic OG image generation (edge runtime)
└── [route]/page.tsx  → Per-page metadata export
```

## Conventions

- Static metadata: export `metadata` object from `page.tsx` or `layout.tsx`.
- Dynamic metadata: export `generateMetadata` async function with `PageProps<'/route'>` type.
- Title uses template from root layout → renders as `"Page Title | Site Title"`.
- `generateMetadata` deduplicates with `cache` from `react` — if the data function is cached, the page and metadata share the same request. Use `import { cache } from 'react'` not `React.cache`.
- OG images: `ImageResponse` from `next/og` at `src/app/og/route.tsx` with `runtime = 'edge'`.
- JSON-LD: use the `StructuredData` component from `components/core/` for site-wide schemas. Per-page schemas go inline in the page component.
- Canonical URLs: set via `alternates.canonical` in metadata.
- No-index pages: set via `robots: { index: false, follow: false }` in metadata.
- Route group layouts can set baseline metadata that child pages merge with and override.

## References

- Next.js Metadata API: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Next.js generateMetadata: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js OG Image Generation: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
- Next.js sitemap: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- Google Rich Results Test: https://search.google.com/test/rich-results

## Verification

1. View page source → `<title>`, `<meta>` tags present
2. Social preview tool → OG image, title, description render correctly
3. Google Rich Results Test → structured data validates
4. `sitemap.xml` → accessible at `/sitemap.xml`
