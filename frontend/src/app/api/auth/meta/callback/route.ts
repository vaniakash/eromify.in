import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { InstagramAccount } from "@/models/InstagramAccount";

const GRAPH_API = "https://graph.facebook.com/v19.0";

/**
 * GET /api/auth/meta/callback
 * Handles the OAuth redirect from Meta:
 * 1. Exchange code → short-lived user token
 * 2. Exchange → long-lived user token (60 days)
 * 3. Fetch Facebook Pages (/me/accounts)
 * 4. For each page, find its linked Instagram Business Account
 * 5. Get a Permanent Page Access Token
 * 6. Save everything to MongoDB
 * 7. Redirect to the AutoDM dashboard
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;
  const redirectUri =
    process.env.META_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL}/api/auth/meta/callback`;

  // User denied permission
  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/tools/creator/instagram-autodm?error=permission_denied`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/tools/creator/instagram-autodm?error=invalid_callback`
    );
  }

  // Decode userId from state
  let userId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    userId = decoded.userId;
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/tools/creator/instagram-autodm?error=invalid_state`
    );
  }

  try {
    // Step 1: Exchange code for short-lived user access token
    const tokenRes = await fetch(
      `${GRAPH_API}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    const shortLivedToken: string = tokenData.access_token;

    // Step 2: Exchange for long-lived user token
    const longRes = await fetch(
      `${GRAPH_API}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`
    );
    const longData = await longRes.json();

    if (longData.error) {
      throw new Error(longData.error.message);
    }

    const longLivedToken: string = longData.access_token;

    // Step 3: Get the user's Facebook ID
    const meRes = await fetch(`${GRAPH_API}/me?access_token=${longLivedToken}`);
    const meData = await meRes.json();
    const facebookUserId: string = meData.id;

    // Step 4: Get Facebook Pages the user manages
    const pagesRes = await fetch(
      `${GRAPH_API}/me/accounts?access_token=${longLivedToken}`
    );
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/tools/creator/instagram-autodm?error=no_pages`
      );
    }

    await connectDB();

    // Step 5: For each page, find linked Instagram Business Account
    for (const page of pagesData.data) {
      const pageId: string = page.id;
      const pageName: string = page.name;
      // This is the permanent Page Access Token
      const pageToken: string = page.access_token;

      const igRes = await fetch(
        `${GRAPH_API}/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
      );
      const igData = await igRes.json();

      if (!igData.instagram_business_account) continue;

      const instagramId: string = igData.instagram_business_account.id;

      // Fetch IG username and profile pic
      const igDetailsRes = await fetch(
        `${GRAPH_API}/${instagramId}?fields=username,profile_picture_url&access_token=${pageToken}`
      );
      const igDetails = await igDetailsRes.json();

      // Step 6: Save to MongoDB (upsert by instagramId)
      await InstagramAccount.findOneAndUpdate(
        { instagramId },
        {
          userId,
          facebookUserId,
          pageId,
          pageName,
          instagramId,
          instagramUsername: igDetails.username || "unknown",
          instagramProfilePic: igDetails.profile_picture_url || "",
          accessToken: pageToken,
          isActive: true,
        },
        { upsert: true, new: true }
      );
    }

    // Step 7: Redirect to success
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/tools/creator/instagram-autodm?success=connected`
    );
  } catch (err) {
    console.error("[Meta OAuth Callback Error]", err);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/tools/creator/instagram-autodm?error=oauth_failed`
    );
  }
}
