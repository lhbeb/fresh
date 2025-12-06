"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50" style={{backgroundColor: '#2f3d48'}}>
      <div className="px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6">
          {/* Text */}
          <div className="flex items-center space-x-2 text-center sm:text-left">
            <Cookie className="h-5 w-5 text-gray-200 flex-shrink-0" />
            <p className="text-gray-200 text-sm">
              We use cookies to enhance your experience. 
              <Link href="/cookies" className="underline ml-1">Learn more</Link>
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={handleDecline}
              className="px-4 sm:px-6 py-2 text-gray-200 border border-gray-500 rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 sm:px-6 py-2 bg-white text-[#2f3d48] rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Accept All Cookies
            </button>
            <button
              onClick={handleClose}
              className="text-gray-200 hover:text-white transition-colors p-2"
              aria-label="Close cookie consent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
