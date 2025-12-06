import React from 'react';

const TermsPage = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">HappyDeel Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last Updated: {currentDate}</p>
        
        <div className="prose max-w-none text-gray-700 space-y-8">
          <p className="text-lg leading-relaxed">
            Welcome to HappyDeel. By accessing or using our website, marketplace, or services, you agree to be bound by these Terms of Service. Please read them carefully. If you do not agree, please discontinue using the site.
          </p>

          {/* Section 1: Overview */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">1. Overview</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>HappyDeel operates as a direct retailer and as a curated marketplace.</li>
              <li>We source products through auctions, private sellers, liquidators, wholesalers, and other third-party suppliers.</li>
              <li>We also allow approved private sellers to list items on our platform after a full inspection by our team.</li>
              <li>All purchases made through HappyDeel are processed under these Terms.</li>
            </ul>
          </div>

          {/* Section 2: Account Terms */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">2. Account Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be 18 years or older to use this service.</li>
              <li>You must provide accurate and complete information during account creation.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must notify us immediately of any unauthorized access or security concerns.</li>
            </ul>
          </div>

          {/* Section 3: Marketplace and Private Seller Terms */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">3. Marketplace and Private Seller Terms</h2>
            <p className="mb-4">
              HappyDeel hosts a controlled marketplace where approved private sellers may offer products.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3.1 Seller Onboarding Process</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Private sellers must be screened and approved before listing items.</li>
              <li>Sellers send their inventory to our warehouse, where it is inspected, authenticated, tested, and verified before any listing goes live.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3.2 Fulfillment Process</h3>
            <p className="mb-2">When you purchase an item from a third-party seller:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>It is clearly indicated on the product page.</li>
              <li>The seller sends the item to our warehouse if it is not already stored with us.</li>
              <li>Our inspection team confirms the condition, functionality, and price accuracy.</li>
              <li>Only after passing inspection is the item shipped to the customer.</li>
            </ul>
            <p className="mb-4">
              HappyDeel reserves the right to reject, refund, or cancel any order if the item fails inspection.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3.3 Seller Responsibility</h3>
            <p className="mb-2">Sellers on the HappyDeel platform are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>The authenticity of their products</li>
              <li>Providing accurate condition descriptions</li>
              <li>Meeting our quality and safety standards</li>
            </ul>
            <p>
              HappyDeel is not responsible for inaccurate representations made by sellers, although we take all reasonable steps to verify product condition before shipment.
            </p>
          </div>

          {/* Section 4: Product Terms */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">4. Product Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We aim to provide accurate and detailed product descriptions.</li>
              <li>We sell new, open-box, refurbished, and pre owned items, each clearly labeled.</li>
              <li>All used or open-box electronics are tested prior to sale.</li>
              <li>Product availability is not guaranteed until an order is processed.</li>
              <li>Prices may change at any time due to market conditions and sourcing costs.</li>
              <li>We reserve the right to modify, limit, or discontinue any product or listing.</li>
            </ul>
          </div>

          {/* Section 5: Sourcing Transparency */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">5. Sourcing Transparency</h2>
            <p className="mb-4">
              By using our website, you acknowledge that HappyDeel sources products through:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Online auctions and bidding platforms</li>
              <li>Private sellers and independent sourcers</li>
              <li>Liquidation and return departments of major retailers</li>
              <li>Garage sales, local auctions, and community sales</li>
              <li>Wholesalers and bulk suppliers</li>
            </ul>
            <p>
              These sourcing methods allow us to offer competitive pricing.
            </p>
            <p className="mt-2">
              You agree that cosmetic variations, packaging differences, or shelf pull characteristics may occur with certain items unless stated otherwise.
            </p>
          </div>

          {/* Section 6: Shipping Policy */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">6. Shipping Policy</h2>
            <p className="mb-4">
              Shipping applies to all orders within the United States and Canada.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Same-day shipping is available for orders placed before 2:00 PM EST.</li>
              <li>Standard processing time is 1 business day.</li>
              <li>Domestic USA delivery time is typically 5 to 8 business days.</li>
              <li>Canada delivery time is typically 7 to 10 business days.</li>
              <li>All orders qualify for free shipping.</li>
              <li>Tracking information is sent to the customer via email once the order ships.</li>
            </ul>
            <p className="mt-4">
              HappyDeel is not responsible for delays caused by carriers or incorrect shipping information provided by the customer.
            </p>
          </div>

          {/* Section 7: Payment Terms */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">7. Payment Terms</h2>
            <p className="mb-4">We accept the following payment methods:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Credit and debit cards</li>
              <li>Visa, Mastercard, American Express</li>
              <li>PayPal</li>
              <li>Shop Pay</li>
              <li>Apple Pay</li>
            </ul>
            <p className="mt-4">
              All payments must be received in full before an order is processed.
            </p>
          </div>

          {/* Section 8: Returns and Satisfaction Guarantee */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">8. Returns and Satisfaction Guarantee</h2>
            <p className="mb-4">Your satisfaction is our priority.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We offer a 30 day hassle free return policy.</li>
              <li>Items must be returned in the same condition received.</li>
              <li>Refunds are issued after the item passes inspection at our warehouse.</li>
              <li>Exchanges are available when inventory permits.</li>
              <li>We work quickly to resolve any concerns, disputes, or issues.</li>
            </ul>
            <p className="mt-4">
              Marketplace seller products also fall under this guarantee unless specifically stated otherwise.
            </p>
          </div>

          {/* Section 9: Limitation of Liability */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">9. Limitation of Liability</h2>
            <p className="mb-4">
              HappyDeel is not liable for indirect, incidental, punitive, or consequential damages arising from your use of our services, products, or platform.
            </p>
            <p>
              However, we are committed to resolving legitimate customer concerns and will work with you to reach a fair and reasonable solution.
            </p>
          </div>

          {/* Section 10: Fraud Prevention and Compliance */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">10. Fraud Prevention and Compliance</h2>
            <p className="mb-4">
              HappyDeel monitors orders for unusual activity to protect customers and sellers.
            </p>
            <p className="mb-4">
              We reserve the right to cancel or delay orders suspected of fraud or unauthorized use of payment methods.
            </p>
            <p>
              Creating false accounts, listing products fraudulently, or misrepresenting product ownership is strictly prohibited.
            </p>
          </div>

          {/* Section 11: Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">11. Contact Information</h2>
            <p className="mb-4">
              If you have questions about these Terms of Service, please contact us.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div>
                <div className="font-medium text-gray-900 mb-1">Phone:</div>
                <div className="text-gray-600">+1 717 648 4487</div>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">Email:</div>
                <div className="text-gray-600">support@happydeel.com</div>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">Address:</div>
                <div className="text-gray-600">1420 N McKinley Ave, Los Angeles, CA 90059, United States</div>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">Hours:</div>
                <div className="text-gray-600">Monday to Friday, 9:00 AM to 5:00 PM EST</div>
                <div className="text-gray-600">Saturday, 10:00 AM to 3:00 PM EST</div>
                <div className="text-gray-600">Sunday, Closed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 