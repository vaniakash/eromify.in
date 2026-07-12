/**
 * oauth-config.ts
 *
 * Shared OAuth 2.0 configuration for the Eromify MCP connector.
 * The client_id and client_secret are env-var-backed constants.
 *
 * All users use the SAME client_id/secret to set up the connector in Claude.
 * Each user authenticates with their own Eromify account during the OAuth flow,
 * so tokens are user-specific even though the OAuth app credentials are shared.
 *
 * IMPORTANT: NEXTAUTH_URL must be set to the Vercel primary domain (www.eromify.in).
 * Using a non-www domain causes Vercel to issue a 308 redirect for POST requests to
 * the token endpoint, which Claude's OAuth client cannot follow — breaking the flow.
 */

export const OAUTH_CONFIG = {
  /** Displayed on the /mcp-keys page for users to copy into Claude */
  clientId:     process.env.MCP_OAUTH_CLIENT_ID     ?? "eromify-mcp-claude",
  clientSecret: process.env.MCP_OAUTH_CLIENT_SECRET ?? "",

  /** Token lifetimes */
  codeExpirySeconds:         5 * 60,              // Authorization codes: 5 minutes
  tokenExpirySeconds:        365 * 24 * 60 * 60,  // Access tokens: 1 year
  refreshTokenExpirySeconds: 365 * 24 * 60 * 60,  // Refresh tokens: 1 year (same)

  /** Allowed redirect URIs — Claude's callback URL patterns */
  allowedRedirectUriPrefixes: [
    "https://claude.ai/",
    "https://api.claude.ai/",
    "https://claude.anthropic.com/",
    "https://api.anthropic.com/",
    // Allow localhost for local Claude Desktop / dev testing
    "http://localhost:",
    "https://localhost:",
  ],

  /** Supported scopes */
  scopes: ["mcp"],
} as const;

/** Validates that a redirect_uri is allowed */
export function isAllowedRedirectUri(uri: string): boolean {
  return OAUTH_CONFIG.allowedRedirectUriPrefixes.some((prefix) =>
    uri.startsWith(prefix)
  );
}

/**
 * Returns the canonical base URL for this deployment.
 *
 * MUST always return the Vercel primary domain (www.eromify.in) so that all
 * OAuth discovery endpoints advertise URLs that Claude can reach without a
 * 308 redirect. A 308 on a POST (token endpoint) causes Claude's OAuth client
 * to drop the request body, silently aborting the token exchange.
 */
export function getBaseUrl(): string {
  const url = process.env.NEXTAUTH_URL ?? "https://www.eromify.in";
  return url.replace(/\/$/, "");
}
