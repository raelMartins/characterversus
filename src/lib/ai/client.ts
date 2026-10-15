import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";

// Server-side fallback: if a request is declined by a safety classifier,
// the API re-runs it on Anthropic's recommended fallback model instead of failing.
export const FALLBACK: { betas: Anthropic.Beta.AnthropicBeta[]; fallbacks: "default" } = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
};

let client: Anthropic | null = null;
export function ai() {
  if (!client) client = new Anthropic();
  return client;
}

export function hasApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export class AiError extends Error {
  constructor(message: string, readonly userMessage: string) {
    super(message);
  }
}

// Turn SDK failures into messages we can show on the page.
export function explainAiError(err: unknown): AiError {
  if (err instanceof AiError) return err;
  if (err instanceof Anthropic.AuthenticationError) {
    return new AiError(err.message, "The AI judge isn't configured. Add ANTHROPIC_API_KEY to the server environment.");
  }
  if (err instanceof Anthropic.RateLimitError) {
    return new AiError(err.message, "The judges are swamped right now. Try again in a minute.");
  }
  if (err instanceof Anthropic.APIError) {
    return new AiError(err.message, "The AI judge hit a problem. Try again in a moment.");
  }
  return new AiError(String(err), "Something went wrong. Try again in a moment.");
}
