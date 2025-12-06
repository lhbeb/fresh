"use client";

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Package, ShoppingCart, Plus, FileArchive, LogOut, Home } from 'lucide-react';

interface AdminNavProps {
  title: string;
}

// Define admin pages in order for navigation
const ADMIN_PAGES = [
  { path: '/admin/products', name: 'Products', icon: Package },
  { path: '/admin/orders', name: 'Orders', icon: ShoppingCart },
  { path: '/admin/products/new', name: 'Add Product', icon: Plus },
  { path: '/admin/products/bulk-import', name: 'Bulk Import', icon: FileArchive },
];

export default function AdminNav({ title }: AdminNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Find current page index
  const currentIndex = ADMIN_PAGES.findIndex(page => page.path === pathname);
  const prevPage = currentIndex > 0 ? ADMIN_PAGES[currentIndex - 1] : null;
  const nextPage = currentIndex < ADMIN_PAGES.length - 1 ? ADMIN_PAGES[currentIndex + 1] : null;

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  return (
    <div className="bg-gradient-to-r from-[#0046be] to-[#003494] shadow-lg">
      <div className="container mx-auto px-4 py-4">
        {/* Navigation arrows and title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Previous Page Arrow */}
            {prevPage ? (
              <Link
                href={prevPage.path}
                className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                title={`Go to ${prevPage.name}`}
              >
                <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden md:inline">{prevPage.name}</span>
              </Link>
            ) : (
              <div className="w-12 h-10"></div> // Spacer
            )}

            {/* Current Page Title */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                {title}
              </h1>
              {/* Breadcrumb */}
              <div className="flex items-center justify-center gap-2 mt-1 text-sm text-white/80">
                <Home className="h-3 w-3" />
                <span>Admin</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-white font-semibold">{ADMIN_PAGES.find(p => p.path === pathname)?.name || title}</span>
              </div>
            </div>

            {/* Next Page Arrow */}
            {nextPage ? (
              <Link
                href={nextPage.path}
                className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                title={`Go to ${nextPage.name}`}
              >
                <span className="hidden md:inline">{nextPage.name}</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div className="w-12 h-10"></div> // Spacer
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Page Navigation Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {ADMIN_PAGES.map((page) => {
              const Icon = page.icon;
              const isActive = pathname === page.path;
              
              return (
                <Link
                  key={page.path}
                  href={page.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? 'bg-white text-[#0046be] shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{page.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Page Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {ADMIN_PAGES.map((page, index) => (
            <div
              key={page.path}
              className={`h-2 rounded-full transition-all duration-300 ${
                pathname === page.path
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/30 hover:bg-white/50 cursor-pointer'
              }`}
              onClick={() => router.push(page.path)}
              title={page.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

