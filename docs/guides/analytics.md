# Analytics Setup Guide

> **Purpose:** Step-by-step guide for adding Google Analytics 4 and Vercel Analytics to the project.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

## Prerequisites

Both integrations are optional and only active in production. Omitting an env variable disables the corresponding provider silently.

- **GA4:** A Google Analytics 4 property. Retrieve the Measurement ID (`G-XXXXXXXXXX`) from **Admin > Data Streams > Measurement ID**.
- **Vercel Analytics:** Enable in the Vercel dashboard under **[Project] > Analytics > Enable**.

## Dependencies

```bash
bun add @vercel/analytics
```

Skip if using GA4 only.

## File Structure

```
src/components/
└── analytics-provider.tsx

src/lib/
└── analytics.ts

src/types/
└── gtag.d.ts
```

## Step-By-Step Implementation

### 1. Add Environment Variables

Add to `.env.example`:

```env
NEXT_PUBLIC_ANALYTICS_ID=
```

### 2. Update The Environment Schema

Extend `src/lib/env.ts`:

```ts
import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
})
```

### 3. Create The Analytics Provider

`src/components/analytics-provider.tsx` — only renders in production (`process.env.NODE_ENV === "production"`):

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

Remove the `@vercel/analytics` import and `<VercelAnalytics />` if not using Vercel Analytics.

### 4. Register In The Root Layout

Add `<AnalyticsProvider />` at the end of `<body>` in `src/app/layout.tsx`:

```tsx
import { AnalyticsProvider } from "@/components/analytics-provider"

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {children}
        <AnalyticsProvider />
      </body>
    </html>
  )
}
```

### 5. Custom Event Tracking

Create `src/lib/analytics.ts`:

```ts
type GtagEventParams = Record<string, string | number | boolean | undefined>

export function trackEvent(eventName: string, params?: GtagEventParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return
  }

  window.gtag("event", eventName, params)
}
```

Declare the global in `src/types/gtag.d.ts`:

```ts
interface Window {
  dataLayer: unknown[]
  gtag: (...args: unknown[]) => void
}
```

Usage:

```tsx
"use client"

import { trackEvent } from "@/lib/analytics"

export function SignUpButton() {
  return (
    <button onClick={() => trackEvent("sign_up_click", { location: "hero" })}>
      Sign Up
    </button>
  )
}
```

`trackEvent` is a no-op when `gtag` is unavailable, so it is safe to call unconditionally.

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_ANALYTICS_ID` | GA4 Measurement ID (`G-XXXXXXXXXX`) | No |

GA4 Measurement IDs are public by design. No server-only variables are needed.

## Verification

1. Run a production build: `bun build && bun start`.
2. Open **DevTools > Network** and filter by `gtag`. Confirm a `200` response.
3. For Vercel Analytics, filter by `/_vercel/insights` and confirm requests on page load.
4. In the GA4 dashboard, navigate to **Reports > Realtime** to confirm live hits.
