import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/db';
import { ContactMessage } from '@/models/ContactMessage';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'eromify.in@gmail.com',
    pass: process.env.SMTP_PASS || 'dsts vlia twof cimq', // App password
  },
});

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Please fill out all required fields.' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 1. Notification to Admin
    const adminMailOptions = {
      from: `"Eromify Contact Form" <${process.env.SMTP_USER || 'eromify.in@gmail.com'}>`,
      to: process.env.SMTP_USER || 'eromify.in@gmail.com',
      replyTo: email,
      subject: `New Contact Request: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <h2 style="color: #1736cf; border-bottom: 2px solid #1736cf; padding-bottom: 10px;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #1736cf; margin-top: 15px;">
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      `,
    };

    // 2. Auto-reply to User
    const userMailOptions = {
      from: `"Eromify Support" <${process.env.SMTP_USER || 'eromify.in@gmail.com'}>`,
      to: email,
      subject: `We received your message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1736cf;">Eromify Support</h1>
          </div>
          <p>Hi ${name},</p>
          <p>Thank you for reaching out! We have received your message regarding <strong>"${subject}"</strong>.</p>
          <p>Our support team is reviewing your request and will get back to you as soon as possible, usually within 24-48 hours.</p>
          <br />
          <p>Best regards,</p>
          <p><strong>The Eromify Team</strong></p>
        </div>
      `,
    };

    // Save to database
    await connectDB();
    await ContactMessage.create({ name, email, subject, message });

    // Send emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send your message. Please try again later.' },
      { status: 500 }
    );
  }
}
