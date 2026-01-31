import { vi } from "vitest";

/**
 * Mock factory for Mercado Pago SDK
 * Use this to create consistent mocks across tests
 */

export interface MockPaymentResponse {
	id: string;
	external_reference?: string;
	status: string;
	status_detail?: string;
	transaction_amount: number;
	payment_method_id?: string;
	payment_type_id?: string;
	preference_id?: string;
}

export interface MockPreferenceResponse {
	id: string;
	init_point: string;
	sandbox_init_point?: string;
}

export const createMockPaymentResponse = (
	overrides: Partial<MockPaymentResponse> = {},
): MockPaymentResponse => ({
	id: "123456789",
	external_reference: "ext-ref-123",
	status: "approved",
	status_detail: "accredited",
	transaction_amount: 99.99,
	payment_method_id: "visa",
	payment_type_id: "credit_card",
	preference_id: "pref-123",
	...overrides,
});

export const createMockPreferenceResponse = (
	overrides: Partial<MockPreferenceResponse> = {},
): MockPreferenceResponse => ({
	id: "pref-123456",
	init_point:
		"https://www.mercadopago.com/checkout/v1/redirect?pref_id=pref-123456",
	sandbox_init_point:
		"https://sandbox.mercadopago.com/checkout/v1/redirect?pref_id=pref-123456",
	...overrides,
});

export const createMockMercadoPagoSDK = () => {
	const mockPaymentGet = vi.fn();
	const mockPreferenceCreate = vi.fn();

	return {
		MercadoPagoConfig: vi.fn().mockImplementation(() => ({
			accessToken: "mock-token",
		})),
		Payment: vi.fn().mockImplementation(() => ({
			get: mockPaymentGet,
		})),
		Preference: vi.fn().mockImplementation(() => ({
			create: mockPreferenceCreate,
		})),
		// Expose mocks for test assertions
		_mocks: {
			paymentGet: mockPaymentGet,
			preferenceCreate: mockPreferenceCreate,
		},
	};
};

/**
 * Setup function to mock the mercadopago module
 * Call this in your test file's beforeAll or beforeEach
 */
export const setupMercadoPagoMock = (
	responses: {
		payment?: MockPaymentResponse;
		preference?: MockPreferenceResponse;
	} = {},
) => {
	const mockPayment = createMockPaymentResponse(responses.payment);
	const mockPreference = createMockPreferenceResponse(responses.preference);

	vi.doMock("mercadopago", () => ({
		MercadoPagoConfig: vi.fn().mockImplementation(() => ({})),
		Payment: vi.fn().mockImplementation(() => ({
			get: vi.fn().mockResolvedValue(mockPayment),
		})),
		Preference: vi.fn().mockImplementation(() => ({
			create: vi.fn().mockResolvedValue(mockPreference),
		})),
	}));

	return { mockPayment, mockPreference };
};

/**
 * Create a mock webhook notification payload
 */
export const createMockWebhookNotification = (
	overrides: Partial<{
		action: string;
		api_version: string;
		data: { id: string };
		date_created: string;
		id: number;
		live_mode: boolean;
		type: string;
		user_id: string;
	}> = {},
) => ({
	action: "payment.created",
	api_version: "v1",
	data: { id: "123456789" },
	date_created: new Date().toISOString(),
	id: 12345,
	live_mode: false,
	type: "payment",
	user_id: "123",
	...overrides,
});

/**
 * Generate a valid webhook signature for testing
 */
export const generateWebhookSignature = ({
	secret,
	dataId,
	xRequestId,
	ts,
}: {
	secret: string;
	dataId: string;
	xRequestId: string;
	ts: string;
}): { xSignature: string; manifest: string } => {
	const crypto = require("node:crypto");
	const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
	const hmac = crypto.createHmac("sha256", secret);
	hmac.update(manifest);
	const hash = hmac.digest("hex");
	const xSignature = `ts=${ts},v1=${hash}`;

	return { xSignature, manifest };
};

/**
 * Mock database adapter for testing
 */
export const createMockAdapter = () => ({
	create: vi.fn().mockResolvedValue({
		id: "payment-123",
		externalReference: "ext-ref-123",
		preferenceId: "pref-123",
		status: "pending",
		amount: 99.99,
		currency: "ARS",
		createdAt: new Date(),
		updatedAt: new Date(),
	}),
	findOne: vi.fn().mockResolvedValue({
		id: "payment-123",
		externalReference: "ext-ref-123",
		preferenceId: "pref-123",
		status: "pending",
		amount: 99.99,
		currency: "ARS",
	}),
	update: vi.fn().mockResolvedValue({
		id: "payment-123",
		status: "approved",
		updatedAt: new Date(),
	}),
	delete: vi.fn().mockResolvedValue(true),
});

/**
 * Mock logger for testing
 */
export const createMockLogger = () => ({
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	debug: vi.fn(),
});

/**
 * Mock Better Auth context helper
 */
export const createMockAuthContext = (
	overrides: {
		body?: unknown;
		headers?: Record<string, string>;
		adapter?: ReturnType<typeof createMockAdapter>;
		logger?: ReturnType<typeof createMockLogger>;
	} = {},
) => {
	const adapter = overrides.adapter || createMockAdapter();
	const logger = overrides.logger || createMockLogger();
	const headers = overrides.headers || {};

	return {
		context: {
			adapter,
			logger,
		},
		body: overrides.body || {},
		request: {
			headers: {
				get: (key: string) => headers[key] || null,
			},
		},
		json: vi.fn().mockReturnValue({ received: true }),
	};
};

