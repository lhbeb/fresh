export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Return Policy</h1>
        
        <div className="prose max-w-none text-gray-700 space-y-8">
          {/* Introduction */}
          <p className="text-lg leading-relaxed">
            At HappyDeel, your satisfaction is our highest priority. We want every customer to feel confident when ordering from us. If your purchase is not right for any reason, we are here to make the process simple, fair, and transparent.
          </p>

          {/* 30 Day Satisfaction Guarantee */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">30 Day Satisfaction Guarantee</h2>
            <p className="mb-4">
              You have 30 days from the date your package is delivered to request a return.
            </p>
            <p className="mb-4">
              We are committed to making sure you are fully satisfied with your purchase.
            </p>
            <p className="mb-4">To be eligible for a return, your item should be:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>In the same condition you received it, unused or gently used</li>
              <li>In original packaging when possible</li>
              <li>Accompanied by proof of purchase</li>
              <li>Free from damage that was not present upon delivery</li>
            </ul>
            <p>
              We understand that some items may need to be opened or tested. If you are unsure whether your item qualifies, contact us and we will guide you through the process.
            </p>
          </div>

          {/* Items Purchased From Marketplace Sellers */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Items Purchased From Marketplace Sellers</h2>
            <p className="mb-4">
              Some products on HappyDeel come from approved private sellers.
            </p>
            <p className="mb-4">For these items:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>It is clearly marked on the product page.</li>
              <li>The item is inspected by our team before being shipped to you.</li>
              <li>All marketplace items are fully eligible for return within 30 days.</li>
              <li>Returns must be sent back to our warehouse, not to the seller directly.</li>
            </ul>
            <p>
              HappyDeel handles all inspections and quality reviews, so the return experience is the same as with our own inventory.
            </p>
          </div>

          {/* How to Start a Return */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">How to Start a Return</h2>
            <p className="mb-4">
              We have made the return process fast and customer friendly.
            </p>
            <ol className="list-decimal pl-6 space-y-3 mb-4">
              <li>
                Contact our customer service team at <strong>+1 717 648 4487</strong> or <strong>support@happydeel.com</strong>.
              </li>
              <li>We will issue a return authorization number and provide return instructions.</li>
              <li>Pack the item securely. Original packaging is preferred but not always required.</li>
              <li>Ship the item to the return address provided by our team.</li>
              <li>Once we receive and inspect the item, we will process your refund.</li>
            </ol>
            <p>
              If you ever have questions during the process, we are here to help.
            </p>
          </div>

          {/* Inspection and Processing Time */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Inspection and Processing Time</h2>
            <p className="mb-4">Once your return arrives at our warehouse:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Most inspections are completed within 1 to 2 business days</li>
              <li>You will receive email updates at each step</li>
              <li>Approved refunds are processed immediately</li>
            </ul>
            <p className="mb-4">
              Refunds are returned to your original payment method. Depending on your bank or card issuer, you may see the funds within 5 to 10 business days.
            </p>
            <p>
              If any issue arises during inspection, we will contact you to discuss the next steps and find the best solution.
            </p>
          </div>

          {/* Return Shipping Costs */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Return Shipping Costs</h2>
            <p className="mb-4">Return shipping rules are straightforward:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>If the item is incorrect, defective, damaged on arrival, or not as described, we cover the return shipping cost.</li>
              <li>For change-of-mind returns, return shipping is normally the customer&apos;s responsibility.</li>
              <li>We will always provide the correct return address once you contact us.</li>
              <li>We recommend using a trackable shipping service for protection.</li>
            </ul>
            <p>
              If you believe shipping costs are unfair or too high, reach out to us and we will work with you to find a reasonable solution.
            </p>
          </div>

          {/* Items Not Eligible for Return */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Items Not Eligible for Return</h2>
            <p className="mb-4">
              For safety, hygiene, and compliance reasons, certain categories may not be eligible for return unless the item arrives damaged or defective:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Software with opened packaging</li>
              <li>Downloaded digital goods</li>
              <li>Items missing major components</li>
              <li>Products damaged after delivery by the customer</li>
            </ul>
            <p>
              If you are unsure, contact us before purchasing or before returning.
            </p>
          </div>

          {/* Refund Eligibility for Marketplace Seller Items */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Refund Eligibility for Marketplace Seller Items</h2>
            <p className="mb-4">
              Marketplace seller items follow the same refund standards as HappyDeel inventory.
            </p>
            <p>
              If an item fails our inspection upon return, we will notify you with clear details and work toward a fair resolution.
            </p>
          </div>

          {/* We Are Here to Help */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">We Are Here to Help</h2>
            <p className="mb-4">
              If you need assistance, have questions, or want guidance with a return, contact our team anytime.
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
              </div>
            </div>
          </div>

          {/* Our Promise */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Promise</h2>
            <p className="mb-4">
              At HappyDeel, we believe in doing the right thing. If something is not right with your order, we want to fix it quickly and fairly. We treat every customer with respect, transparency, and care.
            </p>
            <p>
              Your trust matters to us, and we are committed to making your experience positive from start to finish.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 