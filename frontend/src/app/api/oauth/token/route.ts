/**
 * POST /api/oauth/token
 *
 * OAuth 2.0 Token Endpoint — exchanges an authorization code for an access token.
 *
 * Expected body (application/x-www-form-urlencoded or JSON):
 *   grant_type    = "authorization_code"
 *   code          = <the code from /oauth/authorize redirect>
 *   redirect_uri  = <same redirect_uri used in /oauth/authorize>
 *   client_id     = <MCP_OAUTH_CLIENT_ID>
 *   client_secret = <MCP_OAUTH_CLIENT_SECRET>
 *   code_verifier = <PKCE verifier (plain text that was hashed to code_challenge)>
 *
 * Returns:
 *   { access_token, token_type: "Bearer", expires_in }
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes }   from "crypto";
import { connectDB }                 from "@/lib/db";
import { OAUTH_CONFIG, getBaseUrl }  from "@/lib/oauth-config";
import { OAuthCode }                 from "@/models/OAuthCode";
import { OAuthToken }                from "@/models/OAuthToken";

function errorResponse(error: string, description: string, status = 400) {
  return NextResponse.json(
    { error, error_description: description },
    {
      status,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

/** Parse both JSON and form-encoded request bodies */
async function parseBody(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return await req.json();
  }
  const text = await req.text();
  return Object.fromEntries(new URLSearchParams(text));
}

/** Verify PKCE: SHA-256(code_verifier) must equal code_challenge (base64url) */
function verifyPkce(codeVerifier: string, codeChallenge: string): boolean {
  const digest = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return digest === codeChallenge;
}

export async function POST(request: NextRequest) {
  await connectDB();

  const body = await parseBody(request);
  const {
    grant_type,
    code,
    redirect_uri,
    client_id,
    client_secret,
    code_verifier,
  } = body;

  // ── 1. Validate grant type ────────────────────────────────────────────────
  if (grant_type !== "authorization_code") {
    return errorResponse("unsupported_grant_type", "Only authorization_code is supported");
  }

  // ── 2. Validate client credentials ───────────────────────────────────────
  // Also support Basic auth header: Authorization: Basic base64(client_id:client_secret)
  let effectiveClientId     = client_id;
  let effectiveClientSecret = client_secret;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
    const [id, secret] = decoded.split(":", 2);
    effectiveClientId     = id;
    effectiveClientSecret = secret;
  }

  if (
    effectiveClientId     !== OAUTH_CONFIG.clientId ||
    effectiveClientSecret !== OAUTH_CONFIG.clientSecret
  ) {
    return errorResponse("invalid_client", "Invalid client_id or client_secret", 401);
  }

  // ── 3. Find and validate the authorization code ───────────────────────────
  if (!code) {
    return errorResponse("invalid_request", "Missing code parameter");
  }

  const codeDoc = await OAuthCode.findOne({ code });
  if (!codeDoc) {
    return errorResponse("invalid_grant", "Authorization code not found or expired");
  }

  if (codeDoc.used) {
    return errorResponse("invalid_grant", "Authorization code has already been used");
  }

  if (codeDoc.expiresAt < new Date()) {
    await OAuthCode.deleteOne({ _id: codeDoc._id });
    return errorResponse("invalid_grant", "Authorization code has expired");
  }

  if (codeDoc.clientId !== effectiveClientId) {
    return errorResponse("invalid_grant", "Code was not issued for this client");
  }

  if (codeDoc.redirectUri !== redirect_uri) {
    return errorResponse("invalid_grant", "redirect_uri does not match");
  }

  // ── 4. Verify PKCE ────────────────────────────────────────────────────────
  if (!code_verifier) {
    return errorResponse("invalid_request", "Missing code_verifier (PKCE required)");
  }

  if (!verifyPkce(code_verifier, codeDoc.codeChallenge)) {
    return errorResponse("invalid_grant", "PKCE verification failed: code_verifier does not match code_challenge");
  }

  // ── 5. Mark code as used (prevent replay) ────────────────────────────────
  await OAuthCode.updateOne({ _id: codeDoc._id }, { $set: { used: true } });

  // ── 6. Issue access token ─────────────────────────────────────────────────
  const rawToken  = "eoat_" + randomBytes(40).toString("hex"); // Eromify OAuth Access Token
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + OAUTH_CONFIG.tokenExpirySeconds * 1000);

  await OAuthToken.create({
    tokenHash,
    clientId: effectiveClientId,
    userId:   codeDoc.userId,
    scopes:   codeDoc.scopes,
    expiresAt,
  });

  console.log(`[oauth/token] ✅ Issued token for user ${codeDoc.userId} via ${effectiveClientId}`);

  return NextResponse.json(
    {
      access_token: rawToken,
      token_type:   "Bearer",
      expires_in:   OAUTH_CONFIG.tokenExpirySeconds,
      scope:        codeDoc.scopes.join(" "),
      issuer:       getBaseUrl(),
    },
    {
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control":               "no-store",
      },
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