/**
 * Mock factory for Mercado Pago SDK
 * Use this to create consistent mocks across tests
 */

export interface MockPaymentResponse {
	id: string;
	external_reference?: string;
	status: string;
	status_detail?: string;
	transaction_amount: number;
	payment_method_id?: string;
	payment_type_id?: string;
	preference_id?: string;
}

export interface MockPreferenceResponse {
	id: string;
	init_point: string;
	sandbox_init_point?: string;
}

export const createMockPaymentResponse = (
	overrides: Partial<MockPaymentResponse> = {},
): MockPaymentResponse => ({
	id: "123456789",
	external_reference: "ext-ref-123",
	status: "approved",
	status_detail: "accredited",
	transaction_amount: 99.99,
	payment_method_id: "visa",
	payment_type_id: "credit_card",
	preference_id: "pref-123",
	...overrides,
});

export const createMockPreferenceResponse = (
	overrides: Partial<MockPreferenceResponse> = {},
): MockPreferenceResponse => ({
	id: "pref-123456",
	init_point:
		"https://www.mercadopago.com/checkout/v1/redirect?pref_id=pref-123456",
	sandbox_init_point:
		"https://sandbox.mercadopago.com/checkout/v1/redirect?pref_id=pref-123456",
	...overrides,
});

export const createMockMercadoPagoSDK = () => {
	const mockPaymentGet = vi.fn();
	const mockPreferenceCreate = vi.fn();

	return {
		MercadoPagoConfig: vi.fn().mockImplementation(() => ({
			accessToken: "mock-token",
		})),
		Payment: vi.fn().mockImplementation(() => ({
			get: mockPaymentGet,
		})),
		Preference: vi.fn().mockImplementation(() => ({
			create: mockPreferenceCreate,
		})),
		// Expose mocks for test assertions
		_mocks: {
			paymentGet: mockPaymentGet,
			preferenceCreate: mockPreferenceCreate,
		},
	};
};

/**
 * Setup function to mock the mercadopago module
 * Call this in your test file's beforeAll or beforeEach
 */
export const setupMercadoPagoMock = (
	responses: {
		payment?: MockPaymentResponse;
		preference?: MockPreferenceResponse;
	} = {},
) => {
	const mockPayment = createMockPaymentResponse(responses.payment);
	const mockPreference = createMockPreferenceResponse(responses.preference);

	vi.doMock("mercadopago", () => ({
		MercadoPagoConfig: vi.fn().mockImplementation(() => ({})),
		Payment: vi.fn().mockImplementation(() => ({
			get: vi.fn().mockResolvedValue(mockPayment),
		})),
		Preference: vi.fn().mockImplementation(() => ({
			create: vi.fn().mockResolvedValue(mockPreference),
		})),
	}));

	return { mockPayment, mockPreference };
};

/**
 * Create a mock webhook notification payload
 */
export const createMockWebhookNotification = (
	overrides: Partial<{
		action: string;
		api_version: string;
		data: { id: string };
		date_created: string;
		id: number;
		live_mode: boolean;
		type: string;
		user_id: string;
	}> = {},
) => ({
	action: "payment.created",
	api_version: "v1",
	data: { id: "123456789" },
	date_created: new Date().toISOString(),
	id: 12345,
	live_mode: false,
	type: "payment",
	user_id: "123",
	...overrides,
});

/**
 * Generate a valid webhook signature for testing
 */
export const generateWebhookSignature = ({
	secret,
	dataId,
	xRequestId,
	ts,
}: {
	secret: string;
	dataId: string;
	xRequestId: string;
	ts: string;
}): { xSignature: string; manifest: string } => {
	const crypto = require("node:crypto");
	const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
	const hmac = crypto.createHmac("sha256", secret);
	hmac.update(manifest);
	const hash = hmac.digest("hex");
	const xSignature = `ts=${ts},v1=${hash}`;

	return { xSignature, manifest };
};

/**
 * Mock database adapter for testing
 */
export const createMockAdapter = () => ({
	create: vi.fn().mockResolvedValue({
		id: "payment-123",
		externalReference: "ext-ref-123",
		preferenceId: "pref-123",
		status: "pending",
		amount: 99.99,
		currency: "ARS",
		createdAt: new Date(),
		updatedAt: new Date(),
	}),
	findOne: vi.fn().mockResolvedValue({
		id: "payment-123",
		externalReference: "ext-ref-123",
		preferenceId: "pref-123",
		status: "pending",
		amount: 99.99,
		currency: "ARS",
	}),
	update: vi.fn().mockResolvedValue({
		id: "payment-123",
		status: "approved",
		updatedAt: new Date(),
	}),
	delete: vi.fn().mockResolvedValue(true),
});

/**
 * Mock logger for testing
 */
export const createMockLogger = () => ({
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	debug: vi.fn(),
});

/**
 * Mock Better Auth context helper
 */
export const createMockAuthContext = (
	overrides: {
		body?: unknown;
		headers?: Record<string, string>;
		adapter?: ReturnType<typeof createMockAdapter>;
		logger?: ReturnType<typeof createMockLogger>;
	} = {},
) => {
	const adapter = overrides.adapter || createMockAdapter();
	const logger = overrides.logger || createMockLogger();
	const headers = overrides.headers || {};

	return {
		context: {
			adapter,
			logger,
		},
		body: overrides.body || {},
		request: {
			headers: {
				get: (key: string) => headers[key] || null,
			},
		},
		json: vi.fn().mockReturnValue({ received: true }),
	};
};
