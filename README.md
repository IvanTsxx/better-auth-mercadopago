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

## English

### What is this?

`better-auth-mercadopago` is a plugin that seamlessly integrates [Mercado Pago](https://www.mercadopago.com) payments into your [Better Auth](https://github.com/better-auth/better-auth) authentication system. It provides a type-safe API for handling payments, subscriptions, and webhooks, all within the Better Auth ecosystem.

### Features

- **One-time payments** - Create payment preferences with automatic checkout URLs
- **Webhook handling** - Secure webhook processing with signature verification
- **Type-safe API** - Full TypeScript support for both client and server
- **Prisma integration** - Automatic database schema generation via Better Auth CLI
- **Security features** - Rate limiting, idempotency keys, webhook signature verification
- **Payment validation** - Amount verification to prevent tampering

### Installation

```bash
npm install better-auth-mercadopago
# or
pnpm add better-auth-mercadopago
# or
yarn add better-auth-mercadopago
```

### Environment Variables

```env
# Required
MP_ACCESS_TOKEN=your_mercado_pago_access_token

# Optional but recommended for production
MP_WEBHOOK_SECRET=your_webhook_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

### Server Configuration

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

### Client Configuration

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

### Database Schema Generation

After configuring the plugin, generate the Prisma schema:

```bash
pnpm dlx @better-auth/cli@latest generate
```

This creates the necessary database tables for the plugin to function.

### Usage Examples

#### Creating a One-Time Payment

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

#### Handling Webhooks

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

### API Reference

#### Client Methods

| Method | Description |
|--------|-------------|
| `mercadoPago.createPayment(params)` | Creates a payment preference and returns checkout URL |

#### Server Plugin Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `accessToken` | `string` | Yes | Your Mercado Pago access token |
| `baseUrl` | `string` | Yes | Base URL for redirects and webhooks |
| `webhookSecret` | `string` | No | Secret for webhook signature verification |
| `onPaymentUpdate` | `function` | No | Callback when payment status changes |
| `onSubscriptionUpdate` | `function` | No | Callback when subscription status changes |
| `onSubscriptionPayment` | `function` | No | Callback when subscription payment is processed |

### Error Handling

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

### Roadmap

- [x] One-time payments
- [x] Webhook handling with signature verification
- [x] Rate limiting and security features
- [ ] Subscriptions (preapproval plans)
- [ ] Split payments / Marketplace
- [ ] OAuth for seller account connections
- [ ] Advanced webhook configurations
- [ ] Payment refunds

---

## Español

### ¿Qué es esto?

`better-auth-mercadopago` es un plugin que integra perfectamente los pagos de [Mercado Pago](https://www.mercadopago.com) en tu sistema de autenticación [Better Auth](https://github.com/better-auth/better-auth). Proporciona una API type-safe para manejar pagos, suscripciones y webhooks, todo dentro del ecosistema de Better Auth.

### Características

- **Pagos únicos** - Crea preferencias de pago con URLs de checkout automáticas
- **Manejo de webhooks** - Procesamiento seguro de webhooks con verificación de firma
- **API type-safe** - Soporte completo de TypeScript para cliente y servidor
- **Integración con Prisma** - Generación automática de esquemas de base de datos vía Better Auth CLI
- **Características de seguridad** - Rate limiting, claves de idempotencia, verificación de firma de webhooks
- **Validación de pagos** - Verificación de montos para prevenir manipulación

### Instalación

```bash
npm install better-auth-mercadopago
# o
pnpm add better-auth-mercadopago
# o
yarn add better-auth-mercadopago
```

### Variables de Entorno

```env
# Requeridas
MP_ACCESS_TOKEN=tu_access_token_de_mercado_pago

# Opcionales pero recomendadas para producción
MP_WEBHOOK_SECRET=tu_secreto_de_webhook

# Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

### Configuración del Servidor

Crea o actualiza tu archivo `auth.ts`:

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
      webhookSecret: env.MP_WEBHOOK_SECRET, // Opcional pero recomendado
      
      // Callbacks opcionales
      onPaymentUpdate: async ({ payment, status, mpPayment }) => {
        console.log(`Pago ${payment.id} actualizado a ${status}`);
        // Enviar email, actualizar estado del usuario, etc.
      },
    }),
  ],
});
```

### Configuración del Cliente

Crea o actualiza tu archivo `auth-client.ts`:

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

### Generación del Esquema de Base de Datos

Después de configurar el plugin, genera el esquema de Prisma:

```bash
pnpm dlx @better-auth/cli@latest generate
```

Esto crea las tablas de base de datos necesarias para que el plugin funcione.

### Ejemplos de Uso

#### Crear un Pago Único

```typescript
import { authClient } from "./auth-client";

