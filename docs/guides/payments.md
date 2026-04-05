# Payments Setup Guide

> **Purpose:** Step-by-step guide for integrating Stripe and PayMongo payment processing into the project.
>
> **Last Updated:** 2026-04-06
>
> **Status:** Active

---

## Prerequisites

- A [Stripe](https://stripe.com) account with API keys available in the Stripe Dashboard under **Developers > API keys**
- A [PayMongo](https://paymongo.com) account with API keys available in the PayMongo Dashboard under **Developers > API keys**
- Both accounts should be in test mode during development; switch to live keys only in production

## Dependencies

Install the Stripe Node.js SDK:

```bash
bun add stripe
```

Install the PayMongo SDK:

```bash
bun add paymongo-node
```

## File Structure

```
src/lib/payments/
├── stripe.ts          ← Stripe client singleton
└── paymongo.ts        ← PayMongo client singleton

src/app/api/webhooks/
├── stripe/
│   └── route.ts       ← Stripe webhook handler
└── paymongo/
    └── route.ts       ← PayMongo webhook handler
```

> **Note:** Webhook handlers use standard Route Handlers (`app/api/`), which are unchanged in Next.js 16. The `proxy.ts` rename affects only the root request interceptor — webhook routes are unaffected.

## Step-By-Step Implementation

### 1. Add Environment Variables

Add the following to `.env.example`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayMongo
PAYMONGO_SECRET_KEY=sk_test_...
PAYMONGO_PUBLIC_KEY=pk_test_...
PAYMONGO_WEBHOOK_SECRET=whsec_...
```

Copy to `.env.local` and replace with your actual values.

### 2. Update The Environment Schema

Extend `src/lib/env.ts` to include the payment variables:

```ts
import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("App Name"),
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  // PayMongo
  PAYMONGO_SECRET_KEY: z.string().min(1),
  PAYMONGO_PUBLIC_KEY: z.string().min(1),
  PAYMONGO_WEBHOOK_SECRET: z.string().min(1),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  PAYMONGO_SECRET_KEY: process.env.PAYMONGO_SECRET_KEY,
  PAYMONGO_PUBLIC_KEY: process.env.PAYMONGO_PUBLIC_KEY,
  PAYMONGO_WEBHOOK_SECRET: process.env.PAYMONGO_WEBHOOK_SECRET,
})
```

### 3. Create The Stripe Client

`src/lib/payments/stripe.ts` — server-only singleton. Never import this in Client Components.

```ts
import Stripe from "stripe"

import { env } from "@/lib/env"

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
})
```

### 4. Create A Checkout Session

Use a Server Action or Route Handler to create a Stripe Checkout session. The following example uses a Server Action:

```ts
"use server"

import { redirect } from "next/navigation"

import { env } from "@/lib/env"
import { stripe } from "@/lib/payments/stripe"

export async function createCheckoutSession(priceId: string, userId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
    metadata: {
      userId,
    },
  })

  if (!session.url) {
    throw new Error("Failed to create Stripe Checkout session.")
  }

  redirect(session.url)
}
```

### 5. Create The Stripe Webhook Handler

`src/app/api/webhooks/stripe/route.ts` — receives and verifies all Stripe events.

```ts
import type { Stripe } from "stripe"

import { headers } from "next/headers"

import { env } from "@/lib/env"
import { stripe } from "@/lib/payments/stripe"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return new Response("Missing stripe-signature header.", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return new Response(`Webhook signature verification failed: ${message}`, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      // Fulfill the order — provision access, update the database, send confirmation email, etc.
      console.log("Checkout session completed:", session.id)
      break
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      // Update the subscription status in the database.
      console.log("Subscription updated:", subscription.id, subscription.status)
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      // Revoke access — subscription has ended or been cancelled.
      console.log("Subscription deleted:", subscription.id)
      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice
      // Notify the customer and trigger dunning logic if required.
      console.log("Payment failed for invoice:", invoice.id)
      break
    }

    default:
      // Unhandled event type — safe to ignore.
      break
  }

  return new Response(null, { status: 200 })
}
```

### 6. Create The PayMongo Client

`src/lib/payments/paymongo.ts` — server-only singleton. Never import this in Client Components.

```ts
import PayMongo from "paymongo-node"

import { env } from "@/lib/env"

export const paymongo = new PayMongo(env.PAYMONGO_SECRET_KEY)
```

### 7. Create A PayMongo Payment Intent

```ts
"use server"

import { env } from "@/lib/env"
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

### 8. Create The PayMongo Webhook Handler

`src/app/api/webhooks/paymongo/route.ts` — receives and verifies all PayMongo events.

