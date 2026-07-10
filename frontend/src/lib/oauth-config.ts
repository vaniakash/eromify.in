/**
 * oauth-config.ts
 *
 * Shared OAuth 2.0 configuration for the Eromify MCP connector.
 * The client_id and client_secret are env-var-backed constants.
 *
 * All users use the SAME client_id/secret to set up the connector in Claude.
 * Each user authenticates with their own Eromify account during the OAuth flow,
 * so tokens are user-specific even though the OAuth app credentials are shared.
 */

export const OAUTH_CONFIG = {
  /** Displayed on the /mcp-keys page for users to copy into Claude */
  clientId:     process.env.MCP_OAUTH_CLIENT_ID     ?? "eromify-mcp-claude",
  clientSecret: process.env.MCP_OAUTH_CLIENT_SECRET ?? "",

  /** Token lifetimes */
  codeExpirySeconds:  5 * 60,          // Authorization codes: 5 minutes
  tokenExpirySeconds: 90 * 24 * 60 * 60, // Access tokens: 90 days

  /** Allowed redirect URIs — Claude's callback URL pattern */
  allowedRedirectUriPrefixes: [
    "https://claude.ai/",
    "https://api.claude.ai/",
    // Allow localhost for local Claude Desktop testing
    "http://localhost:",
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

/** Returns the base URL (strips trailing slash) */
export function getBaseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "https://eromify.in").replace(/\/$/, "");
}
