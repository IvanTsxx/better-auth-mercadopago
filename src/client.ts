import type { BetterAuthClientPlugin } from "better-auth/client"; // ← /client, no solo "better-auth"
import type { mercadoPagoPlugin } from "./server";

export const mercadoPagoClientPlugin = () => {
	return {
		id: "mercadopago",
		$InferServerPlugin: {} as ReturnType<typeof mercadoPagoPlugin>,
	} satisfies BetterAuthClientPlugin;
};