PayMongo sends webhook events signed with an HMAC-SHA256 signature. Verify the `X-Paymongo-Signature` header before processing any event.

```ts
import { createHmac, timingSafeEqual } from "crypto"

import { env } from "@/lib/env"

function verifyPayMongoSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const [, timestampPart, testSigPart, liveSigPart] = signature.split(",")
  const timestamp = timestampPart?.split("=")[1]
  const receivedSig = testSigPart?.split("=")[1] ?? liveSigPart?.split("=")[1]

  if (!timestamp || !receivedSig) return false

  const payload = `${timestamp}.${rawBody}`
  const expectedSig = createHmac("sha256", secret).update(payload).digest("hex")

  return timingSafeEqual(
    Buffer.from(receivedSig, "hex"),
    Buffer.from(expectedSig, "hex")
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("x-paymongo-signature")

  if (!signature) {
    return new Response("Missing x-paymongo-signature header.", { status: 400 })
  }

  const isValid = verifyPayMongoSignature(body, signature, env.PAYMONGO_WEBHOOK_SECRET)

  if (!isValid) {
    return new Response("Webhook signature verification failed.", { status: 400 })
  }

  const event = JSON.parse(body) as { data: { attributes: { type: string; data: unknown } } }
  const eventType = event.data.attributes.type

  switch (eventType) {
    case "payment.paid": {
      // Payment was successfully captured — fulfill the order.
      console.log("PayMongo payment paid:", event.data)
      break
    }

    case "payment.failed": {
      // Payment capture failed — notify the customer.
      console.log("PayMongo payment failed:", event.data)
      break
    }

    case "source.chargeable": {
      // Source (e.g., GCash) is ready to be charged — create a payment immediately.
      console.log("PayMongo source chargeable:", event.data)
      break
    }

    default:
      break
  }

  return new Response(null, { status: 200 })
}
```

## Environment Variables

| Variable | Description | Exposed To Browser |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key — used to authenticate server-side API calls | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret — used to verify incoming webhook payloads | No |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key — safe to expose; used to initialize Stripe.js on the client | Yes |
| `PAYMONGO_SECRET_KEY` | PayMongo secret key — used to authenticate server-side API calls | No |
| `PAYMONGO_PUBLIC_KEY` | PayMongo public key — used on the client to create payment methods | Yes |
| `PAYMONGO_WEBHOOK_SECRET` | PayMongo webhook signing secret — used to verify incoming webhook payloads | No |

`NEXT_PUBLIC_` prefixed variables are embedded in the browser bundle at build time. All other payment variables must remain server-side only and must never be imported into Client Components or passed as props to the client.

## Common Patterns

### Recurring Billing

Use Stripe's `subscription` mode in the Checkout session to handle recurring billing:

```ts
const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [{ price: recurringPriceId, quantity: 1 }],
  success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
  cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
  metadata: { userId },
})
```

Store the `subscription.id` and `customer.id` returned in the `checkout.session.completed` webhook event against the user record in the database.

### Plan Management

To allow users to upgrade, downgrade, or cancel their subscription, use the Stripe Customer Portal:

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

Listen to the `customer.subscription.updated` and `customer.subscription.deleted` webhook events to keep the database in sync with plan changes made through the portal.

## Verification

### Testing Stripe Webhooks Locally

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli): `brew install stripe/stripe-cli/stripe`
2. Log in to the CLI: `stripe login`
3. Forward webhook events to the local dev server:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. The CLI will print a webhook signing secret (prefixed `whsec_`). Copy this value into `STRIPE_WEBHOOK_SECRET` in `.env.local`.
5. Trigger a test event in a second terminal to confirm the handler is receiving events correctly:

   ```bash
   stripe trigger checkout.session.completed
   ```

6. Confirm the handler logs the expected output and returns a `200` response in the terminal running `stripe listen`.

### Testing PayMongo Webhooks

PayMongo does not provide a local forwarding CLI. Use a tunneling tool such as [ngrok](https://ngrok.com) to expose the local dev server:

1. Start the dev server: `bun dev`
2. In a second terminal, start ngrok: `ngrok http 3000`
3. Copy the generated HTTPS URL (e.g., `https://abc123.ngrok.io`) and register it as a webhook endpoint in the PayMongo Dashboard under **Developers > Webhooks**, pointing to `https://abc123.ngrok.io/api/webhooks/paymongo`.
4. Copy the webhook secret from the dashboard into `PAYMONGO_WEBHOOK_SECRET` in `.env.local`.
5. Use the PayMongo Dashboard's **Send Test Event** feature to trigger a `payment.paid` event and verify the handler logs and response.
