/**
 * POST /api/oauth/token
 *
 * OAuth 2.0 Token Endpoint.
 *
 * Supported grant types:
 *   authorization_code  — exchanges a PKCE authorization code for tokens
 *   refresh_token       — exchanges a refresh token for a new access token
 *
 * Expected body (application/x-www-form-urlencoded or JSON):
 *
 *   authorization_code:
 *     grant_type    = "authorization_code"
 *     code          = <the code from /oauth/authorize redirect>
 *     redirect_uri  = <same redirect_uri used in /oauth/authorize>
 *     client_id     = <MCP_OAUTH_CLIENT_ID>
 *     client_secret = <MCP_OAUTH_CLIENT_SECRET>
 *     code_verifier = <PKCE verifier (plain text that was hashed to code_challenge)>
 *
 *   refresh_token:
 *     grant_type    = "refresh_token"
 *     refresh_token = <the refresh_token from a previous authorization_code exchange>
 *     client_id     = <MCP_OAUTH_CLIENT_ID>
 *     client_secret = <MCP_OAUTH_CLIENT_SECRET>
 *
 * Returns:
 *   { access_token, refresh_token, token_type: "Bearer", expires_in, scope }
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes }   from "crypto";
import { connectDB }                 from "@/lib/db";
import { OAUTH_CONFIG, getBaseUrl }  from "@/lib/oauth-config";
import { OAuthCode }                 from "@/models/OAuthCode";
import { OAuthToken }                from "@/models/OAuthToken";

// ── Helpers ───────────────────────────────────────────────────────────────────

function errorResponse(error: string, description: string, status = 400) {
  return NextResponse.json(
    { error, error_description: description },
    {
      status,
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control":               "no-store",
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

/** Extracts client_id / client_secret from body OR Basic auth header */
function extractClientCredentials(
  body: Record<string, string>,
  request: NextRequest
): { clientId: string; clientSecret: string } {
  let clientId     = body.client_id     ?? "";
  let clientSecret = body.client_secret ?? "";

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
    const [id, secret] = decoded.split(":", 2);
    clientId     = id     ?? clientId;
    clientSecret = secret ?? clientSecret;
  }

  return { clientId, clientSecret };
}

