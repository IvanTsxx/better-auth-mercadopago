# Pre-v1.0.0 Checklist

This document tracks the current state of the `better-auth-mercadopago` package and what remains before a stable v1.0.0 release.

---

## Completed

### Core Features

| Feature | Status |
|---------|--------|
| One-time payment creation | ✅ |
| Webhook handling with signature verification | ✅ |
| Payment status tracking in database | ✅ |
| Type-safe API (client & server) | ✅ |
| Prisma schema generation support | ✅ |

### Security

| Feature | Status |
|---------|--------|
| Rate limiting for payment creation | ✅ |
| Rate limiting for webhooks | ✅ |
| Webhook signature verification (HMAC SHA256) | ✅ |
| Payment amount validation | ✅ |
| Metadata sanitization (prototype pollution prevention) | ✅ |
| Idempotency key support | ✅ |
| Idempotency for webhook processing | ✅ |

### Documentation

| Document | Status |
|----------|--------|
| README.md (bilingual: English/Spanish) | ✅ |
| ARCHITECTURE.md - Technical documentation | ✅ |
| CONTRIBUTING.md - Contribution guidelines | ✅ |
| RELEASES.md - Release process documentation | ✅ |
| Tests README.md - Testing guide | ✅ |

### Testing

| Component | Status |
|-----------|--------|
| Vitest configuration | ✅ |
| Unit tests for security module | ✅ |
| Unit tests for Zod schemas | ✅ |
| Integration tests for webhooks | ✅ |
| Mock utilities for Mercado Pago SDK | ✅ |
| Test documentation | ✅ |

### CI/CD

| Component | Status |
|-----------|--------|
| GitHub Actions CI workflow (build, lint, test) | ✅ |
| GitHub Actions Release workflow | ✅ |
| Changesets configuration | ✅ |
| Biome linting/formatting configuration | ✅ |

### Package Configuration

| Component | Status |
|-----------|--------|
| package.json with proper exports | ✅ |
| TypeScript configuration | ✅ |
| Build configuration (tsup) | ✅ |
| MIT License | ✅ |
| npm ignore file | ✅ |
| Git ignore file | ✅ |

---

## In Progress / Needs Work

### Features

| Feature | Status |
|---------|--------|
| Subscription support (preapproval plans) | 🚧 |
| Split payments / Marketplace | 🚧 |
| OAuth for seller account connections | 🚧 |
| Payment refunds | 🚧 |
| Advanced webhook configurations | 🚧 |

### Testing

| Component | Status |
|-----------|--------|
| Integration tests for payment creation endpoint | 🚧 |
| E2E tests (optional, requires MP sandbox) | 🚧 |
| Test coverage reporting in CI | 🚧 |
| Property-based tests (optional) | 🚧 |

### Documentation

| Document | Status |
|----------|--------|
| API reference documentation (typedoc) | 🚧 |
| Usage examples repository | 🚧 |
| Video tutorials (optional) | 🚧 |

---

## Required Before v1.0.0

### Critical Features

| Feature | Description |
|---------|-------------|
| **Subscription support** | Complete preapproval/subscription flow |
| | - Create preapproval plans |
| | - Subscribe users to plans |
| | - Handle subscription webhooks |
| | - Manage subscription status |
| **Comprehensive error handling** | Better error messages for common failures |
| | - Error codes documentation |
| | - Retry logic for transient failures |

### Testing

| Requirement | Target |
|-------------|--------|
| **80%+ test coverage** | Current coverage unknown |
| **Payment creation integration tests** | Test the full flow |
| **Error scenario tests** | All error paths covered |

### Documentation

| Document | Purpose |
|----------|---------|
| **Migration guide** | If there are breaking changes from current version |
| **Security best practices** | Guide for production deployment |
| **Troubleshooting guide** | Common issues and solutions |

### Stability

| Requirement | Criteria |
|-------------|----------|
| **Production usage** | Tested in at least 2-3 production environments |
| **No critical bugs** | For at least 2 weeks |
| **API stability** | No breaking changes for 1 month |

---

## Nice to Have (Post-v1.0.0)

### Features

| Feature | Priority |
|---------|----------|
| Payment method configuration | Low |
| Installments support | Low |
| Shipping information handling | Low |
| Payer information validation | Low |
| Marketplace split payments | Medium |
| Multi-currency support improvements | Low |

### Developer Experience

| Feature | Priority |
|---------|----------|
| ESLint plugin for common mistakes | Low |
| VS Code extension for snippets | Low |
| CLI tool for webhook testing | Medium |
| Playground/Demo application | Medium |

### Integrations

| Framework | Priority |
|-----------|----------|
| Next.js example app | Medium |
| Express.js example | Low |
| Fastify example | Low |
| Remix example | Low |

---

## Current Status Summary

| Category | Status | Progress |
|----------|--------|----------|
| Core Features | 🟡 Beta | 60% |
| Security | 🟢 Ready | 95% |
| Documentation | 🟡 Good | 75% |
| Testing | 🟡 Basic | 50% |
| CI/CD | 🟢 Ready | 90% |

**Overall Readiness: ~65%**

---

## Recommended Path to v1.0.0

### Phase 1: Stability (2-3 weeks)

1. Add payment creation integration tests
2. Improve error handling and messages
3. Fix any bugs discovered during testing
4. Add API reference documentation

### Phase 2: Subscriptions (3-4 weeks)

1. Implement preapproval plan creation
2. Implement subscription management
3. Add subscription webhook handlers
4. Write comprehensive tests

### Phase 3: Polish (1-2 weeks)

1. Achieve 80%+ test coverage
2. Create example applications
3. Write migration guide
4. Security audit

### Phase 4: Release (1 week)

1. Release candidate (RC)
2. Community testing
3. Final documentation review
4. v1.0.0 release

**Estimated Time to v1.0.0: 7-10 weeks**

---

## Notes

- The current version (0.2.2) is stable for one-time payments
- Subscriptions are the biggest missing feature for v1.0.0
- The plugin is already production-ready for basic payment use cases
- Consider releasing v0.3.0 with subscription support before v1.0.0
