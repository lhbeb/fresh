import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Get domain name from request headers
    const domain = request.headers.get('origin') || request.headers.get('referer') || 'https://happydeel.com';

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

    // Create transporter for Gmail with app password
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

    await transporter.verify();

    // Email content
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Subject:</strong> ${subject}</li>
        <li><strong>Message:</strong> ${message}</li>
        <li><strong>Domain:</strong> ${domain}</li>
      </ul>
      <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
    `;

    const mailOptions = {
      from: emailUser,
      to: 'contacthappydeel@gmail.com',
      subject: `Contact Form: ${subject}`,
      html: emailContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully:', info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending contact email:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to send contact email', details: err.message },
      { status: 500 }
    );
  }
} 