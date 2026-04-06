# Metadata And SEO

Per-page metadata, dynamic OG images, and structured data.

---

## Dependencies

None. Uses built-in Next.js Metadata API.

## Implementation

### Static Metadata

For pages with fixed metadata, export a `metadata` object:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for every team.',
}

export default function PricingPage() { ... }
```

`title` uses the template from root `layout.tsx` → renders as `"Pricing | Site Title"`.

### Dynamic Metadata

For pages with data-driven metadata, export `generateMetadata`:

```tsx
import type { Metadata } from 'next'

import { getPost } from '@/lib/services/post.service'

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Not Found' }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
    },
  }
}
```

`generateMetadata` is deduplicated with `React.cache` — if `getPost` is cached, the page and metadata share the same request.

### OG Image Route

`src/app/og/route.tsx` — generates dynamic social images:

```tsx
import type { NextRequest } from 'next/server'

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') ?? 'Default Title'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          color: '#fff',
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        {title}
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

Reference in metadata:

```ts
openGraph: {
  images: [`/og?title=${encodeURIComponent(post.title)}`],
}
```

### Structured Data (JSON-LD)

Add JSON-LD to pages for rich search results:

```tsx
export default async function BlogPost({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params
  const post = await getPost(slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: post.author.name },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>{/* ... */}</article>
    </>
  )
}
```

## Common Patterns

### Canonical URLs

```ts
export const metadata: Metadata = {
  alternates: { canonical: '/pricing' },
}
```

### No-Index Pages

```ts
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
```

### Sitemap

`src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'

import { env } from '@/lib/env'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['/', '/pricing', '/about'].map((route) => ({
    url: `${env.NEXT_PUBLIC_SITE_URL}${route}`,
    lastModified: new Date(),
  }))

  return staticRoutes
}
```

Add dynamic routes by fetching slugs from the database.

### Per-Route Group Defaults

Each route group layout can set baseline metadata:

```ts
// src/app/(marketing)/layout.tsx
export const metadata: Metadata = {
  openGraph: { type: 'website' },
}
```

Child pages merge with and override parent metadata.

## Verification

1. View page source → `<title>`, `<meta>` tags present
2. Social preview tool → OG image, title, description render correctly
3. Google Rich Results Test → structured data validates
4. `sitemap.xml` → accessible at `/sitemap.xml`
