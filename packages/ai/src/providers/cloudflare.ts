import type { Model } from "../types.js";

/** Workers AI endpoint. `{CLOUDFLARE_ACCOUNT_ID}` is substituted at request time. */
export const CLOUDFLARE_WORKERS_AI_BASE_URL =
	"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/ai/v1";

/**
 * AI Gateway Unified API endpoint. Models are addressed as `provider/model`,
 * e.g. `openai/gpt-5.2-codex`, `workers-ai/@cf/moonshotai/kimi-k2.6`.
 * https://developers.cloudflare.com/ai-gateway/usage/unified-api/
 */
export const CLOUDFLARE_AI_GATEWAY_BASE_URL =
	"https://gateway.ai.cloudflare.com/v1/{CLOUDFLARE_ACCOUNT_ID}/{CLOUDFLARE_GATEWAY_ID}/compat";

export function isCloudflareProvider(provider: string): boolean {
	return provider === "cloudflare-workers-ai" || provider === "cloudflare-ai-gateway";
}

/** Substitute `{VAR}` placeholders in a Cloudflare baseUrl from process.env. */
export function resolveCloudflareBaseUrl(model: Model<"openai-completions">): string {
	const url = model.baseUrl;
	if (!url.includes("{")) return url;
	return url.replace(/\{([A-Z_][A-Z0-9_]*)\}/g, (_match, name: string) => {
		const value = process.env[name];
		if (!value) {
			throw new Error(`${name} is required for provider ${model.provider} but is not set.`);
		}
		return value;
	});
}
