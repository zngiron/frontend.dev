# Payments — PayMongo

**Stack:** PayMongo

---

## When To Use

**Use for:** Philippine local payments (GCash, PayMaya, card).

## Dependencies

```bash
bun add paymongo-node
```

## Env Variables

| Variable | Browser | Required |
|---|---|---|
| `PAYMONGO_SECRET_KEY` | No | Yes |
| `PAYMONGO_PUBLIC_KEY` | Yes | Yes |
| `PAYMONGO_WEBHOOK_SECRET` | No | Yes |

Update `src/lib/env.ts`.

## File Placement

```
src/lib/payments/
└── paymongo.ts     → PayMongo client singleton (server-only)

src/app/api/webhooks/
└── paymongo/route.ts → PayMongo webhook handler
```

## Conventions

- Client singleton in `lib/payments/paymongo.ts`, server-only. Never import in client components.
- Webhook handler verifies signatures with HMAC-SHA256 using `timingSafeEqual`.
- Payment intents → Server Actions.

## References

- PayMongo API: https://developers.paymongo.com/reference
- PayMongo webhooks: https://developers.paymongo.com/docs/webhooks

## Verification

Use ngrok (`ngrok http 3000`) → register webhook URL in PayMongo dashboard → use "Send Test Event".
