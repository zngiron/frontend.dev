# Payments

Stripe and PayMongo integration.

---

## Dependencies

```bash
bun add stripe
bun add paymongo-node
```

## Env Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
PAYMONGO_SECRET_KEY=sk_test_...
PAYMONGO_PUBLIC_KEY=pk_test_...
PAYMONGO_WEBHOOK_SECRET=whsec_...
```

| Variable | Browser | Required |
|---|---|---|
| `STRIPE_SECRET_KEY` | No | Yes |
| `STRIPE_WEBHOOK_SECRET` | No | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Yes |
| `PAYMONGO_SECRET_KEY` | No | Yes |
| `PAYMONGO_PUBLIC_KEY` | Yes | Yes |
| `PAYMONGO_WEBHOOK_SECRET` | No | Yes |

Update `src/lib/env.ts` to include all six.

## File Structure

```
src/lib/payments/
├── stripe.ts       → Stripe client singleton
└── paymongo.ts     → PayMongo client singleton

src/app/api/webhooks/
├── stripe/route.ts
└── paymongo/route.ts
```

## Implementation

### Stripe Client

`src/lib/payments/stripe.ts` — server-only:

```ts
import Stripe from "stripe"

import { env } from "@/lib/env"

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
})
```

### Checkout Session

```ts
"use server"

import { redirect } from "next/navigation"

import { env } from "@/lib/env"
import { stripe } from "@/lib/payments/stripe"

export async function createCheckoutSession(priceId: string, userId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
    metadata: { userId },
  })
  if (!session.url) throw new Error("Failed to create Stripe Checkout session.")
  redirect(session.url)
}
```

### Stripe Webhook

`src/app/api/webhooks/stripe/route.ts`:

```ts
import type { Stripe } from "stripe"

import { headers } from "next/headers"

import { env } from "@/lib/env"
import { stripe } from "@/lib/payments/stripe"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) return new Response("Missing stripe-signature header.", { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return new Response(`Webhook verification failed: ${message}`, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed":
      // Fulfill order
      break
    case "customer.subscription.created":
    case "customer.subscription.updated":
      // Update subscription in DB
      break
    case "customer.subscription.deleted":
      // Revoke access
      break
    case "invoice.payment_failed":
      // Notify customer
      break
  }

  return new Response(null, { status: 200 })
}
```

### PayMongo Client

`src/lib/payments/paymongo.ts` — server-only:

```ts
import PayMongo from "paymongo-node"

import { env } from "@/lib/env"

export const paymongo = new PayMongo(env.PAYMONGO_SECRET_KEY)
```

### PayMongo Payment Intent

```ts
"use server"

import { paymongo } from "@/lib/payments/paymongo"

export async function createPaymentIntent(amountInCentavos: number) {
  const paymentIntent = await paymongo.paymentIntents.create({
    data: {
      attributes: {
        amount: amountInCentavos,
        currency: "PHP",
        payment_method_allowed: ["gcash", "card", "paymaya"],
        capture_type: "automatic",
      },
    },
  })
  return paymentIntent.data
}
```

### PayMongo Webhook

`src/app/api/webhooks/paymongo/route.ts` — verify `X-Paymongo-Signature` with HMAC-SHA256:

```ts
import { createHmac, timingSafeEqual } from "crypto"

import { env } from "@/lib/env"

function verifyPayMongoSignature(rawBody: string, signature: string, secret: string): boolean {
  const [, timestampPart, testSigPart, liveSigPart] = signature.split(",")
  const timestamp = timestampPart?.split("=")[1]
  const receivedSig = testSigPart?.split("=")[1] ?? liveSigPart?.split("=")[1]
  if (!timestamp || !receivedSig) return false

  const payload = `${timestamp}.${rawBody}`
  const expectedSig = createHmac("sha256", secret).update(payload).digest("hex")
  return timingSafeEqual(Buffer.from(receivedSig, "hex"), Buffer.from(expectedSig, "hex"))
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("x-paymongo-signature")
  if (!signature) return new Response("Missing signature.", { status: 400 })
  if (!verifyPayMongoSignature(body, signature, env.PAYMONGO_WEBHOOK_SECRET)) {
    return new Response("Verification failed.", { status: 400 })
  }

  const event = JSON.parse(body) as { data: { attributes: { type: string; data: unknown } } }

  switch (event.data.attributes.type) {
    case "payment.paid":
      // Fulfill order
      break
    case "payment.failed":
      // Notify customer
      break
    case "source.chargeable":
      // Create payment immediately
      break
  }

  return new Response(null, { status: 200 })
}
```

## Common Patterns

### Recurring Billing

Use `mode: "subscription"` in Stripe Checkout. Store `subscription.id` and `customer.id` from the `checkout.session.completed` webhook.

### Customer Portal

```ts
"use server"

import { redirect } from "next/navigation"

import { env } from "@/lib/env"
import { stripe } from "@/lib/payments/stripe"

export async function openCustomerPortal(stripeCustomerId: string) {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
  redirect(portalSession.url)
}
```

Listen to `customer.subscription.updated` and `customer.subscription.deleted` to sync DB.

## Verification

### Stripe

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

### PayMongo

Use ngrok (`ngrok http 3000`) → register webhook URL in PayMongo dashboard → use "Send Test Event".
