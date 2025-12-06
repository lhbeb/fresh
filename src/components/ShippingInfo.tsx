import React from 'react';
import { MapPin, Truck, DollarSign, RefreshCw } from 'lucide-react';

interface ShippingInfoProps {
  className?: string;
}

function getDeliveryRange() {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);
  start.setDate(today.getDate() + 5);
  end.setDate(today.getDate() + 8);
  // If the months are the same, show as "20-23 July", else "30 July - 2 August"
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}-${end.getDate()} ${start.toLocaleString('en-US', { month: 'long' })}`;
  } else {
    return `${start.getDate()} ${start.toLocaleString('en-US', { month: 'long' })} - ${end.getDate()} ${end.toLocaleString('en-US', { month: 'long' })}`;
  }
}

const ShippingInfo: React.FC<ShippingInfoProps> = ({ className = '' }) => {
  const deliveryRange = getDeliveryRange();
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {/* Shipping Destination */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-sm">
        <div className="flex items-center mb-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-md mr-2 flex-shrink-0">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Shipping:</p>
        </div>
        <div className="ml-10">
          <p className="text-sm text-gray-700 font-medium">
          Ships from the USA 🇺🇸
          </p>
        </div>
      </div>
      {/* Delivery Time */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-sm">
        <div className="flex items-center mb-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-md mr-2 flex-shrink-0">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Estimated delivery:</p>
        </div>
        <div className="ml-10">
          <p className="text-sm text-gray-700 font-medium">get your order by {deliveryRange}</p>
          <p className="text-xs text-gray-500 mt-1">FREE shipping available</p>
        </div>
      </div>
      {/* Returns */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-sm">
        <div className="flex items-center mb-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-md mr-2 flex-shrink-0">
            <RefreshCw className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Returns:</p>
        </div>
        <div className="ml-10">
          <p className="text-sm text-gray-700 font-medium">30-day policy</p>
          <p className="text-xs text-gray-500 mt-1">Hassle-free returns</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
