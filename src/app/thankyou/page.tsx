'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Mail, Clock, Package, ArrowLeft } from 'lucide-react';

export default function ThankYouPage() {
  // Track Google Ads conversion on thank you page
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        // Get product price from URL params or localStorage if available
        const urlParams = new URLSearchParams(window.location.search);
        const price = urlParams.get('price') ? parseFloat(urlParams.get('price')!) : undefined;
        const currency = urlParams.get('currency') || 'USD';
        
        // Track conversion event
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-17682444096',
          'value': price || 0,
          'currency': currency,
          'transaction_id': Date.now().toString()
        });
        console.log('Google Ads conversion tracked on thank you page');
      } catch (error) {
        console.error('Error tracking Google Ads conversion:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Main Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Thank You for Your Order!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Your order has been successfully placed and is being processed. 
            We&apos;re excited to get your items ready for shipping!
          </p>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What happens next?
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Order Processing</h3>
                  <p className="text-sm text-gray-600">We&apos;ll process your order within 24-48 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Email Confirmation</h3>
                  <p className="text-sm text-gray-600">You&apos;ll receive an email with your order tracking number</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Package className="w-4 h-4 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Shipping</h3>
                  <p className="text-sm text-gray-600">Your order will ship within 5-8 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-3">
              If you have any questions about your order, don&apos;t hesitate to reach out:
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                📧 <a href="mailto:support@happydeel.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  support@happydeel.com
                </a>
              </p>
              <p className="text-gray-700">
                📞 <a href="tel:+17176484487" className="text-blue-600 hover:text-blue-700 font-medium">
                  +1 (717) 648-4487
                </a>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#0046be] hover:bg-[#003494] text-white font-medium rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Order confirmation has been sent to your email address
          </p>
        </div>
      </div>
    </div>
  );
} 