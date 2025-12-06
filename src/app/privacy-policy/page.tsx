import React from 'react';

const PrivacyPolicyPage = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 py-12">
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="prose max-w-none text-gray-700 space-y-8">
        {/* Introduction */}
        <p className="text-lg leading-relaxed">
          At HappyDeel, your privacy is important to us. This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices you have regarding your personal data when you visit or use our website.
        </p>

        {/* Information We Collect */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Information We Collect</h2>
          <p className="mb-4">We collect information in the following ways:</p>

          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Information You Provide</h3>
          <p className="mb-4">You may provide personal information when you:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Create an account</li>
            <li>Place an order</li>
            <li>Sign up for our newsletter</li>
            <li>Contact our customer service team</li>
            <li>Participate in surveys, promotions, or giveaways</li>
          </ul>
          <p className="mb-4">
            This information may include your name, email address, phone number, billing and shipping address, and payment details.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Information Collected Automatically</h3>
          <p className="mb-4">When you visit our website, we may automatically collect:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Device information</li>
            <li>Pages viewed</li>
            <li>Time spent on pages</li>
            <li>Cookies and tracking data</li>
          </ul>
          <p>
            This helps us improve your browsing experience and maintain website functionality.
          </p>
        </div>

        {/* How We Use Your Information */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Respond to customer inquiries and support requests</li>
            <li>Send marketing emails if you have opted in</li>
            <li>Improve our website, products, and services</li>
            <li>Detect and prevent fraud</li>
            <li>Comply with legal requirements</li>
          </ul>
        </div>

        {/* Information Sharing */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Information Sharing</h2>
          <p className="mb-4">
            We do not sell or trade your personal information to third parties. We may share your information only with trusted service providers who help us operate our website or fulfill your orders, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Payment processors</li>
            <li>Shipping partners</li>
            <li>Email communication platforms</li>
            <li>Website analytics providers</li>
          </ul>
          <p className="mb-4">
            These partners are required to keep your information confidential and use it only for the services they provide.
          </p>
          <p>
            We may also disclose your information if required by law or to protect our rights, safety, or property.
          </p>
        </div>

        {/* Data Security */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Data Security</h2>
          <p>
            We take appropriate technical and organizational measures to protect your information. While we strive to safeguard your data, no method of online transmission or storage is completely secure.
          </p>
        </div>

        {/* Your Rights */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Your Rights</h2>
          <p className="mb-4">
            Depending on your location, you may have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Access the personal data we hold</li>
            <li>Request corrections to your information</li>
            <li>Request deletion of your information</li>
            <li>Opt out of marketing communications</li>
            <li>Request a copy of your data</li>
            <li>Limit or object to certain data processing activities</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us.
          </p>
        </div>

        {/* Cookies */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Cookies</h2>
          <p>
            Our website uses cookies to enhance your browsing experience. Cookies help us remember your preferences, analyze site traffic, and improve website performance. You can adjust your browser settings to refuse cookies if you prefer.
          </p>
        </div>

        {/* Third Party Links */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Third Party Links</h2>
          <p>
            Our website may include links to third party websites. We are not responsible for the privacy practices of those sites.
          </p>
        </div>

        {/* Updates to This Policy */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Updates to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised effective date.
          </p>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Contact Information</h2>
          <p className="mb-4">
            If you have questions about this Privacy Policy or need help with your privacy rights, please contact us:
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
              <div className="text-gray-600">Monday to Friday: 9:00 AM to 5:00 PM EST</div>
              <div className="text-gray-600">Saturday: 10:00 AM to 3:00 PM EST</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default PrivacyPolicyPage; 