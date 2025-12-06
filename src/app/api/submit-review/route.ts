import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, rating, title, content } = await request.json();

    // Validate required fields
    if (!name || !rating || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: name, rating, title, and content are required' },
        { status: 400 }
      );
    }

    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get domain name from request headers
    const domain = request.headers.get('origin') || request.headers.get('referer') || 'https://happydeel.com';

    // Create transporter for Gmail with app password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'arvaradodotcom@gmail.com',
        pass: 'iwar xzav utnb bxyw',
      },
      secure: false,
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();

    // Generate star rating display
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    // Email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0046be; border-bottom: 2px solid #0046be; padding-bottom: 10px;">
          New Customer Review Submitted
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Review Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Customer Name:</strong> ${name}</li>
            <li style="margin: 10px 0;"><strong>Rating:</strong> ${stars} (${rating}/5)</li>
            <li style="margin: 10px 0;"><strong>Review Title:</strong> ${title}</li>
            <li style="margin: 10px 0;"><strong>Review Content:</strong></li>
          </ul>
          <div style="background-color: white; padding: 15px; border-left: 4px solid #0046be; margin: 10px 0;">
            "${content}"
          </div>
        </div>

        <div style="background-color: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #0046be; margin-top: 0;">Submission Information:</h4>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 5px 0;"><strong>Submitted At:</strong> ${new Date().toLocaleString()}</li>
            <li style="margin: 5px 0;"><strong>Domain:</strong> ${domain}</li>
            <li style="margin: 5px 0;"><strong>IP Address:</strong> ${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'}</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            This review was submitted through the HappyDeel website review form.
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: 'arvaradodotcom@gmail.com',
      to: 'contacthappydeel@gmail.com',
      subject: `New Customer Review: ${title} (${rating}/5 stars)`,
      html: emailContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Review email sent successfully:', info.messageId);

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Review submitted successfully and notification sent'
    });
  } catch (error) {
    console.error('Error sending review email:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to submit review', details: err.message },
      { status: 500 }
    );
  }
}
