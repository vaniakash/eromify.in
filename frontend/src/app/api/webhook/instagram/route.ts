import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { InstagramAccount } from "@/models/InstagramAccount";
import { InstagramRule } from "@/models/InstagramRule";
import { InstagramLog } from "@/models/InstagramLog";

const GRAPH_API = "https://graph.facebook.com/v19.0";

/**
 * GET /api/webhook/instagram
 * Meta webhook verification handshake.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log("[Webhook] Meta verification successful");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

/**
 * POST /api/webhook/instagram
 * Receives comment and message events from Meta.
 * 1. Validates X-Hub-Signature-256
 * 2. Parses the event payload
 * 3. Matches rules by keyword
 * 4. Fires comment reply and/or DM via Graph API
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  // Validate signature
  const signature = request.headers.get("x-hub-signature-256");
  if (!validateSignature(rawBody, signature)) {
    return new Response("Signature mismatch", { status: 403 });
  }

  let body: WebhookPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Process asynchronously — respond 200 immediately to Meta
  processWebhookEvent(body).catch((err) =>
    console.error("[Webhook Processing Error]", err)
  );

  return new Response("EVENT_RECEIVED", { status: 200 });
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

interface WebhookEntry {
  id: string; // Page ID
  time: number;
  changes?: CommentChange[];
  messaging?: MessagingEvent[];
}

interface CommentChange {
  field: string;
  value: {
    from: { id: string; name?: string };
    media: { id: string };
    id: string; // comment ID
    text: string;
  };
}

interface MessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  message?: { text: string };
}

// ─── Core processing ─────────────────────────────────────────────────────────

async function processWebhookEvent(body: WebhookPayload) {
  if (body.object !== "instagram" && body.object !== "page") return;

  await connectDB();

  for (const entry of body.entry) {
    const pageId = entry.id;

    // Find the account by pageId
    const account = await InstagramAccount.findOne({ pageId, isActive: true });
    if (!account) continue;

    const rules = await InstagramRule.find({
      accountId: account._id,
      isActive: true,
    });

    if (!rules.length) continue;

    // Handle comment events
    if (entry.changes) {
      for (const change of entry.changes) {
        if (change.field !== "comments") continue;
        const { text, id: commentId, from } = change.value;
        await handleCommentEvent(account, rules, commentId, text, from.id);
      }
    }

    // Handle messaging events (DM replies only if user initiated)
    if (entry.messaging) {
      for (const msg of entry.messaging) {
        if (!msg.message?.text) continue;
        const senderId = msg.sender.id;
        // Don't reply to ourselves
        if (senderId === account.instagramId) continue;
        await handleMessageEvent(account, rules, msg.message.text, senderId);
      }
    }
  }
}

async function handleCommentEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  account: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules: any[],
  commentId: string,
  commentText: string,
  commenterIgsid: string
) {
  const matchedRule = matchRule(rules, commentText);
  if (!matchedRule) return;

  const token = account.accessToken;

  // Reply to comment publicly
  if (matchedRule.action.replyComment && matchedRule.action.commentText) {
    const logType = "comment_reply" as const;
    try {
      const res = await fetch(
        `${GRAPH_API}/${commentId}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: matchedRule.action.commentText,
            access_token: token,
          }),
        }
      );
      const data = await res.json();
      await logAction(account, logType, matchedRule, commenterIgsid, commentId, data.error?.message);
    } catch (err) {
      await logAction(account, logType, matchedRule, commenterIgsid, commentId, String(err));
    }
  }

  // Send DM
  if (matchedRule.action.sendDM) {
    await sendDM(account, matchedRule, commenterIgsid, commentId);
  }

  // Increment trigger count
  await matchedRule.updateOne({ $inc: { triggerCount: 1 } });
}

async function handleMessageEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  account: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules: any[],
  messageText: string,
  senderIgsid: string
) {
  const matchedRule = matchRule(rules, messageText);
  if (!matchedRule || !matchedRule.action.sendDM) return;

  await sendDM(account, matchedRule, senderIgsid);
  await matchedRule.updateOne({ $inc: { triggerCount: 1 } });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function matchRule(rules: any[], text: string): any | null {
  const lowerText = text.toLowerCase();
  // Check keyword rules first, then "all" rules
  const keywordRule = rules.find(
    (r) =>
      r.trigger.type === "keyword" &&
      r.trigger.keyword &&
      lowerText.includes(r.trigger.keyword.toLowerCase())
  );
  if (keywordRule) return keywordRule;

  return rules.find((r) => r.trigger.type === "all") || null;
}

async function sendDM(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  account: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rule: any,
  recipientIgsid: string,
  commentId?: string
) {
  const logType = "dm_sent" as const;
  try {
    const res = await fetch(`${GRAPH_API}/me/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientIgsid },
        message: { text: rule.action.dmText },
        access_token: account.accessToken,
      }),
    });
    const data = await res.json();
    await logAction(account, logType, rule, recipientIgsid, commentId, data.error?.message);
  } catch (err) {
    await logAction(account, logType, rule, recipientIgsid, commentId, String(err));
  }
}

async function logAction(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  account: any,
  type: "comment_reply" | "dm_sent",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rule: any,
  targetUserId: string,
  commentId?: string,
  errorMsg?: string
) {
  await InstagramLog.create({
    accountId: account._id,
    userId: account.userId,
    type,
    triggerKeyword: rule.trigger.keyword || "any",
    commentId,
    targetUserId,
    status: errorMsg ? "failed" : "success",
    error: errorMsg,
  });
}

// ─── Signature validation ─────────────────────────────────────────────────────

function validateSignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.META_APP_SECRET) return false;
  const expected = `sha256=${crypto
    .createHmac("sha256", process.env.META_APP_SECRET)
    .update(body)
    .digest("hex")}`;
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