async function crearPago() {
  const { data, error } = await authClient.mercadoPago.createPayment({
    items: [
      {
        id: "prod_123",
        title: "Plan Premium",
        quantity: 1,
        unitPrice: 99.99,
        currencyId: "ARS",
      },
    ],
    back_urls: {
      success: "https://tudominio.com/pagos/exito",
      failure: "https://tudominio.com/pagos/error",
      pending: "https://tudominio.com/pagos/pendiente",
    },
    metadata: {
      orderId: "orden_456",
      notaCliente: "Por favor envolver para regalo",
    },
  });

  if (error) {
    console.error("Error al crear el pago:", error);
    return;
  }

  // Redirigir al checkout de Mercado Pago
  window.location.href = data.checkoutUrl;
}
```

#### Manejo de Webhooks

El plugin maneja automáticamente los webhooks en `/api/auth/mercado-pago/webhook`. Configura esta URL en tu [Panel de Mercado Pago](https://www.mercadopago.com/developers/panel/webhooks).

```typescript
// El plugin maneja esto automáticamente, pero puedes agregar lógica personalizada:
mercadoPagoPlugin({
  // ... config
  onPaymentUpdate: async ({ payment, status, mpPayment }) => {
    if (status === "approved") {
      // Otorgar acceso, enviar email de confirmación, etc.
      await otorgarAccesoUsuario(payment.userId);
      await enviarEmailConfirmacion(payment.userId);
    }
  },
});
```

### Referencia de la API

#### Métodos del Cliente

| Método | Descripción |
|--------|-------------|
| `mercadoPago.createPayment(params)` | Crea una preferencia de pago y devuelve la URL de checkout |

#### Opciones del Plugin del Servidor

| Opción | Tipo | Requerida | Descripción |
|--------|------|-----------|-------------|
| `accessToken` | `string` | Sí | Tu access token de Mercado Pago |
| `baseUrl` | `string` | Sí | URL base para redirecciones y webhooks |
| `webhookSecret` | `string` | No | Secreto para verificación de firma de webhooks |
| `onPaymentUpdate` | `function` | No | Callback cuando cambia el estado del pago |
| `onSubscriptionUpdate` | `function` | No | Callback cuando cambia el estado de la suscripción |
| `onSubscriptionPayment` | `function` | No | Callback cuando se procesa un pago de suscripción |

### Manejo de Errores

El plugin usa el manejo de errores de Better Auth. Errores comunes:

```typescript
import { authClient } from "./auth-client";

const { data, error } = await authClient.mercadoPago.createPayment({
  items: [...],
});

