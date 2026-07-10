/**
 * /.well-known/oauth-authorization-server
 *
 * RFC 8414 — OAuth 2.0 Authorization Server Metadata
 * Claude reads this endpoint to discover where to send users for login/approval
 * and where to POST to exchange codes for tokens.
 *
 * This MUST be present for Claude's OAuth connector flow to work.
 */

import { NextResponse } from "next/server";
import { getBaseUrl, OAUTH_CONFIG } from "@/lib/oauth-config";

export async function GET() {
  const base = getBaseUrl();

  return NextResponse.json(
    {
      issuer:                 base,
      authorization_endpoint: `${base}/oauth/authorize`,
      token_endpoint:         `${base}/api/oauth/token`,
      token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
      grant_types_supported:  ["authorization_code"],
      response_types_supported: ["code"],
      code_challenge_methods_supported: ["S256"],
      scopes_supported:       OAUTH_CONFIG.scopes,
      service_documentation:  `${base}/mcp`,
    },
    {
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control":               "public, max-age=3600",
      },
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
