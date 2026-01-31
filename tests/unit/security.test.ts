import { beforeEach, describe, expect, it } from "vitest";
import {
	MercadoPagoError,
	MercadoPagoErrorCodes,
	rateLimiter,
	sanitizeMetadata,
	secureCompare,
	validateCallbackUrl,
	validateIdempotencyKey,
	validatePaymentAmount,
	verifyWebhookSignature,
} from "../../src/security";

describe("Security Module", () => {
	describe("RateLimiter", () => {
		beforeEach(() => {
			// Reset rate limiter state before each test
			// @ts-expect-error - accessing private for testing
			rateLimiter.attempts.clear();
		});

		it("should allow requests within limit", () => {
			const key = "test:key";
			const result = rateLimiter.check(key, 5, 60000);
			expect(result).toBe(true);
		});

		it("should block requests exceeding limit", () => {
			const key = "test:key";
			// Make 5 requests (at limit)
			for (let i = 0; i < 5; i++) {
				rateLimiter.check(key, 5, 60000);
			}
			// 6th request should be blocked
			const result = rateLimiter.check(key, 5, 60000);
			expect(result).toBe(false);
		});

		it("should reset after window expires", () => {
			const key = "test:key";
			// Exhaust limit
			for (let i = 0; i < 5; i++) {
				rateLimiter.check(key, 5, 1); // 1ms window
			}
			expect(rateLimiter.check(key, 5, 1)).toBe(false);

			// Wait for window to expire
			return new Promise((resolve) => {
				setTimeout(() => {
					const result = rateLimiter.check(key, 5, 60000);
					expect(result).toBe(true);
					resolve(undefined);
				}, 10);
			});
		});

		it("should track different keys independently", () => {
			const key1 = "test:key1";
			const key2 = "test:key2";

			// Exhaust key1
			for (let i = 0; i < 5; i++) {
				rateLimiter.check(key1, 5, 60000);
			}

			expect(rateLimiter.check(key1, 5, 60000)).toBe(false);
			expect(rateLimiter.check(key2, 5, 60000)).toBe(true);
		});
	});

	describe("validatePaymentAmount", () => {
		it("should return true for exact match", () => {
			expect(validatePaymentAmount(100.0, 100.0)).toBe(true);
		});

		it("should return true within default tolerance", () => {
			expect(validatePaymentAmount(100.0, 100.005)).toBe(true);
			expect(validatePaymentAmount(100.0, 99.995)).toBe(true);
		});

		it("should return false outside tolerance", () => {
			expect(validatePaymentAmount(100.0, 100.02)).toBe(false);
			expect(validatePaymentAmount(100.0, 99.98)).toBe(false);
		});

		it("should respect custom tolerance", () => {
			expect(validatePaymentAmount(100.0, 100.1, 0.2)).toBe(true);
			expect(validatePaymentAmount(100.0, 100.3, 0.2)).toBe(false);
		});
	});

	describe("sanitizeMetadata", () => {
		it("should return sanitized object", () => {
			const input = { key: "value", number: 123 };
			const result = sanitizeMetadata(input);
			expect(result).toEqual(input);
		});

		it("should remove prototype pollution keys", () => {
			const input = {
				key: "value",
				__proto__: { polluted: true },
				constructor: { hacked: true },
				prototype: { evil: true },
			};
			const result = sanitizeMetadata(input);
			expect(result).not.toHaveProperty("__proto__");
			expect(result).not.toHaveProperty("constructor");
			expect(result).not.toHaveProperty("prototype");
			expect(result).toHaveProperty("key");
		});

		it("should truncate long strings", () => {
			const longString = "a".repeat(6000);
			const input = { key: longString };
			const result = sanitizeMetadata(input);
			expect(result.key).toHaveLength(5000);
		});

		it("should handle nested objects", () => {
			const input = {
				level1: {
					level2: {
						value: "deep",
					},
				},
			};
			const result = sanitizeMetadata(input);
			expect(result.level1.level2.value).toBe("deep");
		});

		it("should sanitize nested prototype pollution", () => {
			const input = {
				nested: {
					__proto__: { polluted: true },
					value: "safe",
				},
			};
			const result = sanitizeMetadata(input);
			expect(result.nested).not.toHaveProperty("__proto__");
			expect(result.nested.value).toBe("safe");
		});
	});

	describe("validateIdempotencyKey", () => {
		it("should accept valid UUID v4", () => {
			const validUuid = "550e8400-e29b-41d4-a716-446655440000";
			expect(validateIdempotencyKey(validUuid)).toBe(true);
		});

		it("should accept valid custom format", () => {
			expect(validateIdempotencyKey("valid-key_123")).toBe(true);
			expect(validateIdempotencyKey("short")).toBe(true);
		});

		it("should reject invalid formats", () => {
			expect(validateIdempotencyKey("")).toBe(false); // Empty string
			expect(validateIdempotencyKey("a".repeat(65))).toBe(false); // Too long
			expect(validateIdempotencyKey("invalid key!")).toBe(false); // Invalid chars
		});
	});

	describe("verifyWebhookSignature", () => {
		it("should return false when headers are missing", () => {
			const result = verifyWebhookSignature({
				xSignature: null,
				xRequestId: null,
				dataId: "123",
				secret: "secret",
			});
			expect(result).toBe(false);
		});

		it("should return false for invalid signature format", () => {
			const result = verifyWebhookSignature({
				xSignature: "invalid",
				xRequestId: "req-123",
				dataId: "123",
				secret: "secret",
			});
			expect(result).toBe(false);
		});

		it("should verify valid signature", () => {
			const secret = "my-secret";
			const dataId = "123456";
			const xRequestId = "req-abc";
			const ts = "1234567890";

			// Create valid signature
			const crypto = require("node:crypto");
			const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
			const hmac = crypto.createHmac("sha256", secret);
			hmac.update(manifest);
			const hash = hmac.digest("hex");

			const xSignature = `ts=${ts},v1=${hash}`;

			const result = verifyWebhookSignature({
				xSignature,
				xRequestId,
				dataId,
				secret,
			});
			expect(result).toBe(true);
		});

		it("should reject tampered signature", () => {
			const result = verifyWebhookSignature({
				xSignature: "ts=1234567890,v1=fakehash",
				xRequestId: "req-abc",
				dataId: "123",
				secret: "secret",
			});
			expect(result).toBe(false);
		});
	});

	describe("validateCallbackUrl", () => {
		it("should allow valid HTTPS URLs in production", () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "production";

			const result = validateCallbackUrl("https://example.com/callback", [
				"example.com",
			]);
			expect(result).toBe(true);

			process.env.NODE_ENV = originalEnv;
		});

		it("should reject HTTP in production", () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "production";

			const result = validateCallbackUrl("http://example.com/callback", [
				"example.com",
			]);
			expect(result).toBe(false);

			process.env.NODE_ENV = originalEnv;
		});

		it("should allow HTTP in development", () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "development";

			const result = validateCallbackUrl("http://localhost:3000/callback", [
				"localhost",
			]);
			expect(result).toBe(true);

			process.env.NODE_ENV = originalEnv;
		});

		it("should support wildcard subdomains", () => {
			const result = validateCallbackUrl("https://app.example.com/callback", [
				"*.example.com",
			]);
			expect(result).toBe(true);
		});

		it("should reject invalid URLs", () => {
			const result = validateCallbackUrl("not-a-url", ["example.com"]);
			expect(result).toBe(false);
		});
	});

	describe("secureCompare", () => {
		it("should return true for equal strings", () => {
			expect(secureCompare("hello", "hello")).toBe(true);
		});

		it("should return false for different strings", () => {
			expect(secureCompare("hello", "world")).toBe(false);
		});

		it("should return false for different lengths", () => {
			expect(secureCompare("hello", "hello!")).toBe(false);
		});

		it("should be timing-safe", () => {
			// This is a basic test - real timing attack prevention
			// requires more sophisticated testing
			const start = Date.now();
			for (let i = 0; i < 1000; i++) {
				secureCompare("a".repeat(100), "b".repeat(100));
			}
			const duration = Date.now() - start;
			// Should complete reasonably fast
			expect(duration).toBeLessThan(100);
		});
	});

	describe("MercadoPagoError", () => {
		it("should create error with default status code", () => {
			const error = new MercadoPagoError(
				"INVALID_CARD",
				"Card number is invalid",
			);
			expect(error.code).toBe("INVALID_CARD");
			expect(error.message).toBe("Card number is invalid");
			expect(error.statusCode).toBe(400);
			expect(error.name).toBe("MercadoPagoError");
		});

		it("should create error with custom status code", () => {
			const error = new MercadoPagoError(
				"UNAUTHORIZED",
				"Invalid API key",
				401,
			);
			expect(error.statusCode).toBe(401);
		});

		it("should include details when provided", () => {
			const details = { field: "card_number", value: "1234" };
			const error = new MercadoPagoError(
				"INVALID_CARD",
				"Card number is invalid",
				400,
				details,
			);
			expect(error.details).toEqual(details);
		});

		it("should convert to APIError", () => {
			const error = new MercadoPagoError("NOT_FOUND", "Payment not found", 404);
			const apiError = error.toAPIError();
			expect(apiError).toBeDefined();
		});
	});

	describe("MercadoPagoErrorCodes", () => {
		it("should have authentication error codes", () => {
			expect(MercadoPagoErrorCodes.INVALID_API_KEY).toBe("invalid_api_key");
			expect(MercadoPagoErrorCodes.UNAUTHORIZED).toBe("unauthorized");
		});

		it("should have payment error codes", () => {
			expect(MercadoPagoErrorCodes.INSUFFICIENT_FUNDS).toBe(
				"cc_rejected_insufficient_amount",
			);
			expect(MercadoPagoErrorCodes.INVALID_CARD).toBe(
				"cc_rejected_bad_filled_card_number",
			);
		});

		it("should have subscription error codes", () => {
			expect(MercadoPagoErrorCodes.SUBSCRIPTION_NOT_FOUND).toBe(
				"subscription_not_found",
			);
		});
	});
});
