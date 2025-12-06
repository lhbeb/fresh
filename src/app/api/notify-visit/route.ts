import { NextRequest, NextResponse } from 'next/server';

// Hardcoded Telegram Bot credentials (no environment variables needed)
const TELEGRAM_BOT_TOKEN = '8103676783:AAGnnUDAZjYqVUtoaSyuTgdGReWWdVH_yrg';
const TELEGRAM_CHAT_ID = '-1002806502052';

function deviceTypeEmoji(type: string) {
  if (type === 'Mobile') return '📱';
  if (type === 'Tablet') return '💻';
  return '🖥️';
}

function countryCodeToFlagEmoji(countryCode: string) {
  if (!countryCode) return '';
  return countryCode
    .toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { device, deviceType, fingerprint, url, productTitle, productSlug, productPrice, action } = data;

    // Get IP address from headers (no req.ip)
    let ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    if (!ip || ip === '::1' || ip === '127.0.0.1') ip = '';

    // Fetch geo info server-side using ipwho.is
    let country = 'Unknown';
    let countryFlag = '';
    try {
      if (ip) {
        const geoRes = await fetch(`https://ipwho.is/${ip}`);
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.success) {
            country = geo.country || 'Unknown';
            countryFlag = geo.country_code ? countryCodeToFlagEmoji(geo.country_code) : '';
          }
        }
      }
    } catch (e) {
      // Ignore geo errors, fallback to unknown
    }

    // Date and time (server-side)
    const now = new Date();
    const date = now.toLocaleDateString('en-US');
    const time = now.toLocaleTimeString('en-US');

    // Check if this is a checkout page visit, add to cart action, or About Us page visit
    const isCheckoutPage = url.includes('/checkout') || action === 'checkout_visit';
    const isAddToCart = action === 'add_to_cart';
    const isAboutPage = url.includes('/about');

    let message: string;
    if (isAddToCart && productTitle) {
      // Special notification for "Add to Cart" action
      message = [
        '🛒 <b>🛍️ ADD TO CART ACTION 🛍️</b> 🛒',
        '',
        '💰 <b>A user added a product to cart!</b> 💰',
        '',
        `📦 <b>Product:</b> ${productTitle}`,
        productPrice ? `💵 <b>Price:</b> $${productPrice.toLocaleString()}` : '',
        productSlug ? `🔗 <b>Product URL:</b> <a href="${url.replace('/checkout', `/products/${productSlug}`)}">View Product</a>` : '',
        '',
        `🔗 <b>Current URL:</b> <a href="${url}">${url}</a>`,
        `🔎 <b>IP:</b> <code>${ip || 'Unknown'}</code>`,
        `🏳️ <b>Country:</b> ${countryFlag ? countryFlag + ' ' : ''}${country}`,
        `${deviceTypeEmoji(deviceType)} <b>Device:</b> ${deviceType} <code>${device}</code>`,
        `🆔 <b>Fingerprint:</b> <code>${fingerprint}</code>`,
        `📅 <b>Date:</b> <code>${date}</code>`,
        `⏰ <b>Time:</b> <code>${time}</code>`,
        '',
        '⚠️ <b>User is showing purchase intent!</b> ⚠️'
      ].filter(line => line !== '').join('\n');
    } else if (isCheckoutPage) {
      // Special high-priority message for checkout page
      message = [
        '🛒 <b>🚨 CHECKOUT PAGE VISIT 🚨</b> 🛒',
        '',
        '💰 <b>A user is on the checkout page!</b> 💰',
        '',
        `🔗 <b>URL:</b> <a href="${url}">${url}</a>`,
        `🔎 <b>IP:</b> <code>${ip || 'Unknown'}</code>`,
        `🏳️ <b>Country:</b> ${countryFlag ? countryFlag + ' ' : ''}${country}`,
        `${deviceTypeEmoji(deviceType)} <b>Device:</b> ${deviceType} <code>${device}</code>`,
        `🆔 <b>Fingerprint:</b> <code>${fingerprint}</code>`,
        `📅 <b>Date:</b> <code>${date}</code>`,
        `⏰ <b>Time:</b> <code>${time}</code>`,
        '',
        '⚠️ <b>ACTION REQUIRED: Monitor this user for potential purchase!</b> ⚠️'
      ].join('\n');
    } else if (isAboutPage) {
      // Special notification for About Us page visit
      message = [
        '📖 <b>📄 ABOUT US PAGE VISIT 📄</b> 📖',
        '',
        '👤 <b>A user is viewing the About Us page!</b> 👤',
        '',
        `🔗 <b>URL:</b> <a href="${url}">${url}</a>`,
        `🔎 <b>IP:</b> <code>${ip || 'Unknown'}</code>`,
        `🏳️ <b>Country:</b> ${countryFlag ? countryFlag + ' ' : ''}${country}`,
        `${deviceTypeEmoji(deviceType)} <b>Device:</b> ${deviceType} <code>${device}</code>`,
        `🆔 <b>Fingerprint:</b> <code>${fingerprint}</code>`,
        `📅 <b>Date:</b> <code>${date}</code>`,
        `⏰ <b>Time:</b> <code>${time}</code>`,
        '',
        'ℹ️ <b>User is learning about HappyDeel!</b> ℹ️'
      ].join('\n');
    } else {
      // Regular visit notification
      message = [
        '👀 <b>New Website Visit</b> 🚀',
        `🔗 <b>URL:</b> <a href="${url}">${url}</a>`,
        `🔎 <b>IP:</b> <code>${ip || 'Unknown'}</code>`,
        `🏳️ <b>Country:</b> ${countryFlag ? countryFlag + ' ' : ''}${country}`,
        `${deviceTypeEmoji(deviceType)} <b>Device:</b> ${deviceType} <code>${device}</code>`,
        `🆔 <b>Fingerprint:</b> <code>${fingerprint}</code>`,
        `📅 <b>Date:</b> <code>${date}</code>`,
        `⏰ <b>Time:</b> <code>${time}</code>`
      ].join('\n');
    }

    const tgUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
      await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          // For checkout pages, add to cart, and About Us page, ensure notification is sent
          ...((isCheckoutPage || isAddToCart || isAboutPage) && { disable_notification: false }),
        }),
      });
    } catch (e) {
      // Telegram error, log but don't throw
      console.error('Telegram API failed', e);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Notify-visit API error:', e);
    return NextResponse.json({ ok: false, error: String(e) });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Use POST' }, { status: 405 });
} 