if (error) {
  switch (error.status) {
    case 401:
      // Usuario no autenticado
      break;
    case 429:
      // Límite de tasa excedido (demasiados intentos de pago)
      break;
    case 400:
      // Parámetros inválidos
      console.error(error.message);
      break;
  }
}
```

### Roadmap

- [x] Pagos únicos
- [x] Manejo de webhooks con verificación de firma
- [x] Rate limiting y características de seguridad
- [ ] Suscripciones (planes de preaprobación)
- [ ] Split payments / Marketplace
- [ ] OAuth para conexiones de cuentas de vendedores
- [ ] Configuraciones avanzadas de webhooks
- [ ] Reembolsos de pagos

---

## Contributing / Contribuir

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and development process.

Por favor lee [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles sobre nuestro código de conducta y proceso de desarrollo.

## License / Licencia

MIT © [IvanTsxx](https://github.com/ivantsxx)

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

## English

### What is this?

`better-auth-mercadopago` is a plugin that seamlessly integrates [Mercado Pago](https://www.mercadopago.com) payments into your [Better Auth](https://github.com/better-auth/better-auth) authentication system. It provides a type-safe API for handling payments, subscriptions, and webhooks, all within the Better Auth ecosystem.

### Features

- **One-time payments** - Create payment preferences with automatic checkout URLs
- **Webhook handling** - Secure webhook processing with signature verification
- **Type-safe API** - Full TypeScript support for both client and server
- **Prisma integration** - Automatic database schema generation via Better Auth CLI
- **Security features** - Rate limiting, idempotency keys, webhook signature verification
- **Payment validation** - Amount verification to prevent tampering

### Installation

```bash
npm install better-auth-mercadopago
# or
pnpm add better-auth-mercadopago
# or
yarn add better-auth-mercadopago
```

### Environment Variables

```env
# Required
MP_ACCESS_TOKEN=your_mercado_pago_access_token

# Optional but recommended for production
MP_WEBHOOK_SECRET=your_webhook_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

### Server Configuration

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

### Client Configuration

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

### Database Schema Generation

After configuring the plugin, generate the Prisma schema:

```bash
pnpm dlx @better-auth/cli@latest generate
```

This creates the necessary database tables for the plugin to function.

### Usage Examples

#### Creating a One-Time Payment

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

#### Handling Webhooks

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

### API Reference

#### Client Methods

| Method | Description |
|--------|-------------|
| `mercadoPago.createPayment(params)` | Creates a payment preference and returns checkout URL |

#### Server Plugin Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `accessToken` | `string` | Yes | Your Mercado Pago access token |
| `baseUrl` | `string` | Yes | Base URL for redirects and webhooks |
| `webhookSecret` | `string` | No | Secret for webhook signature verification |
| `onPaymentUpdate` | `function` | No | Callback when payment status changes |
| `onSubscriptionUpdate` | `function` | No | Callback when subscription status changes |
| `onSubscriptionPayment` | `function` | No | Callback when subscription payment is processed |

### Error Handling

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

### Roadmap

- [x] One-time payments
- [x] Webhook handling with signature verification
- [x] Rate limiting and security features
- [ ] Subscriptions (preapproval plans)
- [ ] Split payments / Marketplace
- [ ] OAuth for seller account connections
- [ ] Advanced webhook configurations
- [ ] Payment refunds

---

## Español

### ¿Qué es esto?

`better-auth-mercadopago` es un plugin que integra perfectamente los pagos de [Mercado Pago](https://www.mercadopago.com) en tu sistema de autenticación [Better Auth](https://github.com/better-auth/better-auth). Proporciona una API type-safe para manejar pagos, suscripciones y webhooks, todo dentro del ecosistema de Better Auth.

### Características

- **Pagos únicos** - Crea preferencias de pago con URLs de checkout automáticas
- **Manejo de webhooks** - Procesamiento seguro de webhooks con verificación de firma
- **API type-safe** - Soporte completo de TypeScript para cliente y servidor
- **Integración con Prisma** - Generación automática de esquemas de base de datos vía Better Auth CLI
- **Características de seguridad** - Rate limiting, claves de idempotencia, verificación de firma de webhooks
- **Validación de pagos** - Verificación de montos para prevenir manipulación

### Instalación

```bash
npm install better-auth-mercadopago
# o
pnpm add better-auth-mercadopago
# o
yarn add better-auth-mercadopago
```

### Variables de Entorno

```env
# Requeridas
MP_ACCESS_TOKEN=tu_access_token_de_mercado_pago

# Opcionales pero recomendadas para producción
MP_WEBHOOK_SECRET=tu_secreto_de_webhook

# Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
```

### Configuración del Servidor

Crea o actualiza tu archivo `auth.ts`:

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
      webhookSecret: env.MP_WEBHOOK_SECRET, // Opcional pero recomendado
      
      // Callbacks opcionales
      onPaymentUpdate: async ({ payment, status, mpPayment }) => {
        console.log(`Pago ${payment.id} actualizado a ${status}`);
        // Enviar email, actualizar estado del usuario, etc.
      },
    }),
  ],
});
```

### Configuración del Cliente

Crea o actualiza tu archivo `auth-client.ts`:

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

### Generación del Esquema de Base de Datos

Después de configurar el plugin, genera el esquema de Prisma:

```bash
pnpm dlx @better-auth/cli@latest generate
```

Esto crea las tablas de base de datos necesarias para que el plugin funcione.

### Ejemplos de Uso

#### Crear un Pago Único

```typescript
import { authClient } from "./auth-client";

