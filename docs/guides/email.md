# Email

Transactional email via Resend.

---

## Dependencies

```bash
bun add resend
```

## Env Variables

```env
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=hello@yourdomain.com
```

Both server-only. Update `src/lib/env.ts`.

## Implementation

`src/lib/email/resend.ts` — server-only:

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

  if (error) return { success: false, error: error.message }
  return { success: true, id: data.id }
}
```

## Common Patterns

### Welcome Email

```ts
await sendEmail({
  to: user.email,
  subject: "Welcome to the platform",
  html: `<p>Hi ${user.name}, your account is ready.</p>`,
})
```

### Password Reset

```ts
await sendEmail({
  to: user.email,
  subject: "Reset your password",
  html: `<p><a href="${resetUrl}">Reset your password</a>. Expires in 1 hour.</p>`,
})
```

## Verification

1. Add env vars to `.env.local` → `bun dev`
2. Trigger a Server Action calling `sendEmail` with your address
3. Confirm `success: true` in logs and email arrives
