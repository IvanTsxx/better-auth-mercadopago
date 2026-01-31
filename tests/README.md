# Testing Guide

This directory contains all tests for the `better-auth-mercadopago` plugin.

## Test Structure

```
tests/
├── unit/              # Unit tests for individual modules
│   ├── security.test.ts
│   └── schemas.test.ts
├── integration/       # Integration tests
│   └── webhook.test.ts
├── mocks/            # Test mocks and utilities
│   └── mercadopago.ts
└── README.md         # This file
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm vitest

# Run tests with coverage
pnpm vitest run --coverage

# Run specific test file
pnpm vitest run tests/unit/security.test.ts
```

## Test Categories

### Unit Tests

Unit tests focus on testing individual functions and modules in isolation:

- **`security.test.ts`** - Tests for security utilities (rate limiting, signature verification, sanitization)
- **`schemas.test.ts`** - Tests for Zod schema validation

### Integration Tests

Integration tests verify that different parts of the system work together:

- **`webhook.test.ts`** - Tests for webhook processing, including signature verification and payment updates

## Mocking Strategy

We use Vitest's mocking capabilities to avoid making real API calls to Mercado Pago:

### Mercado Pago SDK Mock

The `tests/mocks/mercadopago.ts` file provides utilities for mocking the Mercado Pago SDK:

```typescript
import { createMockMercadoPagoSDK, createMockPaymentResponse } from "../mocks/mercadopago";

// In your test
vi.mock("mercadopago", () => createMockMercadoPagoSDK());
```

### Mock Helpers

- `createMockPaymentResponse()` - Creates a mock payment response
- `createMockPreferenceResponse()` - Creates a mock preference response
- `createMockWebhookNotification()` - Creates a mock webhook payload
- `generateWebhookSignature()` - Generates valid webhook signatures for testing
- `createMockAdapter()` - Creates a mock database adapter
- `createMockLogger()` - Creates a mock logger

## Writing New Tests

### Unit Test Example

```typescript
import { describe, expect, it } from "vitest";
import { myFunction } from "../../src/my-module";

describe("My Module", () => {
  it("should do something", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### Integration Test Example

```typescript
import { describe, expect, it, vi } from "vitest";
import { mercadoPagoPlugin } from "../../src/server";

vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(),
  // ... other mocks
}));

describe("My Integration Test", () => {
  it("should process something", async () => {
    const plugin = mercadoPagoPlugin({
      accessToken: "test",
      baseUrl: "http://localhost",
    });

    // Test the plugin
    expect(plugin).toBeDefined();
  });
});
```

## Test Best Practices

1. **Use descriptive test names** - The test name should explain what is being tested
2. **One assertion per test** - Keep tests focused on a single behavior
3. **Mock external dependencies** - Don't make real API calls in tests
4. **Clean up after tests** - Use `beforeEach` to reset mocks
5. **Test error cases** - Don't just test the happy path

## Coverage Goals

- **Unit tests**: 80%+ coverage for utility functions
- **Integration tests**: Cover all major user flows
- **Error handling**: All error paths should be tested

This directory contains all tests for the `better-auth-mercadopago` plugin.

## Test Structure

```
tests/
├── unit/              # Unit tests for individual modules
│   ├── security.test.ts
│   └── schemas.test.ts
├── integration/       # Integration tests
│   └── webhook.test.ts
├── mocks/            # Test mocks and utilities
│   └── mercadopago.ts
└── README.md         # This file
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm vitest

# Run tests with coverage
pnpm vitest run --coverage

# Run specific test file
pnpm vitest run tests/unit/security.test.ts
```

## Test Categories

### Unit Tests

Unit tests focus on testing individual functions and modules in isolation:

- **`security.test.ts`** - Tests for security utilities (rate limiting, signature verification, sanitization)
- **`schemas.test.ts`** - Tests for Zod schema validation

### Integration Tests

Integration tests verify that different parts of the system work together:

- **`webhook.test.ts`** - Tests for webhook processing, including signature verification and payment updates

## Mocking Strategy

We use Vitest's mocking capabilities to avoid making real API calls to Mercado Pago:

### Mercado Pago SDK Mock

The `tests/mocks/mercadopago.ts` file provides utilities for mocking the Mercado Pago SDK:

```typescript
import { createMockMercadoPagoSDK, createMockPaymentResponse } from "../mocks/mercadopago";

// In your test
vi.mock("mercadopago", () => createMockMercadoPagoSDK());
```

### Mock Helpers

- `createMockPaymentResponse()` - Creates a mock payment response
- `createMockPreferenceResponse()` - Creates a mock preference response
- `createMockWebhookNotification()` - Creates a mock webhook payload
- `generateWebhookSignature()` - Generates valid webhook signatures for testing
- `createMockAdapter()` - Creates a mock database adapter
- `createMockLogger()` - Creates a mock logger

## Writing New Tests

### Unit Test Example

```typescript
import { describe, expect, it } from "vitest";
import { myFunction } from "../../src/my-module";

describe("My Module", () => {
  it("should do something", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### Integration Test Example

```typescript
import { describe, expect, it, vi } from "vitest";
import { mercadoPagoPlugin } from "../../src/server";

vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(),
  // ... other mocks
}));

describe("My Integration Test", () => {
  it("should process something", async () => {
    const plugin = mercadoPagoPlugin({
      accessToken: "test",
      baseUrl: "http://localhost",
    });

    // Test the plugin
    expect(plugin).toBeDefined();
  });
});
```

## Test Best Practices

1. **Use descriptive test names** - The test name should explain what is being tested
2. **One assertion per test** - Keep tests focused on a single behavior
3. **Mock external dependencies** - Don't make real API calls in tests
4. **Clean up after tests** - Use `beforeEach` to reset mocks
5. **Test error cases** - Don't just test the happy path

## Coverage Goals

- **Unit tests**: 80%+ coverage for utility functions
- **Integration tests**: Cover all major user flows
- **Error handling**: All error paths should be tested

