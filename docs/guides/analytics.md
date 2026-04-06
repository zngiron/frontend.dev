# Analytics

Google Analytics 4 and Vercel Analytics.

---

## Dependencies

```bash
bun add @vercel/analytics
```

Skip if using GA4 only.

## Env Variables

```env
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
```

Optional. Omitting disables GA4 silently. Update `src/lib/env.ts`.

## Implementation

### Analytics Provider

`src/components/analytics-provider.tsx` — renders in production only:

```tsx
"use client"

import Script from "next/script"

import { Analytics as VercelAnalytics } from "@vercel/analytics/react"

import { env } from "@/lib/env"

const isProduction = process.env.NODE_ENV === "production"

export function AnalyticsProvider() {
  if (!isProduction) return null

  return (
    <>
      {env.NEXT_PUBLIC_ANALYTICS_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_ANALYTICS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${env.NEXT_PUBLIC_ANALYTICS_ID}');
            `}
          </Script>
        </>
      )}
      <VercelAnalytics />
    </>
  )
}
```

### Root Layout

Add `<AnalyticsProvider />` at the end of `<body>` in `layout.tsx`.

### Custom Events

`src/lib/analytics.ts`:

```ts
type GtagEventParams = Record<string, string | number | boolean | undefined>

export function trackEvent(eventName: string, params?: GtagEventParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  window.gtag("event", eventName, params)
}
```

`src/types/gtag.d.ts`:

```ts
interface Window {
  dataLayer: unknown[]
  gtag: (...args: unknown[]) => void
}
```

`trackEvent` is a no-op when `gtag` is unavailable.

## Verification

1. `bun build && bun start`
2. DevTools Network → filter `gtag` → confirm `200`
3. Vercel Analytics: filter `/_vercel/insights`
4. GA4 dashboard → **Realtime** → confirm hits
