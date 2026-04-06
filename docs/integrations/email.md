# Email

**Stack:** Resend

---

## When To Use

**Use for:** transactional email (welcome, password reset, receipts, notifications).

**Don't use for:** marketing campaigns (use Resend's broadcast feature or a dedicated ESP).

## Dependencies

```bash
bun add resend
```

## Env Variables

| Variable | Browser | Required |
|---|---|---|
| `RESEND_API_KEY` | No | Yes |
| `RESEND_FROM_EMAIL` | No | Yes |

Update `src/lib/env.ts`.

## File Placement

```
src/lib/email/
└── resend.ts → Server-only email sender utility
```

## Conventions

- Single `sendEmail` function that wraps `resend.emails.send` with the project's `from` address.
- Return a discriminated union result type (success with ID, or failure with error message).
- Always provide both `html` and `text` for email accessibility.
- Call from Server Actions only, never from client components.

## References

- Resend docs: https://resend.com/docs/introduction
- Resend Next.js guide: https://resend.com/docs/send-with-nextjs

## Verification

1. Add env vars to `.env.local` → `bun dev`
2. Trigger a Server Action calling `sendEmail` with your address
3. Confirm `success: true` in logs and email arrives
