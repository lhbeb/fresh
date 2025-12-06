'use client';
import { useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

function getDeviceType(ua: string) {
  if (/Mobi|Android/i.test(ua)) return 'Mobile';
  if (/Tablet|iPad/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

export default function VisitNotifier() {
  useEffect(() => {
    // Skip notification for checkout page and About page - they have their own dedicated notifiers
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/checkout') || pathname.includes('/about')) {
        return;
      }
    }

    const timer = setTimeout(() => {
      (async () => {
        try {
          // Get device info
          const device = `${navigator.platform} - ${navigator.userAgent}`;
          const deviceType = getDeviceType(navigator.userAgent);

          // Get fingerprint
          const fp = await FingerprintJS.load();
          const result = await fp.get();

          // Full URL
          const url = window.location.href;

          // Send to API (server will handle IP/geo)
          await fetch('/api/notify-visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              device,
              deviceType,
              fingerprint: result.visitorId,
              url,
            }),
          });
        } catch (e) {
          // Fail silently
          console.error('Visit notification failed:', e);
        }
      })();
    }, 500); // 500ms delay
    return () => clearTimeout(timer);
  }, []);

  return null;
} 