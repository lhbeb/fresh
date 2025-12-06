import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get email credentials from environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error('❌ Missing email environment variables: EMAIL_USER or EMAIL_PASS');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Create transporter for Gmail with app password (same as existing email routes)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      secure: false,
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    await transporter.verify();

    // Email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0046be;">New Newsletter Subscription</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Source:</strong> HappyDeel Website Newsletter</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          This email was sent from the newsletter subscription form on your HappyDeel website.
        </p>
      </div>
    `;

    // Email options
    const mailOptions = {
      from: emailUser,
      to: 'contacthappydeel@gmail.com',
      subject: 'New Newsletter Subscription - HappyDeel',
      html: emailContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Newsletter subscription email sent successfully:', info.messageId);

    return NextResponse.json(
      { success: true, message: 'Subscription email sent successfully', messageId: info.messageId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to send subscription email', details: err.message },
      { status: 500 }
    );
  }
} 