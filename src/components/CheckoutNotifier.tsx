'use client';
import { useEffect } from 'react';
import { sendTelegramNotification } from '@/utils/telegram-notify';

/**
 * Dedicated notifier for checkout page
 * Always triggers on every checkout page visit, treating each visit as a new session
 */
export default function CheckoutNotifier() {
  useEffect(() => {
    // Always send notification on checkout page - no deduplication
    // This ensures every visit is reported, even if it's the same user/session
    const timer = setTimeout(() => {
      sendTelegramNotification({
        url: window.location.href,
        action: 'checkout_visit',
      });
    }, 300); // Small delay to ensure page is loaded

    return () => {
      clearTimeout(timer);
    };
  }, []); // Empty deps - runs on every mount

  return null;
}

