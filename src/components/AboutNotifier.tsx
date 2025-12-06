'use client';
import { useEffect } from 'react';
import { sendTelegramNotification } from '@/utils/telegram-notify';

/**
 * Dedicated notifier for About Us page
 * Always triggers on every About Us page visit, treating each visit as a new session
 */
export default function AboutNotifier() {
  useEffect(() => {
    // Always send notification on About Us page - no deduplication
    // This ensures every visit is reported, even if it's the same user/session
    const timer = setTimeout(() => {
      sendTelegramNotification({
        url: window.location.href,
        action: 'page_visit',
      });
    }, 300); // Small delay to ensure page is loaded

    return () => {
      clearTimeout(timer);
    };
  }, []); // Empty deps - runs on every mount

  return null;
}