async function crearPago() {
  const { data, error } = await authClient.mercadoPago.createPayment({
    items: [
      {
        id: "prod_123",
        title: "Plan Premium",
        quantity: 1,
        unitPrice: 99.99,
        currencyId: "ARS",
      },
    ],
    back_urls: {
      success: "https://tudominio.com/pagos/exito",
      failure: "https://tudominio.com/pagos/error",
      pending: "https://tudominio.com/pagos/pendiente",
    },
    metadata: {
      orderId: "orden_456",
      notaCliente: "Por favor envolver para regalo",
    },
  });

  if (error) {
    console.error("Error al crear el pago:", error);
    return;
  }

  // Redirigir al checkout de Mercado Pago
  window.location.href = data.checkoutUrl;
}
```

#### Manejo de Webhooks

El plugin maneja automáticamente los webhooks en `/api/auth/mercado-pago/webhook`. Configura esta URL en tu [Panel de Mercado Pago](https://www.mercadopago.com/developers/panel/webhooks).

```typescript
// El plugin maneja esto automáticamente, pero puedes agregar lógica personalizada:
mercadoPagoPlugin({
  // ... config
  onPaymentUpdate: async ({ payment, status, mpPayment }) => {
    if (status === "approved") {
      // Otorgar acceso, enviar email de confirmación, etc.
      await otorgarAccesoUsuario(payment.userId);
      await enviarEmailConfirmacion(payment.userId);
    }
  },
});
```

### Referencia de la API

#### Métodos del Cliente

| Método | Descripción |
|--------|-------------|
| `mercadoPago.createPayment(params)` | Crea una preferencia de pago y devuelve la URL de checkout |

#### Opciones del Plugin del Servidor

| Opción | Tipo | Requerida | Descripción |
|--------|------|-----------|-------------|
| `accessToken` | `string` | Sí | Tu access token de Mercado Pago |
| `baseUrl` | `string` | Sí | URL base para redirecciones y webhooks |
| `webhookSecret` | `string` | No | Secreto para verificación de firma de webhooks |
| `onPaymentUpdate` | `function` | No | Callback cuando cambia el estado del pago |
| `onSubscriptionUpdate` | `function` | No | Callback cuando cambia el estado de la suscripción |
| `onSubscriptionPayment` | `function` | No | Callback cuando se procesa un pago de suscripción |

### Manejo de Errores

El plugin usa el manejo de errores de Better Auth. Errores comunes:

```typescript
import { authClient } from "./auth-client";

const { data, error } = await authClient.mercadoPago.createPayment({
  items: [...],
});

if (error) {
  switch (error.status) {
    case 401:
      // Usuario no autenticado
      break;
    case 429:
      // Límite de tasa excedido (demasiados intentos de pago)
      break;
    case 400:
      // Parámetros inválidos
      console.error(error.message);
      break;
  }
}
```

### Roadmap

- [x] Pagos únicos
- [x] Manejo de webhooks con verificación de firma
- [x] Rate limiting y características de seguridad
- [ ] Suscripciones (planes de preaprobación)
- [ ] Split payments / Marketplace
- [ ] OAuth para conexiones de cuentas de vendedores
- [ ] Configuraciones avanzadas de webhooks
- [ ] Reembolsos de pagos

---

## Contributing / Contribuir

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and development process.

Por favor lee [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles sobre nuestro código de conducta y proceso de desarrollo.

## License / Licencia

MIT © [IvanTsxx](https://github.com/ivantsxx)

