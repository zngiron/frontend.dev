# Email Setup Guide

> **Purpose:** Step-by-step guide for adding transactional email to the project using Resend.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

## Prerequisites

- Resend account created at [resend.com](https://resend.com)
- Domain verified in the Resend dashboard under **Domains**

## Dependencies

```bash
bun add resend
```

## File Structure

```
src/lib/email/
└── resend.ts      ← Resend client and send email function
```

## Step-By-Step Implementation

### 1. Update The Environment Schema

Extend `src/lib/env.ts` to include the Resend variables:

```ts
import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("App Name"),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
})
```

### 2. Create The Resend Client And Send Function

`src/lib/email/resend.ts` — server-only. Never import this module in Client Components or expose it to the browser.

```ts
import { Resend } from "resend"

import { env } from "@/lib/env"

const resend = new Resend(env.RESEND_API_KEY)

type SendEmailOptions = {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

type SendEmailResult =
  | { success: true; id: string }
  | { success: false; error: string }

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, id: data.id }
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RESEND_API_KEY` | Resend API key from the dashboard | Yes |
| `RESEND_FROM_EMAIL` | Verified sender address (e.g. `hello@yourdomain.com`) | Yes |

Add the following to `.env.example`:

```env
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=hello@yourdomain.com
```

Copy to `.env.local` and replace with your actual values. These variables are server-only — do not prefix them with `NEXT_PUBLIC_`.

## Common Patterns

### Welcome Email

Send a welcome email from a Server Action after a user registers:

```ts
import { sendEmail } from "@/lib/email/resend"

await sendEmail({
  to: user.email,
  subject: "Welcome to the platform",
  html: `<p>Hi ${user.name}, your account is ready.</p>`,
  text: `Hi ${user.name}, your account is ready.`,
})
```

### Password Reset

Send a time-limited reset link from a Server Action:

```ts
import { sendEmail } from "@/lib/email/resend"

await sendEmail({
  to: user.email,
  subject: "Reset your password",
  html: `<p><a href="${resetUrl}">Reset your password</a>. This link expires in 1 hour.</p>`,
  text: `Reset your password: ${resetUrl}. This link expires in 1 hour.`,
})
```

### Transactional Notification

Notify a user of an account or order event:

```ts
import { sendEmail } from "@/lib/email/resend"

await sendEmail({
  to: user.email,
  subject: "Your order has shipped",
  html: `<p>Order <strong>#${order.id}</strong> is on its way. Track it here: <a href="${trackingUrl}">${trackingUrl}</a></p>`,
  text: `Order #${order.id} is on its way. Track it here: ${trackingUrl}`,
})
```

## Verification

1. Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to `.env.local`
2. Start the dev server: `bun dev`
3. Trigger a Server Action that calls `sendEmail` with your own address as the recipient
4. Confirm the result has `success: true` and an `id` in the server logs
5. Check your inbox — the email should arrive within a few seconds
6. Verify the sender domain, subject line, and body match the values passed to `sendEmail`
