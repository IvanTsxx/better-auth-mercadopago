import { describe, expect, it } from "vitest";
import { MercadoPagoPreferenceSchema } from "../../src/schemas";

describe("MercadoPagoPreferenceSchema", () => {
	describe("items validation", () => {
		it("should validate with valid items", () => {
			const validData = {
				items: [
					{
						id: "prod_123",
						title: "Test Product",
						quantity: 1,
						unit_price: 99.99,
					},
				],
			};
			const result = MercadoPagoPreferenceSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should reject empty items array", () => {
			const invalidData = {
				items: [],
			};
			const result = MercadoPagoPreferenceSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("should reject missing items", () => {
			const invalidData = {};
			const result = MercadoPagoPreferenceSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("should accept multiple items", () => {
			const validData = {
				items: [
					{
						id: "prod_1",
						title: "Product 1",
						quantity: 2,
						unit_price: 50.0,
					},
					{
						id: "prod_2",
						title: "Product 2",
						quantity: 1,
						unit_price: 100.0,
					},
				],
			};
			const result = MercadoPagoPreferenceSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	describe("back_urls validation", () => {
		it("should validate with valid URLs", () => {
			const validData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				back_urls: {
					success: "https://example.com/success",
					pending: "https://example.com/pending",
					failure: "https://example.com/failure",
				},
			};
			const result = MercadoPagoPreferenceSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should reject invalid URLs", () => {
			const invalidData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				back_urls: {
					success: "not-a-url",
					pending: "https://example.com/pending",
					failure: "https://example.com/failure",
				},
			};
			const result = MercadoPagoPreferenceSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("should accept partial back_urls", () => {
			const validData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				back_urls: {
					success: "https://example.com/success",
				},
			};
			const result = MercadoPagoPreferenceSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	describe("external_reference validation", () => {
		it("should accept valid external reference", () => {
			const validData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				external_reference: "order_123-ABC",
			};
			const result = MercadoPagoPreferenceSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should reject external reference with invalid characters", () => {
			const invalidData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				external_reference: "order@123!",
			};
			const result = MercadoPagoPreferenceSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("should reject external reference exceeding max length", () => {
			const invalidData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				external_reference: "a".repeat(65),
			};
			const result = MercadoPagoPreferenceSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe("auto_return validation", () => {
		it("should accept 'approved' value", () => {
			const validData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				auto_return: "approved",
			};
			const result = MercadoPagoPreferenceSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should accept 'all' value", () => {
			const validData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				auto_return: "all",
			};
			const result = MercadoPagoPreferenceSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should reject invalid auto_return value", () => {
			const invalidData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				auto_return: "invalid",
			};
			const result = MercadoPagoPreferenceSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe("metadata validation", () => {
		it("should accept valid metadata object", () => {
			const validData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				metadata: {
					orderId: "123",
					customerNote: "Please handle with care",
					nested: { key: "value" },
				},
			};
			const result = MercadoPagoPreferenceSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should accept empty metadata", () => {
			const validData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				metadata: {},
			};
			const result = MercadoPagoPreferenceSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	describe("statement_descriptor validation", () => {
		it("should accept valid descriptor", () => {
			const validData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				statement_descriptor: "MY STORE",
			};
			const result = MercadoPagoPreferenceSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should reject descriptor exceeding 13 characters", () => {
			const invalidData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				statement_descriptor: "THIS IS TOO LONG",
			};
			const result = MercadoPagoPreferenceSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe("notification_url validation", () => {
		it("should accept valid HTTPS URL", () => {
			const validData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				notification_url: "https://api.example.com/webhooks/mercadopago",
			};
			const result = MercadoPagoPreferenceSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should reject invalid URL", () => {
			const invalidData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				notification_url: "not-a-valid-url",
			};
			const result = MercadoPagoPreferenceSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe("expires validation", () => {
		it("should accept boolean expires", () => {
			const validData = {
				items: [{ id: "1", title: "Test", quantity: 1, unit_price: 10 }],
				expires: true,
			};
			const result = MercadoPagoPreferenceSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	describe("complex scenarios", () => {
		it("should validate complete preference object", () => {
			const completeData = {
				items: [
					{
						id: "prod_123",
						title: "Premium Plan",
						quantity: 1,
						unit_price: 99.99,
						currency_id: "ARS",
					},
				],
				back_urls: {
					success: "https://example.com/payment/success",
					failure: "https://example.com/payment/failure",
					pending: "https://example.com/payment/pending",
				},
				auto_return: "approved",
				external_reference: "order_abc123",
				notification_url: "https://api.example.com/webhooks/mercadopago",
				statement_descriptor: "MYSTORE",
				expires: true,
				metadata: {
					orderId: "abc123",
					userId: "user_456",
				},
			};
			const result = MercadoPagoPreferenceSchema.safeParse(completeData);
			expect(result.success).toBe(true);
		});
	});
});
