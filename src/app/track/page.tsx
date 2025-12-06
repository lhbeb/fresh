"use client";

import React, { useEffect, useState } from 'react';

const TrackPage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load 17track script
    const script = document.createElement('script');
    script.src = '//www.17track.net/externalcall.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      setError('');
    };
    script.onerror = () => {
      setError('Failed to load tracking system. Please try again later.');
    };
    document.body.appendChild(script);
    return () => {
      // Remove tracking script
      const trackingScript = document.querySelector('script[src*="17track"]');
      if (trackingScript) {
        document.body.removeChild(trackingScript);
      }
    };
  }, []);

  const handleTrack = () => {
    if (!trackingNumber) {
      setError('Please enter a tracking number');
      return;
    }
    if (!(window as any).YQV5) {
      setError('Tracking system is not ready. Please try again.');
      return;
    }
    setError('');
    (window as any).YQV5.trackSingle({
      YQ_ContainerId: "YQContainer",
      YQ_Height: 560,
      YQ_Fc: "0",
      YQ_Lang: "en",
      YQ_Num: trackingNumber
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Track Your Order</h1>
          <p className="text-gray-600 mb-8">
            Enter your tracking number below to track your package in real-time.
          </p>
          <div className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                id="YQNum"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                maxLength={50}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0046be] focus:border-transparent"
              />
              <button
                onClick={handleTrack}
                disabled={!isScriptLoaded}
                className="px-8 py-3 bg-[#0046be] hover:bg-[#003494] text-white font-medium rounded-lg transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Track Package
              </button>
            </div>
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <div id="YQContainer" className="min-h-[560px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackPage; 