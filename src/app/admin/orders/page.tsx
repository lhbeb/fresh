"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Mail, MailCheck, MailX, Calendar, DollarSign, User, MapPin, Phone, Search, X, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, CheckCircle2, Trash2, Copy, Eye, ExternalLink } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminLoading from '@/components/AdminLoading';

interface Order {
  id: string;
  product_slug: string;
  product_title: string;
  product_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  email_sent: boolean;
  email_error: string | null;
  email_retry_count?: number;
  next_retry_at?: string | null;
  is_converted?: boolean;
  created_at: string;
  updated_at: string;
  order_data: any;
  product_listed_by?: string | null; // The user who listed the product
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [paginatedOrders, setPaginatedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [emailFilter, setEmailFilter] = useState<'all' | 'sent' | 'failed'>('all');
  const [conversionFilter, setConversionFilter] = useState<'all' | 'converted' | 'not_converted'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [retryingAll, setRetryingAll] = useState(false);
  const [markingConverted, setMarkingConverted] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...orders];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        const customerName = order.customer_name?.toLowerCase() || '';
        const customerEmail = order.customer_email?.toLowerCase() || '';
        const productTitle = order.product_title?.toLowerCase() || '';
        const productSlug = order.product_slug?.toLowerCase() || '';
        const address = `${order.shipping_address} ${order.shipping_city} ${order.shipping_state}`.toLowerCase();
        
