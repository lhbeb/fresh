"use client";

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

export default function NotFound() {
  return (
    <Suspense fallback={null}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full bg-[#0046be] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#003494] transition-colors duration-300"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </Suspense>
  );
} 