"use client";

import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminSidebar />
      
      <div className="lg:ml-64">
        {/* Header */}
        {(title || subtitle) && (
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6" style={{ overflow: 'visible' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
