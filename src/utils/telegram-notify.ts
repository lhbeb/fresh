/**
 * Utility function to send Telegram notifications
 * Can be called from anywhere in the client-side code
 */

interface NotificationData {
  device?: string;
  deviceType?: string;
  fingerprint?: string;
  url: string;
  productTitle?: string;
  productSlug?: string;
  productPrice?: number;
  action?: 'add_to_cart' | 'checkout_visit' | 'page_visit';
}

export async function sendTelegramNotification(data: NotificationData): Promise<void> {
  try {
    // Get device info if not provided
    let device = data.device;
    let deviceType = data.deviceType;
    let fingerprint = data.fingerprint;

    if (typeof window !== 'undefined') {
      if (!device) {
        device = `${navigator.platform} - ${navigator.userAgent}`;
      }
      
      if (!deviceType) {
        const ua = navigator.userAgent;
        if (/Mobi|Android/i.test(ua)) {
          deviceType = 'Mobile';
        } else if (/Tablet|iPad/i.test(ua)) {
          deviceType = 'Tablet';
        } else {
          deviceType = 'Desktop';
        }
      }

      // Get fingerprint if not provided
      if (!fingerprint) {
        try {
          const FingerprintJS = (await import('@fingerprintjs/fingerprintjs')).default;
          const fp = await FingerprintJS.load();
          const result = await fp.get();
          fingerprint = result.visitorId;
        } catch (e) {
          console.warn('Failed to get fingerprint:', e);
          fingerprint = 'unknown';
        }
      }
    }

    // Send to API
    await fetch('/api/notify-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device: device || 'Unknown',
        deviceType: deviceType || 'Unknown',
        fingerprint: fingerprint || 'unknown',
        url: data.url,
        productTitle: data.productTitle,
        productSlug: data.productSlug,
        productPrice: data.productPrice,
        action: data.action || 'page_visit',
      }),
    });
  } catch (e) {
    // Fail silently - don't break user experience
    console.error('Telegram notification failed:', e);
  }
}

