import 'server-only';
import { supabaseAdmin } from './server';

export interface OrderData {
  productSlug: string;
  productTitle: string;
  productPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  fullOrderData: any; // Complete order object for reference
}

/**
 * Save order to database (this happens FIRST, before email)
 */
export async function saveOrder(orderData: OrderData): Promise<{ id: string; success: boolean; error?: string }> {
  try {
    console.log('📦 [saveOrder] Starting order save...');
    console.log('📦 [saveOrder] Order data:', {
      productSlug: orderData.productSlug,
      productTitle: orderData.productTitle,
      productPrice: orderData.productPrice,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
    });

    // Validate required fields
    if (!orderData.productSlug || !orderData.productTitle || !orderData.customerName || !orderData.customerEmail) {
      const missing = [];
      if (!orderData.productSlug) missing.push('productSlug');
      if (!orderData.productTitle) missing.push('productTitle');
      if (!orderData.customerName) missing.push('customerName');
      if (!orderData.customerEmail) missing.push('customerEmail');
      console.error('❌ [saveOrder] Missing required fields:', missing);
      return { id: '', success: false, error: `Missing required fields: ${missing.join(', ')}` };
    }

    const insertData = {
      product_slug: orderData.productSlug,
      product_title: orderData.productTitle,
      product_price: Number(orderData.productPrice), // Ensure it's a number
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone || null,
      shipping_address: orderData.shippingAddress,
      shipping_city: orderData.shippingCity,
      shipping_state: orderData.shippingState,
      shipping_zip: orderData.shippingZip,
      full_order_data: orderData.fullOrderData || {},
      email_sent: false,
      email_error: null,
    };

    console.log('📦 [saveOrder] Inserting data:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('❌ [saveOrder] Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, null, 2),
      });
      return { id: '', success: false, error: error.message || 'Database error' };
    }

    if (!data || !data.id) {
      console.error('❌ [saveOrder] No data returned from Supabase insert');
      console.error('📦 [saveOrder] Response data:', data);
      return { id: '', success: false, error: 'No data returned from database' };
    }

    console.log('✅ [saveOrder] Order saved successfully with ID:', data.id);
    return { id: data.id, success: true };
  } catch (error) {
    console.error('❌ [saveOrder] Exception saving order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('❌ [saveOrder] Error stack:', errorStack);
    return { id: '', success: false, error: errorMessage };
  }
}

/**
 * Update order email status after sending email
 */
export async function updateOrderEmailStatus(
  orderId: string,
  emailSent: boolean,
  emailError?: string,
  retryCount?: number,
  nextRetryAt?: string | null
): Promise<boolean> {
  try {
    const updateData: any = {
      email_sent: emailSent,
      email_error: emailError || null,
      updated_at: new Date().toISOString(),
    };

    if (retryCount !== undefined) {
      updateData.email_retry_count = retryCount;
    }

    if (nextRetryAt !== undefined) {
      updateData.next_retry_at = nextRetryAt;
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order email status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating order email status:', error);
    return false;
  }
}

/**
 * Get orders that need email retry
 */
export async function getOrdersNeedingRetry(maxRetries: number = 5): Promise<any[]> {
  try {
    const now = new Date().toISOString();
    
    // Get orders where email hasn't been sent, retry count is below max, and either no retry scheduled or retry time has passed
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('email_sent', false)
      .lt('email_retry_count', maxRetries)
      .order('created_at', { ascending: true })
      .limit(50); // Process 50 at a time

    if (error) {
      console.error('Error fetching orders needing retry:', error);
      return [];
    }

    // Filter in JavaScript to handle OR condition (next_retry_at is null OR next_retry_at < now)
    const filtered = (data || []).filter(order => {
      const retryCount = order.email_retry_count || 0;
      const nextRetry = order.next_retry_at;
      
      // Include if retry count is below max AND (no retry scheduled OR retry time has passed)
      return retryCount < maxRetries && (!nextRetry || new Date(nextRetry) <= new Date(now));
    });

    return filtered;
  } catch (error) {
    console.error('Error fetching orders needing retry:', error);
    return [];
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string) {
  try {
    console.log(`🔍 Fetching order ${orderId} from database...`);
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('❌ Error fetching order:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    if (!data) {
      console.error(`❌ Order ${orderId} not found in database`);
      return null;
    }

    console.log(`✅ Order ${orderId} fetched successfully`);
    return data;
  } catch (error) {
    console.error('❌ Exception fetching order:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return null;
  }
}

/**
 * Get all orders (for admin dashboard)
 * Includes product's listed_by field by joining with products table
 */
export async function getAllOrders() {
  try {
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return [];
    }

    if (!orders || orders.length === 0) {
      return [];
    }

    // Get unique product slugs from orders
    const productSlugs = [...new Set(orders.map((o: any) => o.product_slug).filter(Boolean))];
    
    // Fetch products to get listed_by values
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('slug, listed_by')
      .in('slug', productSlugs);

    if (productsError) {
      console.error('Error fetching products for orders:', productsError);
      // Return orders without listed_by if product fetch fails
      return orders || [];
    }

    // Create a map of slug -> listed_by
    const productListedByMap = new Map<string, string | null>();
    (products || []).forEach((p: any) => {
      productListedByMap.set(p.slug, p.listed_by || null);
    });

    // Enrich orders with product's listed_by
    const enrichedOrders = (orders || []).map((order: any) => {
      const listedBy = productListedByMap.get(order.product_slug) || null;
      return {
        ...order,
        product_listed_by: listedBy, // Add the listed_by value from the product
      };
    });

    return enrichedOrders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

