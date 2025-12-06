import React from 'react';
import './admin.css';

// Authentication is now handled by middleware
// This layout just provides the admin UI structure
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
