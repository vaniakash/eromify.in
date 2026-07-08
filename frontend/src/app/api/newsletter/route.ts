import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/db';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'eromify.in@gmail.com',
    pass: process.env.SMTP_PASS || 'dsts vlia twof cimq', // App password
  },
});

// Email validation function
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if email already exists and is active
    const existingSubscriber = await NewsletterSubscriber.findOne({ 
      email: email.toLowerCase(), 
      isActive: true 
    });

    if (existingSubscriber) {
      return NextResponse.json(
        { success: false, message: 'This email is already subscribed to our newsletter.' },
        { status: 409 }
      );
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create new subscriber
    const subscriber = new NewsletterSubscriber({
      email: email.toLowerCase(),
      ipAddress,
      userAgent,
    });

    await subscriber.save();

    // Send confirmation email to subscriber
    const subscriberMailOptions = {
      from: `"Eromify Newsletter" <${process.env.SMTP_USER || 'eromify.in@gmail.com'}>`,
      to: email,
      subject: 'Welcome to Eromify Newsletter! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1736cf, #1430b8); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to Eromify!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your weekly dose of tech insights</p>
          </div>
          
          <div style="padding: 30px 20px; background: #ffffff;">
            <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 15px;">Thank you for subscribing! 🙏</h2>
            
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              You're now part of our growing community of 15,000+ developers, students, and tech enthusiasts who receive:
            </p>
            
            <ul style="color: #64748b; line-height: 1.6; margin-bottom: 25px; padding-left: 20px;">
              <li>✨ Weekly insights on AI and software development</li>
              <li>🛠️ Curated tool recommendations and tutorials</li>
              <li>📈 Career growth tips and industry trends</li>
              <li>🚀 Exclusive updates about new Eromify tools</li>
            </ul>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
              <p style="color: #475569; margin: 0; font-weight: 600;">What to expect:</p>
              <p style="color: #64748b; margin: 8px 0 0 0; font-size: 14px;">
                We'll send you our newsletter every Tuesday at 9 AM EST, packed with actionable insights and the latest tech news.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
              Have questions or suggestions? Feel free to reply to this email - we'd love to hear from you!
            </p>
            
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong style="color: #1736cf;">The Eromify Team</strong>
            </p>
          </div>
          
          <div style="padding: 20px; background: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              You're receiving this because you subscribed to the Eromify Newsletter.<br>
              <a href="#" style="color: #1736cf; text-decoration: none;">Unsubscribe</a> | 
              <a href="#" style="color: #1736cf; text-decoration: none;">Update Preferences</a>
            </p>
          </div>
        </div>
      `,
    };

    // Send notification email to admin
    const adminMailOptions = {
      from: `"Eromify Newsletter" <${process.env.SMTP_USER || 'eromify.in@gmail.com'}>`,
      to: process.env.SMTP_USER || 'eromify.in@gmail.com',
      subject: 'New Newsletter Subscriber! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">New Subscriber!</h1>
          </div>
          <div style="padding: 20px; background: #ffffff;">
            <p style="color: #64748b; font-size: 16px;">
              A new user has subscribed to the Eromify newsletter:
            </p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="color: #1e293b; margin: 0; font-weight: bold;">Email: ${email}</p>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">
                Subscribed at: ${new Date().toLocaleString()}
              </p>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              Total subscribers: +1
            </p>
          </div>
        </div>
      `,
    };

    // Send emails
    await Promise.all([
      transporter.sendMail(subscriberMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to the newsletter! Check your email for confirmation.',
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to subscribe to the newsletter. Please try again later.' },
      { status: 500 }
    );
  }
}