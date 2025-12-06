import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Camera, DollarSign, Shield, Truck, TrendingUp, FileText, Image as ImageIcon, Tag, Star, HelpCircle, Mail, Phone } from 'lucide-react';

export default function SellPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Make money selling on HappyDeel</h1>
          <p className="text-xl text-gray-600 mb-8">
            Sell your items fast—thousands of trusted buyers are waiting.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#0046be] text-white font-medium rounded-md shadow-md hover:bg-[#003494] transition duration-300"
          >
            List an item
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Main Benefits */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Reach thousands of trusted buyers on HappyDeel</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-md">
                  <FileText className="h-6 w-6 text-[#0046be]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Quick listing</h3>
              </div>
              <p className="text-gray-600">
                List in a few simple steps. We&apos;ll help you with pricing recommendations and descriptions. Only pay when your item sells successfully.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-md">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Secure payments</h3>
              </div>
              <p className="text-gray-600">
                Get paid securely with fraud detection, dispute resolution, and safeguards against problematic buyers. We handle all payment processing.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-md">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Easy shipping</h3>
              </div>
              <p className="text-gray-600">
                Ship your items to our warehouse for inspection. Once approved, we handle all customer shipping, returns, and support. You focus on sourcing great products.
              </p>
            </div>
          </div>
        </div>

        {/* Selling as a Business */}
        <div className="bg-gradient-to-r from-[#0046be] to-[#003494] rounded-xl shadow-lg p-8 mb-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Selling as a business? We make it easy</h2>
          <p className="text-lg mb-6 text-blue-100">
            We&apos;ve got powerful tools to help you manage your inventory, track your sales, and build your brand. Our platform handles customer service, shipping, and returns so you can focus on what you do best.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0046be] font-medium rounded-md hover:bg-gray-100 transition duration-300"
          >
            Learn more
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How selling on HappyDeel works</h2>
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#0046be] text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Contact us to get started</h3>
                  <p className="text-gray-600">
                    Reach out through our contact form or email. Our team will guide you through the approval process and answer any questions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#0046be] text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ship items to our warehouse</h3>
                  <p className="text-gray-600">
                    Send your items to our inspection facility. We&apos;ll provide shipping labels and instructions. All items must pass our quality standards before listing.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#0046be] text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">We inspect and authenticate</h3>
                  <p className="text-gray-600">
                    Our team verifies authenticity, tests functionality, and validates pricing. Only items that meet our high standards get listed.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#0046be] text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Items go live</h3>
                  <p className="text-gray-600">
                    Once approved, your items are listed on HappyDeel. We handle all customer interactions, shipping, and returns. You get paid when items sell.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create a Great Listing */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Create a great listing</h2>
          <p className="text-gray-600 mb-8">Here are six ways to set yourself up for success.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-6 w-6 text-[#0046be]" />
                <h3 className="text-xl font-bold text-gray-900">Write a standout title</h3>
              </div>
              <p className="text-gray-600">
                Include specific details like brand, model, size, and color. Avoid all caps and focus on what makes your item unique. We&apos;ll help you optimize for search.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                <Camera className="h-6 w-6 text-[#0046be]" />
                <h3 className="text-xl font-bold text-gray-900">Take high-quality photos</h3>
              </div>
              <p className="text-gray-600">
                Snap your items from multiple angles in a well-lit place. Capture any blemishes or wear for transparency. Clear, honest photos build buyer trust.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                <Tag className="h-6 w-6 text-[#0046be]" />
                <h3 className="text-xl font-bold text-gray-900">Set the right price</h3>
              </div>
              <p className="text-gray-600">
                We&apos;ll recommend a price based on recent sales of similar items. You can see how other sellers are pricing comparable products to stay competitive.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-6 w-6 text-[#0046be]" />
                <h3 className="text-xl font-bold text-gray-900">Provide detailed descriptions</h3>
              </div>
              <p className="text-gray-600">
                Be honest about condition, functionality, and any flaws. Detailed descriptions reduce returns and build buyer confidence. Include measurements, specifications, and history.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-6 w-6 text-[#0046be]" />
                <h3 className="text-xl font-bold text-gray-900">Stand out from the crowd</h3>
              </div>
              <p className="text-gray-600">
                Quality items with great photos and honest descriptions naturally perform better. We feature top-performing sellers and products to maximize visibility.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="h-6 w-6 text-[#0046be]" />
                <h3 className="text-xl font-bold text-gray-900">Ship with ease</h3>
              </div>
              <p className="text-gray-600">
                Ship items to our warehouse using our provided labels. Once approved, we handle all customer shipping, tracking, and delivery. You don&apos;t deal with individual orders.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#0046be]" />
                  How much does it cost to sell?
                </h3>
                <p className="text-gray-600 ml-7">
                  We only charge a commission when your item sells successfully. There are no upfront fees or listing costs. Contact us for current commission rates.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#0046be]" />
                  What&apos;s the best way to ship my item?
                </h3>
                <p className="text-gray-600 ml-7">
                  We provide shipping labels for sending items to our warehouse. Once your items pass inspection and are listed, we handle all customer shipping and delivery.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#0046be]" />
                  How much will it cost to ship my item?
                </h3>
                <p className="text-gray-600 ml-7">
                  Shipping costs to our warehouse vary by size and weight. We&apos;ll provide discounted shipping labels when you&apos;re ready to send items. Contact us for specific rates.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#0046be]" />
                  How should I choose my listing price?
                </h3>
                <p className="text-gray-600 ml-7">
                  We provide pricing recommendations based on recent sales of similar items. You can also research comparable listings on our platform and other marketplaces to stay competitive.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#0046be]" />
                  How does HappyDeel protect sellers?
                </h3>
                <p className="text-gray-600 ml-7">
                  We handle all customer interactions, payment processing, and dispute resolution. Our inspection process ensures items meet quality standards before listing, reducing returns and issues.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#0046be]" />
                  What can I sell on HappyDeel?
                </h3>
                <p className="text-gray-600 ml-7">
                  We accept electronics, photography gear, fashion items, bicycles, tools, home equipment, and more. All items must be authentic, functional, and meet our quality standards. Contact us to discuss specific items.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#0046be]" />
                  How do I create an account?
                </h3>
                <p className="text-gray-600 ml-7">
                  Start by contacting us through our contact form or email. We&apos;ll guide you through the approval process and help you get set up as a seller.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#0046be]" />
                  When will I get paid?
                </h3>
                <p className="text-gray-600 ml-7">
                  You receive payment after your item sells and the customer receives it. We process payments securely and typically send funds within 5-10 business days after a successful sale.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#0046be]" />
                  Do I have to pay federal income tax on my sales?
                </h3>
                <p className="text-gray-600 ml-7">
                  Tax obligations vary by location and sales volume. We recommend consulting with a tax professional about your specific situation. We provide sales reports for your records.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#0046be] to-[#003494] rounded-xl shadow-lg p-12 text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">You&apos;ve got this. We&apos;ve got your back.</h2>
          <p className="text-lg mb-8 text-blue-100">
            Join our network of trusted sellers and start earning today.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#0046be] font-medium rounded-md hover:bg-gray-100 transition duration-300"
          >
            List an item
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Resources Section */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Selling on HappyDeel</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Resources</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/about" className="hover:text-[#0046be] hover:underline">About HappyDeel</Link></li>
                <li><Link href="/contact" className="hover:text-[#0046be] hover:underline">Contact Seller Support</Link></li>
                <li><Link href="/terms" className="hover:text-[#0046be] hover:underline">Seller Policies</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:support@happydeel.com" className="hover:text-[#0046be] hover:underline">
                    support@happydeel.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+17176484487" className="hover:text-[#0046be] hover:underline">
                    +1 717 648 4487
                  </a>
                </li>
                <li className="text-sm text-gray-500 mt-4">
                  Monday to Friday: 9:00 AM to 5:00 PM EST<br />
                  Saturday: 10:00 AM to 3:00 PM EST
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

