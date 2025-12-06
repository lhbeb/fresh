import 'server-only';
import nodemailer from 'nodemailer';
import { updateOrderEmailStatus, getOrderById } from '@/lib/supabase/orders';
import { resolveBaseUrl } from '@/lib/url';

// Create transporter (in serverless, each invocation is isolated)
const createTransporter = (): nodemailer.Transporter => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error(
      'Missing email environment variables. Please set EMAIL_USER and EMAIL_PASS'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    secure: false,
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

const parseFullOrderData = (rawData: unknown): Record<string, any> | undefined => {
  if (!rawData) {
    return undefined;
  }

  if (typeof rawData === 'object') {
    return rawData as Record<string, any>;
  }

  if (typeof rawData === 'string') {
    try {
      return JSON.parse(rawData) as Record<string, any>;
    } catch {
      console.warn('⚠️ Unable to parse full_order_data string');
    }
  }

  return undefined;
};

/**
 * Send email for an order (used by background retry system)
 */
export async function sendOrderEmail(order: any): Promise<{ success: boolean; error?: string }> {
  try {
    const { product_title, product_price, product_slug, customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_state, shipping_zip, full_order_data } = order;

    const parsedFullOrderData = parseFullOrderData(full_order_data);
    const baseUrl = resolveBaseUrl([
      parsedFullOrderData?.siteUrl,
      parsedFullOrderData?.siteOrigin,
      order.site_url,
    ]);
    const normalizedSlug = typeof product_slug === 'string' ? product_slug.replace(/^\/+/, '') : '';
    const productPath = normalizedSlug ? `/products/${normalizedSlug}` : '';
    const productUrl = `${baseUrl}${productPath}`;

    const transporter = createTransporter();
    const emailUser = process.env.EMAIL_USER || 'contacthappydeel@gmail.com';

    const emailContent = `
      <h2>New Order Shipping Information</h2>
      
      <h3>Product Details:</h3>
      <ul>
        <li><strong>Product:</strong> ${product_title}</li>
        <li><strong>Price:</strong> $${product_price}</li>
        <li><strong>Product URL:</strong> ${productUrl}</li>
      </ul>

      <h3>Shipping Address:</h3>
      <ul>
        <li><strong>Street Address:</strong> ${shipping_address}</li>
        <li><strong>City:</strong> ${shipping_city}</li>
        <li><strong>State/Province:</strong> ${shipping_state}</li>
        <li><strong>Zip Code:</strong> ${shipping_zip}</li>
        <li><strong>Email:</strong> ${customer_email}</li>
        <li><strong>Phone Number:</strong> ${customer_phone || 'Not provided'}</li>
      </ul>

      <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
    `;

    const mailOptions = {
      from: emailUser,
      to: 'contacthappydeel@gmail.com',
      subject: `New Order - ${product_title}`,
      html: emailContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully for order ${order.id}:`, info.messageId);

    // Update order: email sent successfully
    await updateOrderEmailStatus(order.id, true, undefined, 0, null);

    return { success: true };
  } catch (error) {
    const err = error as Error;
    const errorMessage = err.message || 'Unknown error';
    console.error(`❌ Failed to send email for order ${order.id}:`, errorMessage);

    // Calculate next retry time (exponential backoff: 5min, 15min, 30min, 1hr, 2hr)
    const retryCount = (order.email_retry_count || 0) + 1;
    const retryDelays = [5, 15, 30, 60, 120]; // minutes
    const delayMinutes = retryDelays[Math.min(retryCount - 1, retryDelays.length - 1)];
    const nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();

    // Update order: email failed, schedule retry
    await updateOrderEmailStatus(order.id, false, errorMessage, retryCount, nextRetryAt);

    return { success: false, error: errorMessage };
  }
}

/**
 * Background email sender - doesn't block, runs async
 */
export async function sendOrderEmailAsync(orderId: string): Promise<void> {
  // Don't await - fire and forget
  // Use setImmediate or Promise.resolve().then() to ensure it runs after current execution
  Promise.resolve().then(async () => {
    try {
      console.log(`📧 [Async] Starting email send for order ${orderId}...`);
      const order = await getOrderById(orderId);
      
      if (!order) {
        console.error(`❌ [Async] Order ${orderId} not found in database`);
        return;
      }

      console.log(`📧 [Async] Order found, sending email...`);
      const result = await sendOrderEmail(order);
      
      if (result.success) {
        console.log(`✅ [Async] Email sent successfully for order ${orderId}`);
      } else {
        console.error(`❌ [Async] Email failed for order ${orderId}:`, result.error);
      }
    } catch (error) {
      console.error(`❌ [Async] Error in async email send for order ${orderId}:`, error);
      if (error instanceof Error) {
        console.error(`Error stack:`, error.stack);
      }
    }
  }).catch((error) => {
    console.error(`❌ [Async] Unhandled error in email async handler for order ${orderId}:`, error);
  });
}

