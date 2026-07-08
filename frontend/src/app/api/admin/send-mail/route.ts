import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { auth } from "@/auth";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || "eromify.in@gmail.com",
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    // ── Auth guard: only authenticated admins can send email ─────────────────
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Only allow the designated admin email to use this endpoint
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail && session.user.email !== adminEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { to, subject, message } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    await transporter.sendMail({
      from: `"Eromify Admin" <${process.env.SMTP_USER || "eromify.in@gmail.com"}>`,
      to,
      subject,
      html: `
        <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#07101f;color:#e8eeff;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c6cfe,#22d3ee);padding:36px 32px;">
            <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff;">Eromify</h1>
            <p style="margin:8px 0 0;font-size:14px;opacity:0.85;color:#fff;">Message from the Eromify team</p>
          </div>
          <div style="padding:32px;">
            <div style="font-size:15px;line-height:1.7;color:#c8d4f0;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          </div>
          <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#4a5470;text-align:center;">
            Eromify · AI Influencer Creator · eromify.in
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin mail error:", err);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
