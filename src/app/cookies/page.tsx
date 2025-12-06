import React from 'react';

const CookiesPage = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 py-12">
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookies Policy</h1>
      
      <div className="prose max-w-none text-gray-700 space-y-8">
        {/* Introduction */}
        <p className="text-lg leading-relaxed">
          This Cookies Policy explains how HappyDeel uses cookies and similar tracking technologies on our website. By using our website, you agree to the use of cookies as described in this policy.
        </p>

        {/* What Are Cookies */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your computer or mobile device when you visit a website. They help websites function properly, improve performance, and provide valuable information to site owners.
          </p>
        </div>

        {/* Types of Cookies We Use */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Types of Cookies We Use</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Essential Cookies</h3>
              <p>
                These cookies are required for the website to operate. They support functions such as page navigation, secure login, and access to restricted areas.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Performance Cookies</h3>
              <p>
                These cookies collect anonymous data about how visitors use our website. They help us understand user behavior and improve website performance.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Functionality Cookies</h3>
              <p>
                These cookies remember choices you make, such as language preferences, and provide enhanced and more personalized features.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Targeting Cookies</h3>
              <p>
                These cookies may be placed on our site by advertising partners. They help create a profile of your interests and show you relevant ads on other websites.
              </p>
            </div>
          </div>
        </div>

        {/* Cookie Management */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Cookie Management</h2>
          
          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">How to Control Cookies</h3>
          <p className="mb-4">You can control cookies in several ways. You can:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Delete cookies stored on your device</li>
            <li>Set your browser to block cookies</li>
            <li>Choose to accept or decline cookies when prompted</li>
          </ul>
          <p>
            Please note that disabling certain cookies may affect website functionality or limit access to specific features.
          </p>
        </div>

        {/* Third-Party Cookies */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Third-Party Cookies</h2>
          <p className="mb-4">
            We may use services provided by trusted third parties that use cookies, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Google Analytics for website performance and analytics</li>
            <li>PayPal for secure payment processing</li>
            <li>Social media platforms for sharing and engagement</li>
            <li>Advertising partners for targeted advertising</li>
          </ul>
          <p>
            These third parties have their own privacy and cookie policies.
          </p>
        </div>

        {/* Updates to This Policy */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Updates to This Policy</h2>
          <p>
            We may revise this Cookies Policy from time to time. Any changes will be posted on this page with an updated effective date.
          </p>
        </div>

        {/* Contact Us */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have questions about our Cookies Policy, please contact us:
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

        {/* Important Note */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-10">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Important Note</h3>
          <p>
            By continuing to use our website, you agree to our use of cookies as described in this policy. If you do not agree, please adjust your browser settings accordingly.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default CookiesPage; 