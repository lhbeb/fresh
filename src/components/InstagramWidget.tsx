import React from 'react';
import Image from 'next/image';
import { Instagram, ExternalLink } from 'lucide-react';

const InstagramWidget: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-4 mb-6">
          {/* Profile Picture with Instagram Gradient Ring */}
          <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-0.5 flex-shrink-0">
            <div className="w-full h-full bg-white rounded-full overflow-hidden">
              <Image
                src="https://i.ibb.co/23zR8qnz/pic.png"
                alt="HappyDeel Profile"
                width={80}
                height={80}
              />
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="flex-grow">
            <h3 className="font-bold text-gray-900 text-xl mb-1">@happydeelcom</h3>
                <p className="text-gray-600 text-sm mb-3">HappyDeel</p>
            
            {/* Statistics */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-gray-900">11</div>
                <div className="text-gray-500">posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">15.9K</div>
                <div className="text-gray-500">followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">2</div>
                <div className="text-gray-500">following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Follow Button */}
        <a
          href="https://www.instagram.com/happydeelcom"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Instagram className="h-5 w-5 mr-2" />
          Follow on Instagram
          <ExternalLink className="h-4 w-4 ml-2" />
        </a>
      </div>
    </div>
  );
};

export default InstagramWidget;
