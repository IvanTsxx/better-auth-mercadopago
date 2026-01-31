# Contributing to better-auth-mercadopago

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Questions?](#questions)
- [Code of Conduct](#code-of-conduct)

---

## Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ or 20+ |
| Package Manager | pnpm (recommended) or npm |
| Git | Latest |

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/better-auth-mercadopago.git
   cd better-auth-mercadopago
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Run tests** to ensure everything is working:
   ```bash
   pnpm test
   ```

5. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/my-feature-name
   # or
   git checkout -b fix/bug-description
   ```

---

## Development Workflow

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build the package for production |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Format code with Biome |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |

### Before Committing

Always run these commands before committing:

```bash
pnpm typecheck    # Ensure no TypeScript errors
pnpm lint         # Ensure code passes linting
pnpm test         # Ensure all tests pass
```

---

## Project Structure

```
better-auth-mercadopago/
├── src/              # Source code
│   ├── index.ts      # Main exports
│   ├── client.ts     # Client plugin
│   ├── server.ts     # Server plugin
│   ├── types.ts      # TypeScript types
│   ├── schemas.ts    # Zod schemas
│   └── security.ts   # Security utilities
├── tests/            # Test files
│   ├── unit/         # Unit tests
│   ├── integration/  # Integration tests
│   └── mocks/        # Test mocks
├── docs/             # Documentation
│   ├── ARCHITECTURE.md
│   ├── CHECKLIST.md
│   └── RELEASES.md
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── biome.json
└── CHANGELOG.md
```

---

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Avoid `any` types - use `unknown` when necessary
- Export all public types from `src/types.ts`
- Use explicit return types for public functions

### Code Style

We use [Biome](https://biomejs.dev/) for linting and formatting:

| Setting | Value |
|---------|-------|
| Indentation | Tabs |
| Quotes | Double quotes |
| Semicolons | Yes |
| Line width | 80 characters (default) |

Configuration is in [`biome.json`](biome.json).

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `my-file.ts` |
| Functions | camelCase | `myFunction` |
| Classes/Types | PascalCase | `MyClass` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Interfaces | PascalCase | `PaymentOptions` |

### Example

```typescript
// Good
export interface PaymentOptions {
	amount: number;
	currency: string;
}

export function createPayment(options: PaymentOptions): Promise<Payment> {
	// Implementation
}

// Bad
export interface paymentOptions {  // Should be PascalCase
	amount: any;  // Avoid any
	currency: string;
}
```

---

## Testing

### Test Structure

```
tests/
├── unit/          # Unit tests (test one function/module)
├── integration/   # Integration tests (test multiple modules)
└── mocks/         # Shared mocks
```

### Writing Tests

Use descriptive test names that explain the behavior:

```typescript
// Good
describe("validatePaymentAmount", () => {
	it("should return true for exact match", () => {
		// Test code
	});

	it("should return false when difference exceeds tolerance", () => {
		// Test code
	});
});

// Bad
describe("validatePaymentAmount", () => {
	it("works correctly", () => {  // Too vague
		// Test code
	});
});
```

### Mocking

Mock external dependencies like the Mercado Pago SDK:

```typescript
import { vi } from "vitest";

vi.mock("mercadopago", () => ({
	MercadoPagoConfig: vi.fn(),
	Payment: vi.fn().mockImplementation(() => ({
		get: vi.fn().mockResolvedValue({ id: "123" }),
	})),
}));
```

Use the mock utilities in `tests/mocks/mercadopago.ts` for consistency.

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process or auxiliary tool changes |

### Examples

```
feat(payments): add support for metadata in payment creation

fix(webhooks): handle missing external_reference gracefully

docs(readme): add installation instructions for Next.js

test(security): add tests for webhook signature verification

refactor(server): extract validation logic into separate functions
```

### Breaking Changes

For breaking changes, add `!` after the type/scope or include `BREAKING CHANGE:` in the footer:

```
feat(api)!: change response format for createPayment

BREAKING CHANGE: The response now returns an object with `data` property
instead of returning the data directly.
```

---

## Pull Request Process

1. **Update documentation** if needed (README, ARCHITECTURE, etc.)

2. **Add tests** for new functionality

3. **Ensure CI passes**:
   - TypeScript compilation
   - Linting
   - All tests

4. **Create a changeset** if your changes affect the public API:
   ```bash
   pnpm changeset
   ```
   Follow the prompts to select the bump type (patch, minor, major) and describe your changes.

5. **Submit your PR** with a clear description:
   - What changed
   - Why it changed
   - How to test it
   - Any breaking changes

6. **Address review feedback** promptly

### PR Title Format

Follow the same convention as commits:

```
feat: add subscription support
fix: resolve webhook signature verification issue
docs: update API reference
```

---

## Release Process

We use [Changesets](https://github.com/changesets/changesets) to manage releases.

### For Contributors

When making changes that affect the public API:

1. Run `pnpm changeset` after making your changes
2. Select the appropriate bump type:
   - `patch` - Bug fixes
   - `minor` - New features (backward compatible)
   - `major` - Breaking changes
3. Write a clear description of the changes
4. Commit the generated `.changeset/*.md` file

### For Maintainers

To create a release:

1. Review and merge PRs with changesets
2. Run `pnpm changeset version` to bump versions and update changelog
3. Review the changes
4. Run `pnpm changeset publish` to publish to npm
5. Push the version bump and tags to GitHub

---

## Questions?

If you have questions or need help:

- Open an issue on GitHub
- Check existing issues and discussions
- Read the [Architecture Documentation](docs/ARCHITECTURE.md)

---

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect differing viewpoints

Thank you for contributing! 🎉