        return (
          customerName.includes(query) ||
          customerEmail.includes(query) ||
          productTitle.includes(query) ||
          productSlug.includes(query) ||
          address.includes(query)
        );
      });
    }

    // Apply email status filter
    if (emailFilter === 'sent') {
      filtered = filtered.filter(order => order.email_sent === true);
    } else if (emailFilter === 'failed') {
      filtered = filtered.filter(order => order.email_sent === false);
    }

    // Apply conversion status filter
    if (conversionFilter === 'converted') {
      filtered = filtered.filter(order => order.is_converted === true);
    } else if (conversionFilter === 'not_converted') {
      filtered = filtered.filter(order => !order.is_converted);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [searchQuery, emailFilter, conversionFilter, orders]);

  // Pagination effect
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredOrders.slice(startIndex, endIndex);
    setPaginatedOrders(paginated);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const handleRetryEmail = async (orderId: string) => {
    setRetryingOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/retry-email`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to retry email');
      }

      const result = await response.json();
      
      // If email was sent successfully, update the order state immediately
      if (result.success) {
        // Use the updated order from API response if available, otherwise use optimistic update
        const updatedOrder = result.order;
        
        if (updatedOrder) {
          // Update with actual data from database
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === orderId ? updatedOrder : order
            )
          );
          setFilteredOrders(prevFiltered => 
            prevFiltered.map(order => 
              order.id === orderId ? updatedOrder : order
            )
          );
        } else {
          // Fallback: optimistic update
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === orderId 
                ? { ...order, email_sent: true, email_error: null, email_retry_count: 0 }
                : order
            )
          );
          setFilteredOrders(prevFiltered => 
            prevFiltered.map(order => 
              order.id === orderId 
                ? { ...order, email_sent: true, email_error: null, email_retry_count: 0 }
                : order
            )
          );
        }
        
        // Small delay to ensure database update has propagated, then refresh
        setTimeout(() => {
          fetchOrders();
        }, 500);
      } else {
        // If failed, just refresh normally
        await fetchOrders();
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry email');
      console.error(err);
    } finally {
      setRetryingOrderId(null);
    }
  };

  const handleRetryAllFailed = async () => {
    setRetryingAll(true);
    try {
      const response = await fetch('/api/admin/orders/retry-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxOrders: 50 }),
      });

      if (!response.ok) {
        throw new Error('Failed to retry emails');
      }

      const result = await response.json();
      alert(`Retry completed: ${result.sent} sent, ${result.failed} failed`);
      
      // Refresh orders
      await fetchOrders();
      setError('');
    } catch (err) {
      setError('Failed to retry emails');
      console.error(err);
    } finally {
      setRetryingAll(false);
    }
  };

  const handleMarkAsConverted = async (orderId: string) => {
    setMarkingConverted(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/mark-converted`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark order as converted');
      }

      // Refresh orders to show updated status
      await fetchOrders();
      setError('');
    } catch (err) {
      setError('Failed to mark order as converted');
      console.error(err);
    } finally {
      setMarkingConverted(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete this order?\n\n` +
      `Customer: ${order.customer_name}\n` +
      `Product: ${order.product_title}\n` +
      `Price: $${order.product_price.toFixed(2)}\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingOrderId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete order');
      }

      // Refresh orders to remove deleted order
      await fetchOrders();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
      console.error(err);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleCopyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEmailStatusBadge = (order: Order) => {
    if (order.email_sent) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
          <MailCheck className="h-3 w-3" />
          Sent
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
          <MailX className="h-3 w-3" />
          Failed
        </span>
      );
    }
  };

  if (loading) {
    return <AdminLoading message="Loading orders..." />;
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.product_price || 0), 0);
  const emailsSent = orders.filter(o => o.email_sent).length;
  const emailsFailed = orders.filter(o => !o.email_sent).length;
  const convertedOrders = orders.filter(o => o.is_converted).length;
  const convertedRevenue = orders.filter(o => o.is_converted).reduce((sum, o) => sum + (o.product_price || 0), 0);

  return (
    <AdminLayout 
      title="Orders" 
      subtitle={`${orders.length} total orders • $${totalRevenue.toFixed(2)} revenue`}
    >
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg">{error}</div>
        )}

        {/* Export Orders Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => {
              fetch('/api/admin/orders/export')
                .then(res => res.blob())
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'orders.csv';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
            Export Orders (CSV)
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-2 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Converted Orders</div>
            <div className="text-2xl font-bold text-green-600">
              {convertedOrders}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Emails Sent</div>
            <div className="text-2xl font-bold text-green-600">
              {emailsSent}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Emails Failed</div>
            <div className="text-2xl font-bold text-red-600">
              {emailsFailed}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-2 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Converted Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              ${convertedRevenue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Retry Failed Emails Button */}
        {orders.filter(o => !o.email_sent).length > 0 && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-semibold text-yellow-900">
                    {orders.filter(o => !o.email_sent).length} order(s) with failed emails
                  </div>
                  <div className="text-sm text-yellow-700">
                    These emails will retry automatically, or you can retry them manually now
                  </div>
                </div>
              </div>
              <button
                onClick={handleRetryAllFailed}
                disabled={retryingAll}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${retryingAll ? 'animate-spin' : ''}`} />
                {retryingAll ? 'Retrying...' : 'Retry All Failed Emails'}
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, email, product, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0046be] focus:border-[#0046be] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Email Status:</label>
                <select
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value as 'all' | 'sent' | 'failed')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0046be] focus:border-[#0046be] outline-none bg-white"
                >
                  <option value="all">All Orders</option>
                  <option value="sent">Email Sent ✅</option>
                  <option value="failed">Email Failed ❌</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Conversion:</label>
                <select
                  value={conversionFilter}
                  onChange={(e) => setConversionFilter(e.target.value as 'all' | 'converted' | 'not_converted')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0046be] focus:border-[#0046be] outline-none bg-white"
                >
                  <option value="all">All Orders</option>
                  <option value="converted">Converted ✅</option>
                  <option value="not_converted">Not Converted</option>
                </select>
              </div>
            </div>

            {/* Filter Status */}
            {(searchQuery || emailFilter !== 'all' || conversionFilter !== 'all') && (
              <div className="pt-2 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> order{orders.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders List - Card-based layout */}
        {paginatedOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedOrders.map((order) => (
              <div
                key={order.id}
                className={`rounded-2xl shadow-sm border transition-all ${
                  order.is_converted 
                    ? 'border-green-300 bg-green-50' 
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                {/* Order Header - Always Visible */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Customer Avatar */}
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {order.customer_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {order.customer_name}
                        </h3>
                        {order.is_converted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Converted
                          </span>
                        )}
                        {order.email_sent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            <MailCheck className="h-3 w-3" />
                            Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            <MailX className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-gray-500 truncate flex-1">
                          {order.product_title}
                        </p>
                        <Link
                          href={`/products/${order.product_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                          title="View product"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">Uploader:</span>
                        <span className="text-xs font-medium text-gray-600">{order.product_listed_by || '—'}</span>
                      </div>
                    </div>

                    {/* Price & Date */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">${order.product_price.toFixed(2)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                    </div>

                    {/* Expand Icon */}
                    <ChevronRight 
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        expandedOrderId === order.id ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrderId === order.id && (
                  <div className={`px-4 pb-4 border-t ${order.is_converted ? 'border-green-200' : 'border-gray-100'}`}>
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Customer Details */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Customer
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{order.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2 group">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700 truncate">{order.customer_email}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyToClipboard(order.customer_email, `email-${order.id}`);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedField === `email-${order.id}` ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          </div>
                          {order.customer_phone && (
                            <div className="flex items-center gap-2 group">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{order.customer_phone}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyToClipboard(order.customer_phone!, `phone-${order.id}`);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {copiedField === `phone-${order.id}` ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Shipping Address
                        </h4>
                        <div className="flex items-start gap-2 group">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div className="text-sm text-gray-700">
                            <p>{order.shipping_address}</p>
                            <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const address = `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}`;
                              handleCopyToClipboard(address, `address-${order.id}`);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedField === `address-${order.id}` ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Order Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700 flex-1">{order.product_title}</span>
                            <Link
                              href={`/products/${order.product_slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View product"
                            >
                              <Eye className="h-3 w-3" />
                              View Product
                            </Link>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">${order.product_price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              <span className="font-medium">Uploader:</span> {order.product_listed_by || '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{formatFullDate(order.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email Error */}
                    {!order.email_sent && order.email_error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Email Error:</span> {order.email_error}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                      {!order.email_sent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetryEmail(order.id);
                          }}
                          disabled={retryingOrderId === order.id}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 disabled:opacity-50 transition-all"
                        >
                          {retryingOrderId === order.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                          Retry Email
                        </button>
                      )}

                      {!order.is_converted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsConverted(order.id);
                          }}
                          disabled={markingConverted === order.id}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 disabled:opacity-50 transition-all"
                        >
                          {markingConverted === order.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Mark Converted
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order.id);
                        }}
                        disabled={deletingOrderId === order.id}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50 transition-all"
                      >
                        {deletingOrderId === order.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
    </AdminLayout>
  );
}
