import type { Model } from "../types.js";

/**
 * Workers AI base URL template. The `{CLOUDFLARE_ACCOUNT_ID}` placeholder is
 * resolved at request time from process.env (see `resolveCloudflareBaseUrl`).
 */
export const CLOUDFLARE_WORKERS_AI_BASE_URL =
	"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/ai/v1";

/**
 * AI Gateway base URL template (Unified API endpoint). The
 * `{CLOUDFLARE_ACCOUNT_ID}` and `{CLOUDFLARE_GATEWAY_ID}` placeholders are
 * resolved at request time from process.env. The Unified API accepts model IDs
 * in `provider/model` format, e.g. `openai/gpt-5.2-codex`,
 * `anthropic/claude-sonnet-4-5`, or `workers-ai/@cf/moonshotai/kimi-k2.6`.
 *
 * https://developers.cloudflare.com/ai-gateway/usage/unified-api/
 */
export const CLOUDFLARE_AI_GATEWAY_BASE_URL =
	"https://gateway.ai.cloudflare.com/v1/{CLOUDFLARE_ACCOUNT_ID}/{CLOUDFLARE_GATEWAY_ID}/compat";

/**
 * True when the model belongs to one of the Cloudflare providers that needs
 * its baseUrl resolved at request time.
 */
export function isCloudflareProvider(provider: string): boolean {
	return provider === "cloudflare-workers-ai" || provider === "cloudflare-ai-gateway";
}

/**
 * Resolve `{VAR}` placeholders in a Cloudflare model's `baseUrl` from
 * `process.env`. Returns the URL unchanged if it has no placeholders.
 *
 * Workers AI requires `CLOUDFLARE_ACCOUNT_ID`. AI Gateway requires both
 * `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_GATEWAY_ID`. Throws a clear
 * error naming the missing env var when a placeholder cannot be resolved.
 */
export function resolveCloudflareBaseUrl(model: Model<"openai-completions">): string {
	const url = model.baseUrl;
	if (!url.includes("{")) return url;
	return url.replace(/\{([A-Z_][A-Z0-9_]*)\}/g, (_match, name: string) => {
		const value = process.env[name];
		if (!value) {
			throw new Error(
				`${name} is required for provider ${model.provider} but is not set. Set ${name} as an environment variable.`,
			);
		}
		return value;
	});
}
