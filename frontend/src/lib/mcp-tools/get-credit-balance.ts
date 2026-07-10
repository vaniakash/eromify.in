/**
 * get-credit-balance.ts — MCP tool: get_credit_balance
 *
 * Returns the user's current credit balance and plan status.
 * No credits are consumed. Read-only.
 */

import type { McpToolDefinition, McpCallToolResult, McpUserContext } from "./types";

// ── Tool definition ───────────────────────────────────────────────────────────

export const getCreditBalanceDefinition: McpToolDefinition = {
  name: "get_credit_balance",
  description:
    "Get your current Eromify credit balance, plan status, and video access status. No credits required.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
    additionalProperties: false,
  },
};

// ── Tool handler ──────────────────────────────────────────────────────────────

export function executeGetCreditBalance(
  user: McpUserContext
): McpCallToolResult {
  const displayCredits = Math.floor(user.credits / 100);
  const planLabel = user.isPro ? "Pro" : "Free";

  const lines = [
    `💰 Credit balance: ${displayCredits} credit${displayCredits !== 1 ? "s" : ""}`,
    `📦 Plan: ${planLabel}`,
    `🎬 Video access: ${user.videoAccess ? "Yes" : "No"}`,
    "",
    "Cost reference:",
    "  • Generate image: 1 credit each (up to 4 per call)",
    "  • Generate video: 15 credits each",
  ];

  return {
    content: [{ type: "text", text: lines.join("\n") }],
  };
}
