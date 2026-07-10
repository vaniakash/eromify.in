/**
 * /api/mcp/keys/route.ts
 *
 * MCP API Key management endpoints.
 * All routes require a valid NextAuth session (logged-in Eromify user).
 *
 * GET    /api/mcp/keys        → list existing keys (hashed — raw key never returned)
 * POST   /api/mcp/keys        → generate a new key (raw key returned ONCE, then discarded)
 * DELETE /api/mcp/keys?id=... → revoke a key (effective immediately)
 */

import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash }   from "crypto";
import { auth }                      from "@/auth";
import { connectDB }                 from "@/lib/db";
import { User }                      from "@/models/User";

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_KEYS_PER_USER = 10;
const KEY_PREFIX        = "emcp_"; // Eromify MCP key prefix — makes keys identifiable

// ── Helpers ───────────────────────────────────────────────────────────────────

function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

function generateRawKey(): string {
  // 32 bytes → 64 hex chars; prefix makes the key identifiable if accidentally exposed
  return KEY_PREFIX + randomBytes(32).toString("hex");
}

// ── GET /api/mcp/keys ─────────────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email })
    .select("mcpApiKeys")
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Return key metadata — never the hash or raw key
  const keys = (user.mcpApiKeys ?? []).map((k) => ({
    id:         k._id?.toString(),
    label:      k.label ?? null,
    createdAt:  k.createdAt,
    lastUsedAt: k.lastUsedAt ?? null,
    revoked:    !!k.revokedAt,
    revokedAt:  k.revokedAt ?? null,
    // Return a safe partial preview: first 8 chars of hash (NOT the raw key)
    keyPreview: `emcp_...${k.keyHash.slice(-8)}`,
  }));

  return NextResponse.json({ keys });
}

// ── POST /api/mcp/keys ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let label: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    label = typeof body.label === "string" ? body.label.trim().slice(0, 64) : undefined;
  } catch {
    // label is optional — silently ignore parse errors
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).select("mcpApiKeys mcpAccess");

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // ── Professional Pack gate ─────────────────────────────────────────────────
  if (!user.mcpAccess) {
    return NextResponse.json(
      {
        error:   "Professional Pack required",
        message: "Claude MCP access is exclusive to the Professional Pack (₹499) and Enterprise Pack (₹1999). Upgrade at eromify.in/pricing.",
        code:    "MCP_PLAN_REQUIRED",
      },
      { status: 403 }
    );
  }

  // Enforce per-user key limit
  const activeKeys = (user.mcpApiKeys ?? []).filter((k) => !k.revokedAt);
  if (activeKeys.length >= MAX_KEYS_PER_USER) {
    return NextResponse.json(
      { error: `You can have at most ${MAX_KEYS_PER_USER} active MCP API keys. Revoke an existing key first.` },
      { status: 422 }
    );
  }

  // Generate key — raw key shown ONCE, never stored
  const rawKey  = generateRawKey();
  const keyHash = hashKey(rawKey);

  const newKeyEntry = {
    keyHash,
    label:     label || undefined,
    createdAt: new Date(),
  };

  await User.updateOne(
    { _id: user._id },
    { $push: { mcpApiKeys: newKeyEntry } }
  );

  // Fetch the newly created subdoc to get its _id
  const updatedUser = await User.findOne({ _id: user._id })
    .select("mcpApiKeys")
    .lean();

  const newEntry = updatedUser?.mcpApiKeys
    ?.find((k) => k.keyHash === keyHash);

  return NextResponse.json(
    {
      /**
       * SECURITY: This is the ONLY time the raw key is returned.
       * After this response is sent, it cannot be recovered.
       * Instruct the user to copy it immediately.
       */
      key:       rawKey,
      id:        newEntry?._id?.toString(),
      label:     newEntry?.label ?? null,
      createdAt: newEntry?.createdAt,
      warning:   "Copy this key now — it will not be shown again.",
    },
    { status: 201 }
  );
}

// ── DELETE /api/mcp/keys?id=<keyId> ──────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get("id");

  if (!keyId) {
    return NextResponse.json({ error: "Missing query parameter: id" }, { status: 400 });
  }

  await connectDB();

  // Set revokedAt — the auth middleware checks for revokedAt absence so this
  // takes effect on the NEXT request (within milliseconds of this call)
  const result = await User.updateOne(
    {
      email: session.user.email,
      "mcpApiKeys._id": keyId,
      "mcpApiKeys.revokedAt": { $exists: false }, // only revoke if not already revoked
    },
    {
      $set: { "mcpApiKeys.$.revokedAt": new Date() },
    }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json(
      { error: "Key not found or already revoked" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: "Key revoked successfully." });
}
