import React from 'react';
import { OrbitProgress } from 'react-loading-indicators';

interface AdminLoadingProps {
  message?: string;
}

export default function AdminLoading({ message = 'Loading...' }: AdminLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-5 p-10 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="relative">
          <OrbitProgress color="#2563eb" size="medium" text="" textColor="" />
        </div>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{message}</p>
          <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
}
