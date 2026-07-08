/**
 * generation-error.ts
 *
 * Centralized error translation layer for all AI generation API routes.
 *
 * Rules:
 *  - Provider names, raw HTTP status codes, JSON bodies, and stack traces
 *    MUST stay server-side only (in logProviderError).
 *  - The frontend only ever receives { error: string } with a clean message.
 */

// ── Error codes (internal use only — not sent to frontend) ────────────────────

export type GenerationErrorCode =
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "CONTENT_BLOCKED"
  | "INVALID_REQUEST"
  | "GENERATION_FAILED"
  | "INSUFFICIENT_CREDITS"
  | "NO_ACCESS";

// ── User-facing messages (no provider info, no technical detail) ──────────────

const USER_MESSAGES: Record<GenerationErrorCode, string> = {
  RATE_LIMITED:
    "The AI service is busy right now. Please try again in a moment.",
  PROVIDER_UNAVAILABLE:
    "Image generation is temporarily unavailable. Please try again shortly.",
  CONTENT_BLOCKED:
    "This prompt was blocked by the content policy. Please modify your prompt and try again.",
  INVALID_REQUEST:
    "Generation failed due to an invalid request. Please try a different prompt.",
  GENERATION_FAILED:
    "Generation failed. Your credits have not been deducted. Please try again in a few minutes.",
  INSUFFICIENT_CREDITS:
    "You don't have enough credits for this generation.",
  NO_ACCESS:
    "Your current plan does not include access to this feature.",
};

// ── Translate a raw provider HTTP status → GenerationErrorCode ────────────────

export function translateProviderStatus(status: number): GenerationErrorCode {
  if (status === 429) return "RATE_LIMITED";
  if (status === 402) return "PROVIDER_UNAVAILABLE";
  if (status === 403) return "CONTENT_BLOCKED";
  if (status === 400) return "INVALID_REQUEST";
  if (status >= 500) return "GENERATION_FAILED";
  return "GENERATION_FAILED";
}

// ── Build a safe { error } response for the frontend ─────────────────────────

export function safeError(
  code: GenerationErrorCode,
  httpStatus: number = 502
): { json: { error: string; code: GenerationErrorCode }; status: number } {
  return {
    json: { error: USER_MESSAGES[code], code },
    status: httpStatus,
  };
}

// ── Structured server-side log (never sent to client) ────────────────────────

interface ProviderErrorContext {
  route: string;
  providerStatus?: number;
  providerBody?: string;
  model?: string;
  userId?: string;
  durationMs?: number;
}

export function logProviderError(ctx: ProviderErrorContext): void {
  const ts = new Date().toISOString();
  console.error(
    JSON.stringify({
      level: "ERROR",
      ts,
      route: ctx.route,
      model: ctx.model ?? "unknown",
      providerStatus: ctx.providerStatus,
      durationMs: ctx.durationMs,
      userId: ctx.userId ? `[redacted:${ctx.userId.slice(-4)}]` : undefined,
      providerBody: ctx.providerBody?.slice(0, 500) ?? undefined,
    })
  );
}
