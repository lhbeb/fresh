"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const ScrollToTop = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only scroll to top if there are no search parameters (clean URL)
    if (!searchParams.toString()) {
      window.scrollTo(0, 0);
    }
  }, [searchParams]);

  return null;
};

export default ScrollToTop; 