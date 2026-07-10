/**
 * /.well-known/oauth-protected-resource
 *
 * Required by the MCP spec (RFC 9728) so that OAuth-capable clients like
 * Claude can discover this server's auth requirements.
 *
 * Since we use simple Bearer tokens (not a full OAuth server), we point
 * authorization_servers to our own domain. Claude will fall back to
 * prompting the user for a Bearer token when no full OAuth flow is found.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "https://eromify.in";

  return NextResponse.json(
    {
      resource:                 `${baseUrl}/api/mcp`,
      authorization_servers:    [`${baseUrl}`],
      bearer_methods_supported: ["header"],
      resource_documentation:   `${baseUrl}/mcp`,
    },
    {
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
