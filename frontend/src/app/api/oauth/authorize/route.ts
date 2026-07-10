/**
 * POST /api/oauth/authorize
 *
 * Handles the user's "Approve" or "Deny" action from the consent page.
 * Called by the form on /oauth/authorize page.
 *
 * On Approve: creates an OAuthCode and redirects to redirect_uri with ?code=...&state=...
 * On Deny:    redirects to redirect_uri with ?error=access_denied
 */

import { NextRequest, NextResponse } from "next/server";
import { randomBytes }               from "crypto";
import { auth }                      from "@/auth";
import { connectDB }                 from "@/lib/db";
import { User }                      from "@/models/User";
import { OAuthCode }                 from "@/models/OAuthCode";
import { OAUTH_CONFIG, isAllowedRedirectUri } from "@/lib/oauth-config";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const body       = await request.formData();
  const action     = body.get("action")?.toString();        // "approve" | "deny"
  const clientId   = body.get("client_id")?.toString()     ?? "";
  const redirectUri= body.get("redirect_uri")?.toString()  ?? "";
  const state      = body.get("state")?.toString()         ?? "";
  const codeChallenge     = body.get("code_challenge")?.toString()      ?? "";
  const codeChallengeMethod = body.get("code_challenge_method")?.toString() ?? "S256";

  // Validate redirect_uri
  if (!isAllowedRedirectUri(redirectUri)) {
    return NextResponse.json({ error: "invalid_redirect_uri" }, { status: 400 });
  }

  // Build redirect URL helper
  const redirect = (params: Record<string, string>) => {
    const url = new URL(redirectUri);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    if (state) url.searchParams.set("state", state);
    return NextResponse.redirect(url.toString());
  };

  // ── Denied ────────────────────────────────────────────────────────────────
  if (action !== "approve") {
    return redirect({ error: "access_denied", error_description: "User denied the request" });
  }

  // ── Validate client ───────────────────────────────────────────────────────
  if (clientId !== OAUTH_CONFIG.clientId) {
    return redirect({ error: "invalid_client" });
  }

  // ── Find user ─────────────────────────────────────────────────────────────
  await connectDB();
  const user = await User.findOne({ email: session.user.email }).select("_id mcpAccess").lean();
  if (!user) {
    return redirect({ error: "server_error", error_description: "User not found" });
  }

  // ── Check Pro gating ──────────────────────────────────────────────────────
  if (!user.mcpAccess) {
    return redirect({ error: "access_denied", error_description: "MCP access requires the Professional Pack" });
  }

  // ── Issue authorization code ──────────────────────────────────────────────
  const code      = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + OAUTH_CONFIG.codeExpirySeconds * 1000);

  await OAuthCode.create({
    code,
    clientId,
    userId:      user._id,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
    scopes:      ["mcp"],
    expiresAt,
    used:        false,
  });

  console.log(`[oauth/authorize] ✅ Code issued for user ${user._id}`);

  return redirect({ code });
}
