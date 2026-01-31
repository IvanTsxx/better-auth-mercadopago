# better-auth-mercadopago

<p align="center">
  <strong>Mercado Pago plugin for Better Auth</strong><br/>
  Simple payments, subscriptions and split payments integration for your Better Auth application
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/better-auth-mercadopago">
    <img src="https://img.shields.io/npm/v/better-auth-mercadopago.svg" alt="npm version" />
  </a>
  <a href="https://github.com/ivantsxx/better-auth-mercadopago/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/better-auth-mercadopago.svg" alt="license" />
  </a>
  <a href="https://www.npmjs.com/package/better-auth-mercadopago">
    <img src="https://img.shields.io/npm/dm/better-auth-mercadopago.svg" alt="downloads" />
  </a>
</p>

---

## Table of Contents

- [What is this?](#what-is-this)
- [Features](#features)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Server Configuration](#server-configuration)
- [Client Configuration](#client-configuration)
- [Database Schema Generation](#database-schema-generation)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## What is this?

`better-auth-mercadopago` is a plugin that seamlessly integrates [Mercado Pago](https://www.mercadopago.com) payments into your [Better Auth](https://github.com/better-auth/better-auth) authentication system. It provides a type-safe API for handling payments, subscriptions, and webhooks, all within the Better Auth ecosystem.

---

## Features

| Feature | Description |
|---------|-------------|
| **One-time payments** | Create payment preferences with automatic checkout URLs |
| **Webhook handling** | Secure webhook processing with signature verification |
| **Type-safe API** | Full TypeScript support for both client and server |
| **Prisma integration** | Automatic database schema generation via Better Auth CLI |
| **Security features** | Rate limiting, idempotency keys, webhook signature verification |
| **Payment validation** | Amount verification to prevent tampering |

---

## Installation

```bash
npm install better-auth-mercadopago
```

Or using pnpm:

```bash
pnpm add better-auth-mercadopago
```

Or using yarn:

```bash
yarn add better-auth-mercadopago
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MP_ACCESS_TOKEN` | Yes | Your Mercado Pago access token |
| `MP_WEBHOOK_SECRET` | No (recommended) | Secret for webhook signature verification |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL (for Next.js) |
| `APP_URL` | No | Base URL for redirects and webhooks |

Example `.env` file:

```env
# Required
MP_ACCESS_TOKEN=your_mercado_pago_access_token

# Optional but recommended for production
MP_WEBHOOK_SECRET=your_webhook_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

---

## Server Configuration

Create or update your `auth.ts` file:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { mercadoPagoPlugin } from "better-auth-mercadopago";
import { prisma } from "./prisma";

const env = process.env;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  plugins: [
    mercadoPagoPlugin({
      accessToken: env.MP_ACCESS_TOKEN!,
      baseUrl: env.APP_URL || "http://localhost:3000",
      webhookSecret: env.MP_WEBHOOK_SECRET, // Optional but recommended
      
      // Optional callbacks
      onPaymentUpdate: async ({ payment, status, mpPayment }) => {
        console.log(`Payment ${payment.id} updated to ${status}`);
        // Send email, update user status, etc.
      },
    }),
  ],
});
```

---

## Client Configuration

Create or update your `auth-client.ts` file:

```typescript
import { createAuthClient } from "better-auth/react";
import { mercadoPagoClientPlugin } from "better-auth-mercadopago";

const env = process.env;

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [mercadoPagoClientPlugin()],
});

export const { signIn, signUp, signOut, useSession, mercadoPago } = authClient;
```

---

## Database Schema Generation

After configuring the plugin, generate the Prisma schema:

```bash
pnpm dlx @better-auth/cli@latest generate
```

This creates the necessary database tables for the plugin to function.

### Database Schema

The plugin defines the following table:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Internal UUID |
| `externalReference` | string | Yes | Unique reference for MP |
| `userId` | string | Yes | Link to auth user |
| `mercadoPagoPaymentId` | string | No | MP's payment ID |
| `preferenceId` | string | Yes | MP's preference ID |
| `status` | string | Yes | pending, approved, rejected, etc. |
| `statusDetail` | string | No | Detailed status |
| `amount` | number | Yes | Payment amount |
| `currency` | string | Yes | Currency code (ARS, USD, etc.) |
| `paymentMethodId` | string | No | visa, master, pix, etc. |
| `paymentTypeId` | string | No | credit_card, debit_card, etc. |
| `metadata` | string | No | JSON stringified metadata |
| `createdAt` | date | Yes | Creation timestamp |
| `updatedAt` | date | Yes | Last update timestamp |

---

## Usage Examples

### Creating a One-Time Payment

```typescript
import { authClient } from "./auth-client";

async function createPayment() {
  const { data, error } = await authClient.mercadoPago.createPayment({
    items: [
      {
        id: "prod_123",
        title: "Premium Plan",
        quantity: 1,
        unitPrice: 99.99,
        currencyId: "ARS",
      },
    ],
    back_urls: {
      success: "https://yourdomain.com/payments/success",
      failure: "https://yourdomain.com/payments/failure",
      pending: "https://yourdomain.com/payments/pending",
    },
    metadata: {
      orderId: "order_456",
      customerNote: "Please gift wrap",
    },
  });

  if (error) {
    console.error("Payment creation failed:", error);
    return;
  }

  // Redirect to Mercado Pago checkout
  window.location.href = data.checkoutUrl;
}
```

### Handling Webhooks

The plugin automatically handles webhooks at `/api/auth/mercado-pago/webhook`. Configure this URL in your [Mercado Pago Dashboard](https://www.mercadopago.com/developers/panel/webhooks).

```typescript
// The plugin handles this automatically, but you can add custom logic:
mercadoPagoPlugin({
  // ... config
  onPaymentUpdate: async ({ payment, status, mpPayment }) => {
    if (status === "approved") {
      // Grant access, send confirmation email, etc.
      await grantUserAccess(payment.userId);
      await sendConfirmationEmail(payment.userId);
    }
  },
});
```

---

## API Reference

### Client Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `mercadoPago.createPayment(params)` | Creates a payment preference and returns checkout URL | [`CreatePaymentParams`](#createpaymentparams) |

### Server Plugin Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `accessToken` | `string` | Yes | Your Mercado Pago access token |
| `baseUrl` | `string` | Yes | Base URL for redirects and webhooks |
| `webhookSecret` | `string` | No | Secret for webhook signature verification |
| `onPaymentUpdate` | `function` | No | Callback when payment status changes |
| `onSubscriptionUpdate` | `function` | No | Callback when subscription status changes |
| `onSubscriptionPayment` | `function` | No | Callback when subscription payment is processed |

### Types

#### CreatePaymentParams

```typescript
interface CreatePaymentParams {
  items: PaymentItem[];
  metadata?: Record<string, any>;
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  idempotencyKey?: string;
}
```

#### PaymentItem

```typescript
interface PaymentItem {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  currencyId?: string;
}
```

#### CreatePaymentResponse

```typescript
interface CreatePaymentResponse {
  checkoutUrl: string;
  preferenceId: string;
  payment: MercadoPagoPaymentRecord;
}
```

---

## Error Handling

The plugin uses Better Auth's error handling. Common errors:

```typescript
import { authClient } from "./auth-client";

const { data, error } = await authClient.mercadoPago.createPayment({
  items: [...],
});

if (error) {
  switch (error.status) {
    case 401:
      // User not authenticated
      break;
    case 429:
      // Rate limit exceeded (too many payment attempts)
      break;
    case 400:
      // Invalid parameters
      console.error(error.message);
      break;
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | User is not authenticated |
| `TOO_MANY_REQUESTS` | Rate limit exceeded |
| `BAD_REQUEST` | Invalid parameters or validation failed |
| `INTERNAL_SERVER_ERROR` | Server error occurred |

---

## Roadmap

- [x] One-time payments
- [x] Webhook handling with signature verification
- [x] Rate limiting and security features
- [ ] Subscriptions (preapproval plans)
- [ ] Split payments / Marketplace
- [ ] OAuth for seller account connections
- [ ] Advanced webhook configurations
- [ ] Payment refunds

---

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and development process.

---

## License

MIT © [IvanTsxx](https://github.com/ivantsxx)
