/** biome-ignore-all lint/suspicious/noExplicitAny: <no need to use any> */
import * as crypto from "node:crypto";
import type { AuthContext } from "better-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { idempotencyStore } from "../../src/security";
import { mercadoPagoPlugin } from "../../src/server";

// Mock Mercado Pago SDK
vi.mock("mercadopago", () => ({
	MercadoPagoConfig: vi.fn().mockImplementation(function MercadoPagoConfig() {
		return { accessToken: "mock-token" };
	}),
	Payment: vi.fn().mockImplementation(function Payment() {
		return {
			get: vi.fn().mockResolvedValue({
				id: "123456789",
				external_reference: "ext-ref-123",
				status: "approved",
				status_detail: "accredited",
				transaction_amount: 99.99,
				payment_method_id: "visa",
				payment_type_id: "credit_card",
			}),
		};
	}),
	Preference: vi.fn().mockImplementation(function Preference() {
		return {
			create: vi.fn().mockResolvedValue({
				id: "pref-123",
				init_point:
					"https://www.mercadopago.com/checkout/v1/redirect?pref_id=pref-123",
			}),
		};
	}),
}));

describe("Webhook Integration", () => {
	const mockAdapter = {
		create: vi.fn().mockResolvedValue({
			id: "payment-123",
			externalReference: "ext-ref-123",
			preferenceId: "pref-123",
			status: "pending",
			amount: 99.99,
		}),
		findOne: vi.fn().mockResolvedValue({
			id: "payment-123",
			externalReference: "ext-ref-123",
			preferenceId: "pref-123",
			status: "pending",
			amount: 99.99,
		}),
		update: vi.fn().mockResolvedValue({
			id: "payment-123",
			status: "approved",
		}),
	};

	const mockLogger = {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
	};

	const createMockContext = (
		body: unknown,
		headers: Record<string, string> = {},
	) => {
		return {
			context: {
				adapter: mockAdapter,
				logger: mockLogger,
			},
			body,
			request: {
				headers: {
					get: (key: string) => headers[key] || null,
				},
			},
			json: vi.fn().mockReturnValue({ received: true }),
		} as unknown as AuthContext;
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// Clear idempotency store to prevent test interference
		idempotencyStore.clear();
	});

	describe("Payment Notification", () => {
		it("should process valid payment notification", async () => {
			const plugin = mercadoPagoPlugin({
				accessToken: "test-token",
				baseUrl: "http://localhost:3000",
			});

			const notification = {
				action: "payment.created",
				api_version: "v1",
				data: { id: "123456789" },
				date_created: new Date().toISOString(),
				id: 12345,
				live_mode: false,
				type: "payment",
				user_id: "123",
			};

			const ctx = createMockContext(notification);
			const webhookEndpoint = plugin.endpoints?.webhook;

			expect(webhookEndpoint).toBeDefined();
			if (webhookEndpoint) {
				const result = await webhookEndpoint(ctx as any);
				expect(result).toEqual({ received: true });
				expect(mockAdapter.findOne).toHaveBeenCalledWith({
					model: "mercadoPagoPayment",
					where: [{ field: "externalReference", value: "ext-ref-123" }],
				});
				expect(mockAdapter.update).toHaveBeenCalled();
			}
		});

		it("should verify webhook signature when secret is configured", async () => {
			const secret = "my-webhook-secret";
			const dataId = "123456789";
			const xRequestId = "req-abc-123";
			const ts = Math.floor(Date.now() / 1000).toString();

			// Generate valid signature
			const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
			const hmac = crypto.createHmac("sha256", secret);
			hmac.update(manifest);
			const hash = hmac.digest("hex");
			const xSignature = `ts=${ts},v1=${hash}`;

			const plugin = mercadoPagoPlugin({
				accessToken: "test-token",
				baseUrl: "http://localhost:3000",
				webhookSecret: secret,
			});

			const notification = {
				action: "payment.created",
				api_version: "v1",
				data: { id: dataId },
				date_created: new Date().toISOString(),
				id: 12345,
				live_mode: false,
				type: "payment",
				user_id: "123",
			};

			const ctx = createMockContext(notification, {
				"x-signature": xSignature,
				"x-request-id": xRequestId,
			});

			const webhookEndpoint = plugin.endpoints?.webhook;
			if (webhookEndpoint) {
				const result = await webhookEndpoint(ctx as any);
				expect(result).toEqual({ received: true });
			}
		});

		it("should reject invalid webhook signature", async () => {
			const plugin = mercadoPagoPlugin({
				accessToken: "test-token",
				baseUrl: "http://localhost:3000",
				webhookSecret: "correct-secret",
			});

			const notification = {
				action: "payment.created",
				api_version: "v1",
				data: { id: "123456789" },
				date_created: new Date().toISOString(),
				id: 12345,
				live_mode: false,
				type: "payment",
				user_id: "123",
			};

			const ctx = createMockContext(notification, {
				"x-signature": "ts=123,v1=invalid-signature",
				"x-request-id": "req-123",
			});

			const webhookEndpoint = plugin.endpoints?.webhook;
			if (webhookEndpoint) {
				await expect(webhookEndpoint(ctx as any)).rejects.toThrow();
			}
		});

		it("should handle payment not found gracefully", async () => {
			mockAdapter.findOne.mockResolvedValueOnce(null);

			const plugin = mercadoPagoPlugin({
				accessToken: "test-token",
				baseUrl: "http://localhost:3000",
			});

			const notification = {
				action: "payment.created",
				api_version: "v1",
				data: { id: "123456789" },
				date_created: new Date().toISOString(),
				id: 12345,
				live_mode: false,
				type: "payment",
				user_id: "123",
			};

			const ctx = createMockContext(notification);
			const webhookEndpoint = plugin.endpoints?.webhook;

			if (webhookEndpoint) {
				const result = await webhookEndpoint(ctx as any);
				expect(result).toEqual({ received: true });
				// The server logs a warning when payment is not found
				expect(mockLogger.warn).toHaveBeenCalledWith(
					"Payment not found by external_reference",
					expect.any(Object),
				);
			}
		});

		it("should reject payment with amount mismatch", async () => {
			mockAdapter.findOne.mockResolvedValueOnce({
				id: "payment-123",
				externalReference: "ext-ref-123",
				amount: 50.0, // Different from MP response (99.99)
			});

			const plugin = mercadoPagoPlugin({
				accessToken: "test-token",
				baseUrl: "http://localhost:3000",
			});

			const notification = {
				action: "payment.created",
				api_version: "v1",
				data: { id: "123456789" },
				date_created: new Date().toISOString(),
				id: 12345,
				live_mode: false,
				type: "payment",
				user_id: "123",
			};

			const ctx = createMockContext(notification);
			const webhookEndpoint = plugin.endpoints?.webhook;

			if (webhookEndpoint) {
				await expect(webhookEndpoint(ctx as any)).rejects.toThrow(
					"Payment amount mismatch",
				);
			}
		});

		it("should call onPaymentUpdate callback when configured", async () => {
			const onPaymentUpdate = vi.fn().mockResolvedValue(undefined);

			const plugin = mercadoPagoPlugin({
				accessToken: "test-token",
				baseUrl: "http://localhost:3000",
				onPaymentUpdate,
			});

			const notification = {
				action: "payment.created",
				api_version: "v1",
				data: { id: "123456789" },
				date_created: new Date().toISOString(),
				id: 12345,
				live_mode: false,
				type: "payment",
				user_id: "123",
			};

			const ctx = createMockContext(notification);
			const webhookEndpoint = plugin.endpoints?.webhook;

			if (webhookEndpoint) {
				await webhookEndpoint(ctx as any);
				expect(onPaymentUpdate).toHaveBeenCalledWith({
					payment: expect.any(Object),
					status: "approved",
					statusDetail: "accredited",
					mpPayment: expect.any(Object),
				});
			}
		});

		it("should deduplicate webhook notifications", async () => {
			const plugin = mercadoPagoPlugin({
				accessToken: "test-token",
				baseUrl: "http://localhost:3000",
			});

			const notification = {
				action: "payment.created",
				api_version: "v1",
				data: { id: "123456789" },
				date_created: new Date().toISOString(),
				id: 12345,
				live_mode: false,
				type: "payment",
				user_id: "123",
			};

			const ctx = createMockContext(notification);
			const webhookEndpoint = plugin.endpoints?.webhook;

			if (webhookEndpoint) {
				// First call
				await webhookEndpoint(ctx as any);
				// Second call (should be deduplicated)
				const result = await webhookEndpoint(ctx as any);
				expect(result).toEqual({ received: true });
				// Adapter should only be called once
				expect(mockAdapter.findOne).toHaveBeenCalledTimes(1);
			}
		});
	});

	describe("Invalid Notifications", () => {
		it("should ignore non-payment notifications", async () => {
			const plugin = mercadoPagoPlugin({
				accessToken: "test-token",
				baseUrl: "http://localhost:3000",
			});

			const notification = {
				action: "subscription.created",
				api_version: "v1",
				data: { id: "123" },
				date_created: new Date().toISOString(),
				id: 12345,
				live_mode: false,
				type: "subscription", // Not "payment"
				user_id: "123",
			};

			const ctx = createMockContext(notification);
			const webhookEndpoint = plugin.endpoints?.webhook;

			if (webhookEndpoint) {
				const result = await webhookEndpoint(ctx as any);
				expect(result).toEqual({ received: true });
				expect(mockAdapter.findOne).not.toHaveBeenCalled();
			}
		});

		it("should handle missing payment ID", async () => {
			const plugin = mercadoPagoPlugin({
				accessToken: "test-token",
				baseUrl: "http://localhost:3000",
			});

			const notification = {
				action: "payment.created",
				api_version: "v1",
				data: {}, // Missing id
				date_created: new Date().toISOString(),
				id: 12345,
				live_mode: false,
				type: "payment",
				user_id: "123",
			};

			const ctx = createMockContext(notification);
			const webhookEndpoint = plugin.endpoints?.webhook;

			if (webhookEndpoint) {
				const result = await webhookEndpoint(ctx as any);
				expect(result).toEqual({ received: true });
				expect(mockAdapter.findOne).not.toHaveBeenCalled();
			}
		});
	});
});