/** Build a standard token response body */
function tokenResponse(
  accessToken:  string,
  refreshToken: string,
  scopes:       string[]
) {
  return NextResponse.json(
    {
      access_token:  accessToken,
      refresh_token: refreshToken,
      token_type:    "Bearer",
      expires_in:    OAUTH_CONFIG.tokenExpirySeconds,
      scope:         scopes.join(" "),
      issuer:        getBaseUrl(),
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

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  await connectDB();

  const body = await parseBody(request);
  const { grant_type } = body;
  const { clientId, clientSecret } = extractClientCredentials(body, request);

  // ── Validate client ───────────────────────────────────────────────────────
  if (
    clientId     !== OAUTH_CONFIG.clientId ||
    clientSecret !== OAUTH_CONFIG.clientSecret
  ) {
    return errorResponse("invalid_client", "Invalid client_id or client_secret", 401);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GRANT: authorization_code
  // ─────────────────────────────────────────────────────────────────────────
  if (grant_type === "authorization_code") {
    const { code, redirect_uri, code_verifier } = body;

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
    if (codeDoc.clientId !== clientId) {
      return errorResponse("invalid_grant", "Code was not issued for this client");
    }
    if (codeDoc.redirectUri !== redirect_uri) {
      return errorResponse("invalid_grant", "redirect_uri does not match");
    }
    if (!code_verifier) {
      return errorResponse("invalid_request", "Missing code_verifier (PKCE required)");
    }
    if (!verifyPkce(code_verifier, codeDoc.codeChallenge)) {
      return errorResponse("invalid_grant", "PKCE verification failed: code_verifier does not match code_challenge");
    }

    // Mark code as used (prevent replay)
    await OAuthCode.updateOne({ _id: codeDoc._id }, { $set: { used: true } });

    // Issue access + refresh tokens
    const rawAccessToken  = "eoat_" + randomBytes(40).toString("hex");
    const rawRefreshToken = "eort_" + randomBytes(40).toString("hex"); // Eromify OAuth Refresh Token
    const accessHash      = createHash("sha256").update(rawAccessToken).digest("hex");
    const refreshHash     = createHash("sha256").update(rawRefreshToken).digest("hex");
    const now             = new Date();
    const accessExpiresAt  = new Date(now.getTime() + OAUTH_CONFIG.tokenExpirySeconds        * 1000);
    const refreshExpiresAt = new Date(now.getTime() + OAUTH_CONFIG.refreshTokenExpirySeconds * 1000);

    await OAuthToken.create({
      tokenHash:        accessHash,
      refreshTokenHash: refreshHash,
      clientId,
      userId:           codeDoc.userId,
      scopes:           codeDoc.scopes,
      expiresAt:        accessExpiresAt,
      refreshExpiresAt,
    });

    console.log(`[oauth/token] ✅ Issued access+refresh tokens for user ${codeDoc.userId} via ${clientId}`);

    return tokenResponse(rawAccessToken, rawRefreshToken, codeDoc.scopes);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GRANT: refresh_token
  // ─────────────────────────────────────────────────────────────────────────
  if (grant_type === "refresh_token") {
    const { refresh_token } = body;

    if (!refresh_token) {
      return errorResponse("invalid_request", "Missing refresh_token parameter");
    }

    const refreshHash = createHash("sha256").update(refresh_token).digest("hex");

    const tokenDoc = await OAuthToken.findOne({
      refreshTokenHash: refreshHash,
      revokedAt:        { $exists: false },
    });

    if (!tokenDoc) {
      return errorResponse("invalid_grant", "Refresh token not found, revoked, or already rotated");
    }

    if (tokenDoc.refreshExpiresAt && tokenDoc.refreshExpiresAt < new Date()) {
      return errorResponse("invalid_grant", "Refresh token has expired — please re-authorize");
    }

    if (tokenDoc.clientId !== clientId) {
      return errorResponse("invalid_grant", "Refresh token was not issued for this client");
    }

    // Rotate: issue new access + refresh tokens, revoke old document
    const rawNewAccessToken  = "eoat_" + randomBytes(40).toString("hex");
    const rawNewRefreshToken = "eort_" + randomBytes(40).toString("hex");
    const newAccessHash      = createHash("sha256").update(rawNewAccessToken).digest("hex");
    const newRefreshHash     = createHash("sha256").update(rawNewRefreshToken).digest("hex");
    const now                = new Date();
    const newAccessExpiresAt  = new Date(now.getTime() + OAUTH_CONFIG.tokenExpirySeconds        * 1000);
    const newRefreshExpiresAt = new Date(now.getTime() + OAUTH_CONFIG.refreshTokenExpirySeconds * 1000);

    // Revoke old token + create new in parallel
    await Promise.all([
      OAuthToken.updateOne({ _id: tokenDoc._id }, { $set: { revokedAt: now } }),
      OAuthToken.create({
        tokenHash:        newAccessHash,
        refreshTokenHash: newRefreshHash,
        clientId,
        userId:           tokenDoc.userId,
        scopes:           tokenDoc.scopes,
        expiresAt:        newAccessExpiresAt,
        refreshExpiresAt: newRefreshExpiresAt,
      }),
    ]);

    console.log(`[oauth/token] 🔄 Rotated tokens for user ${tokenDoc.userId} via ${clientId}`);

    return tokenResponse(rawNewAccessToken, rawNewRefreshToken, tokenDoc.scopes);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Unknown grant type
  // ─────────────────────────────────────────────────────────────────────────
  return errorResponse("unsupported_grant_type", "Supported grant types: authorization_code, refresh_token");
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
