"use client";

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  ShoppingCart, 
  Plus, 
  Upload, 
  LogOut,
  ChevronLeft,
  Home,
  Menu,
  X,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
}

// This will be populated dynamically with orders count
const getMainNavItems = (ordersCount: number): NavItem[] => [
  { name: 'Products', path: '/admin/products', icon: Package, description: 'Manage inventory' },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart, description: 'View all orders', badge: ordersCount > 0 ? ordersCount : undefined },
];

const quickActions: NavItem[] = [
  { name: 'Add Product', path: '/admin/products/new', icon: Plus },
  { name: 'Quick Add', path: '/admin/products/quick-add', icon: Zap },
  { name: 'Bulk Import', path: '/admin/products/bulk-import', icon: Upload },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ordersCount, setOrdersCount] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch orders count
  useEffect(() => {
    const fetchOrdersCount = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const response = await fetch('/api/admin/orders');
        if (response.ok) {
          const orders = await response.json();
          setOrdersCount(Array.isArray(orders) ? orders.length : 0);
        }
      } catch (error) {
        console.error('Failed to fetch orders count:', error);
      }
    };

    if (mounted) {
      fetchOrdersCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchOrdersCount, 30000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin/products') {
      return pathname === '/admin/products' || pathname === '/admin';
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5 text-gray-700" />
        ) : (
          <Menu className="h-5 w-5 text-gray-700" />
        )}
      </button>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-40
          transition-transform duration-300 ease-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          w-64 flex flex-col shadow-xl lg:shadow-none
        `}
      >
        {/* Logo/Header */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900">HappyDeel</span>
              <span className="text-[10px] text-gray-400 block -mt-0.5">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Admin Profile Card */}
        <div className="mx-4 my-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">Administrator</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Online
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="mb-6">
            <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Main Menu
            </p>
            <div className="space-y-1">
              {getMainNavItems(ordersCount).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className="relative flex-shrink-0">
                      <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm block">{item.name}</span>
                      {item.description && !active && (
                        <span className="text-[11px] text-gray-400 truncate block">{item.description}</span>
                      )}
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold min-w-[1.5rem] text-center ${
                        active ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Quick Actions
            </p>
            <div className="space-y-1">
              {quickActions.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200
                      ${active
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-sm">Back to Store</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

