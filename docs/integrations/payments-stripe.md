# Payments — Stripe

**Stack:** Stripe

---

## When To Use

**Use for:** international payments, subscriptions, customer portal.

## Dependencies

```bash
bun add stripe
```

## Env Variables

| Variable | Browser | Required |
|---|---|---|
| `STRIPE_SECRET_KEY` | No | Yes |
| `STRIPE_WEBHOOK_SECRET` | No | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Yes |

Update `src/lib/env.ts`.

## File Placement

```
src/lib/payments/
└── stripe.ts       → Stripe client singleton (server-only)

src/app/api/webhooks/
└── stripe/route.ts   → Stripe webhook handler
```

## Conventions

- Client singleton in `lib/payments/stripe.ts`, server-only. Never import in client components.
- Webhook handler verifies signatures with `stripe.webhooks.constructEvent`.
- Checkout sessions, payment intents, portal sessions → Server Actions.
- Store `subscription.id` and `customer.id` from webhooks, not from client-side responses.
- Listen to `customer.subscription.updated` and `customer.subscription.deleted` to sync DB.

## References

- Stripe Next.js guide: https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=stripe-hosted
- Stripe webhooks: https://docs.stripe.com/webhooks
- Stripe customer portal: https://docs.stripe.com/billing/subscriptions/integrating-customer-portal

## Verification

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```
