"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Truck, MapPin, Package } from 'lucide-react';

interface SameDayShippingProps {
  fullWidth?: boolean;
  contained?: boolean;
}

const SameDayShipping: React.FC<SameDayShippingProps> = ({ fullWidth = false, contained = false }) => {
  const content = (
    <div className={`w-full ${fullWidth ? '' : 'max-w-7xl'} mx-auto`}>
      {/* Main Banner */}
      <div className="rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="flex flex-col md:flex-row">
          {/* Left Section - Image */}
          <div className="md:w-[45%] relative">
            <div className="relative w-full min-h-[400px]">
              <Image
                src="/delivery-guy.png?v=2"
                alt="HappyDeel delivery person"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
          
          {/* Right Section - Content */}
          <div className="md:w-[55%] bg-blue-700 text-white p-12 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-[#ffef02]">
              Same Day Shipping
            </h1>
            
            <h3 className="text-lg leading-relaxed font-normal mb-12">
              We work around the hour to fulfill your orders on time and ship it on the same day
            </h3>
            <Link 
              href="/shipping-policy" 
              className="text-white/80 hover:text-white text-lg underline underline-offset-2 transition-colors"
            >
              View shipping policy →
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-blue-700 rounded-full p-3 flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                Lightning-Fast Processing
              </h3>
              <p className="text-gray-600 text-sm">
                Orders placed before 2 PM EST are processed an ensuring your package begins its journey the same...
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-blue-700 rounded-full p-3 flex-shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                Easy Returns
              </h3>
              <p className="text-gray-600 text-sm">
                Hassle-free returns within 30 days. We make it easy to return items that don&apos;t meet your expectations.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-blue-700 rounded-full p-3 flex-shrink-0">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                Real-Time Tracking
              </h3>
              <p className="text-gray-600 text-sm">
                We partner with trusted delivery carriers to provide real-time tracking. You always know exactly where your package is.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-gray-500 text-sm mb-2">
            Place your order now and get it shipped today
          </p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            Order by <span className="text-blue-700">2:00 PM EST</span> for same-day shipping
          </p>
        </div>
        <a
          href="#products"
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-10 rounded-xl text-lg transition-colors whitespace-nowrap"
        >
          Shop Now
        </a>
      </div>
    </div>
  );

  if (contained) {
    return (
      <div className="py-8 bg-gray-100 rounded-xl">
        {content}
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        {content}
      </div>
    </section>
  );
};

export default SameDayShipping;
