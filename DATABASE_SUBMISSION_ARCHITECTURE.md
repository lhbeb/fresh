# Database Submission Architecture - Deep Dive

This document provides a comprehensive understanding of how the codebase submits changes to the Supabase database.

## Table of Contents
1. [Database Setup](#database-setup)
2. [Client Architecture](#client-architecture)
3. [Product Submissions](#product-submissions)
4. [Order Submissions](#order-submissions)
5. [Authentication Flow](#authentication-flow)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Key Patterns](#key-patterns)

---

## Database Setup

### Supabase Clients

The project uses **two Supabase clients** for different purposes:

#### 1. Client-Side Client (`src/lib/supabase/client.ts`)
```typescript
// Uses anon key - respects Row Level Security (RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```
- **Purpose**: Client-side operations (rarely used in this codebase)
- **Security**: Respects RLS policies
- **Usage**: Minimal - most operations use server-side client

#### 2. Server-Side Admin Client (`src/lib/supabase/server.ts`)
```typescript
// Uses service_role key - bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```
- **Purpose**: All server-side database operations
- **Security**: Bypasses RLS (uses service_role key)
- **Usage**: Primary client for all database writes

### Database Schema

**Products Table** (`supabase-schema.sql`):
- Primary key: `id` (TEXT, usually matches slug)
- Unique constraint: `slug`
- Fields: title, description, price, images, condition, category, brand, checkout_link, etc.
- JSONB fields: `reviews`, `meta`
- Timestamps: `created_at`, `updated_at` (auto-updated via trigger)

**Orders Table** (`supabase-orders-schema.sql`):
- Primary key: `id` (UUID, auto-generated)
- Fields: product_slug, product_title, product_price, customer info, shipping info
- JSONB field: `full_order_data` (complete order snapshot)
- Email tracking: `email_sent`, `email_error`, `email_retry_count`, `next_retry_at`

---

## Client Architecture

### Frontend → API → Database Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client   │ ──────> │  API Route   │ ──────> │  Supabase   │
│  (React)   │  POST   │  (Next.js)   │  Query  │  Database   │
└────────────┘         └──────────────┘         └─────────────┘
     │                        │                        │
     │                        │                        │
     │ 1. Form Submit         │ 2. Validate           │ 3. Insert/Update
     │ 2. Fetch API           │ 3. Authenticate       │ 4. Return Data
     │ 3. Handle Response     │ 4. Call DB Function   │
```

### Key Components

1. **Frontend Forms** (`src/app/admin/products/new/page.tsx`, `edit/page.tsx`)
   - React client components with form state
   - Handle image uploads before submission
   - Validate data client-side
   - Submit via `fetch()` to API routes

2. **API Routes** (`src/app/api/admin/products/route.ts`, `[slug]/route.ts`)
   - Next.js Route Handlers (GET, POST, PATCH, DELETE)
   - Server-side only (can use `supabaseAdmin`)
   - Handle authentication
   - Call database functions from `src/lib/supabase/products.ts`

3. **Database Functions** (`src/lib/supabase/products.ts`, `orders.ts`)
   - Pure database operations
   - Use `supabaseAdmin` client
   - Transform data between DB format and app format
   - Return typed results

---

## Product Submissions

### Creating a New Product

**Flow:**
1. User fills form in `/admin/products/new`
2. Form submission triggers `handleSubmit()`
3. Images uploaded first (if pending)
4. Data validated and formatted
5. POST request to `/api/admin/products`
6. API validates authentication
7. API calls `createProduct()` from `products.ts`
8. `createProduct()` uses `supabaseAdmin.from('products').insert()`
9. Response returned to frontend
10. Next.js cache revalidated

**Code Path:**
```
src/app/admin/products/new/page.tsx (line 179-302)
  ↓ handleSubmit()
  ↓ fetch('/api/admin/products', { method: 'POST' })
  ↓
src/app/api/admin/products/route.ts (line 96-157)
  ↓ POST handler
  ↓ authenticateAdmin()
  ↓ createProduct()
  ↓
src/lib/supabase/products.ts (line 166-234)
  ↓ createProduct()
  ↓ supabaseAdmin.from('products').insert()
  ↓ transformProduct()
  ↓ return Product
```

**Key Code Snippet:**
```typescript
// Frontend (new/page.tsx:276-284)
const response = await fetch('/api/admin/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  },
  body: JSON.stringify(productData),
});

// API Route (route.ts:135-138)
const product = await createProduct({
  ...productData,
  payee_email: productData.payee_email || '',
});

// Database Function (products.ts:199-222)
const { data, error } = await supabaseAdmin
  .from('products')
  .insert({
    id: productId,
    slug: productData.slug,
    title: productData.title,
    // ... all fields
  })
  .select()
  .single();
```

### Updating a Product

**Flow:**
1. User edits form in `/admin/products/[slug]/edit`
2. Form submission triggers `handleSubmit()`
3. PATCH request to `/api/admin/products/[slug]`
4. API validates authentication
5. API calls `updateProduct()` from `products.ts`
6. `updateProduct()` uses `supabaseAdmin.from('products').update().eq('slug', slug)`
7. Response returned to frontend

**Code Path:**
```
src/app/admin/products/[slug]/edit/page.tsx (line 222-298)
  ↓ handleSubmit()
  ↓ fetch(`/api/admin/products/${slug}`, { method: 'PATCH' })
  ↓
src/app/api/admin/products/[slug]/route.ts (line 98-148)
  ↓ PATCH handler
  ↓ authenticateAdmin()
  ↓ updateProduct(slug, updates)
  ↓
src/lib/supabase/products.ts (line 239-321)
  ↓ updateProduct()
  ↓ supabaseAdmin.from('products').update().eq('slug', slug)
  ↓ transformProduct()
  ↓ return Product
```

**Key Code Snippet:**
```typescript
// Database Function (products.ts:304-309)
const { data, error } = await supabaseAdmin
  .from('products')
  .update(updateData)
  .eq('slug', slug)
  .select()
  .single();
```

### Deleting a Product

**Flow:**
1. User clicks delete button
2. DELETE request to `/api/admin/products/[slug]`
3. API validates authentication
4. API calls `deleteProduct()` from `products.ts`
5. `deleteProduct()` uses `supabaseAdmin.from('products').delete().eq('slug', slug)`

**Code Snippet:**
```typescript
// Database Function (products.ts:356-372)
export async function deleteProduct(slug: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('slug', slug);
  
  return !error;
}
```

---

## Order Submissions

### Checkout Flow

**Critical Pattern: Database-First Approach**
Orders are **always saved to database FIRST**, then email is sent. This ensures no orders are lost even if email fails.

**Flow:**
1. User fills checkout form in `/checkout`
2. Form submission triggers `handleContinueToCheckout()`
3. Client calls `sendShippingEmail()` function
4. `sendShippingEmail()` makes POST to `/api/send-shipping-email`
5. **API saves order to database FIRST** using `saveOrder()`
6. API attempts to send email (with 5-second timeout)
7. If email fails, order is still saved (will retry later)
8. Response returned to client
9. Client redirects to payment link

**Code Path:**
```
src/app/checkout/page.tsx (line 377-462)
  ↓ handleContinueToCheckout()
  ↓ sendShippingEmail(shippingData, product)
  ↓ fetch('/api/send-shipping-email', { method: 'POST' })
  ↓
src/app/api/send-shipping-email/route.ts (line 8-204)
  ↓ POST handler
  ↓ saveOrder() ← DATABASE SAVE HAPPENS HERE FIRST
  ↓ sendOrderEmail() (with timeout)
  ↓
src/lib/supabase/orders.ts (line 21-93)
  ↓ saveOrder()
  ↓ supabaseAdmin.from('orders').insert()
  ↓ return { id, success, error }
```

**Key Code Snippet:**
```typescript
// API Route (send-shipping-email/route.ts:64-81)
// STEP 1: Save order to database FIRST (so we never lose the order)
const orderResult = await saveOrder({
  productSlug: product.slug,
  productTitle: product.title,
  productPrice: product.price,
  customerName: shippingData.email,
  customerEmail: shippingData.email,
  shippingAddress: shippingData.streetAddress,
  shippingCity: shippingData.city,
  shippingState: shippingData.state,
  shippingZip: shippingData.zipCode,
  fullOrderData: { shippingData, product, siteUrl },
});

// Database Function (orders.ts:61-65)
const { data, error } = await supabaseAdmin
  .from('orders')
  .insert(insertData)
  .select('id')
  .single();
```

### Order Email Status Updates

After attempting to send email, the order's email status is updated:

```typescript
// src/lib/supabase/orders.ts:98-135
export async function updateOrderEmailStatus(
  orderId: string,
  emailSent: boolean,
  emailError?: string,
  retryCount?: number,
  nextRetryAt?: string | null
): Promise<boolean> {
  const updateData: any = {
    email_sent: emailSent,
    email_error: emailError || null,
    updated_at: new Date().toISOString(),
  };
  
  const { error } = await supabaseAdmin
    .from('orders')
    .update(updateData)
    .eq('id', orderId);
}
```

---

## Authentication Flow

### Admin Authentication

**Pattern:** Email-based admin list + Supabase Auth

**Flow:**
1. Admin logs in via `/admin/login`
2. Login form calls `/api/admin/login`
3. API calls `authenticateAdmin()` from `auth.ts`
4. `authenticateAdmin()` uses `supabaseAdmin.auth.signInWithPassword()`
5. Checks if email is in admin list via `isAdmin()`
6. Returns success/failure
7. Frontend stores token in `localStorage` as `admin_token`
8. Subsequent API calls include token in `Authorization` header

**Code Path:**
```
src/app/admin/login/page.tsx
  ↓ Login form submit
  ↓ fetch('/api/admin/login', { method: 'POST' })
  ↓
src/app/api/admin/login/route.ts
  ↓ authenticateAdmin(email, password)
  ↓
src/lib/supabase/auth.ts (line 22-51)
  ↓ supabaseAdmin.auth.signInWithPassword()
  ↓ isAdmin(user.email)
  ↓ return { success, error }
```

**Admin Check:**
```typescript
// src/lib/supabase/auth.ts:6-16
export async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = [
    'elmahboubimehdi@gmail.com',
    // Add more admin emails here
  ];
  return adminEmails.includes(email.toLowerCase().trim());
}
```

**API Authentication:**
```typescript
// src/app/api/admin/products/route.ts:43-73
async function getAdminAuth(request: NextRequest) {
  // Check for admin_token cookie first
  const token = request.cookies.get('admin_token')?.value;
  
  if (token) {
    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    // Check if user is admin
    const adminStatus = await isAdmin(user.email || '');
    if (!adminStatus) {
      return null;
    }
    
    return token;
  }
  
  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split('Bearer ')[1];
}
```

---

## Data Flow Diagrams

### Product Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCT CREATION                         │
└─────────────────────────────────────────────────────────────┘

1. User fills form
   └─> React state (formData, reviews, images)

2. User clicks "Create Product"
   └─> handleSubmit() triggered

3. Upload pending images
   └─> ImageUploader.uploadPendingImages()
   └─> Images uploaded to Supabase Storage
   └─> Image URLs returned

4. Format product data
   └─> Build productData object
   └─> Process reviews array
   └─> Build meta object

5. POST to /api/admin/products
   └─> Headers: Authorization Bearer token
   └─> Body: JSON productData

6. API Route Handler
   └─> Validate authentication (getAdminAuth)
   └─> Validate required fields
   └─> Check featured product limit
   └─> Call createProduct()

7. Database Function
   └─> Transform data (camelCase → snake_case)
   └─> supabaseAdmin.from('products').insert()
   └─> Transform response (snake_case → camelCase)
   └─> Return Product object

8. API Response
   └─> Revalidate Next.js cache paths
   └─> Return Product JSON

9. Frontend Response
   └─> Show success message
   └─> Redirect to edit page
```

### Order Submission Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ORDER SUBMISSION                         │
└─────────────────────────────────────────────────────────────┘

1. User fills checkout form
   └─> Shipping data (email, address, city, state, zip)
   └─> Product from cart

2. User clicks "Continue to Payment"
   └─> handleContinueToCheckout() triggered
   └─> Validate form fields

3. Call sendShippingEmail()
   └─> POST to /api/send-shipping-email
   └─> Body: { shippingData, product }

4. API Route Handler
   └─> Validate request data
   └─> STEP 1: Save order to database FIRST
       └─> saveOrder() → supabaseAdmin.from('orders').insert()
       └─> Returns orderId
   └─> STEP 2: Attempt to send email (5s timeout)
       └─> getOrderById(orderId)
       └─> sendOrderEmail(order)
       └─> updateOrderEmailStatus() if needed

5. Response
   └─> { success: true, orderId, emailSent, duration }
   └─> OR { success: true, orderId, emailSent: false } (if email failed)

6. Frontend Response
   └─> If success: Redirect to payment link
   └─> If failure: Show error, don't redirect
```

---

## Key Patterns

### 1. Server-Side Only Database Operations

**Pattern:** All database writes use `supabaseAdmin` (server-side client)

**Why:** 
- Service role key bypasses RLS
- More secure (keys never exposed to client)
- Better error handling

**Implementation:**
- Database functions in `src/lib/supabase/*.ts` are marked `'server-only'`
- Only called from API routes (server-side)
- Never called directly from client components

### 2. Data Transformation Layer

**Pattern:** Transform between database format (snake_case) and app format (camelCase)

**Why:**
- Database uses PostgreSQL naming (snake_case)
- TypeScript/React uses camelCase
- Clean separation of concerns

**Implementation:**
```typescript
// Database → App (products.ts:7-28)
function transformProduct(row: any): Product {
  return {
    id: row.id || row.slug,
    slug: row.slug,
    title: row.title,
    price: row.price,
    reviewCount: row.review_count,  // snake_case → camelCase
    isFeatured: Boolean(row.is_featured),
    // ...
  };
}

// App → Database (products.ts:199-222)
const { data, error } = await supabaseAdmin
  .from('products')
  .insert({
    id: productId,
    slug: productData.slug,
    review_count: reviewCount,  // camelCase → snake_case
    is_featured: productData.is_featured,
    // ...
  });
```

### 3. Database-First for Critical Data

**Pattern:** Save critical data (orders) to database before any external operations (email)

**Why:**
- Ensures data is never lost
- Email can fail, but order is preserved
- Enables retry mechanisms

**Implementation:**
```typescript
// Always save order FIRST
const orderResult = await saveOrder(orderData);
if (!orderResult.success) {
  return error; // Don't proceed if save fails
}

// Then attempt email (non-blocking)
try {
  await sendOrderEmail(order);
} catch (error) {
  // Order is already saved, just log error
  await updateOrderEmailStatus(orderId, false, error.message);
}
```

### 4. Authentication Token Pattern

**Pattern:** Store auth token in localStorage, send in Authorization header

**Why:**
- Stateless authentication
- Works with Supabase Auth
- Easy to check on each request

**Implementation:**
```typescript
// Frontend: Store token
localStorage.setItem('admin_token', token);

// Frontend: Send token
fetch('/api/admin/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Backend: Verify token
const token = request.headers.get('authorization')?.split('Bearer ')[1];
const { data: { user } } = await supabaseAdmin.auth.getUser(token);
```

### 5. Cache Revalidation

**Pattern:** Revalidate Next.js cache after database writes

**Why:**
- Ensures users see updated data immediately
- Works with Next.js App Router caching

**Implementation:**
```typescript
// After product update
revalidatePath('/');
revalidatePath('/products');
revalidatePath(`/products/${slug}`);
```

### 6. Error Handling Strategy

**Pattern:** Return structured error responses, log detailed errors server-side

**Why:**
- Better debugging
- User-friendly error messages
- Detailed logs for troubleshooting

**Implementation:**
```typescript
// Database function
if (error) {
  console.error('Error creating product:', error);
  return null; // Or throw with details
}

// API route
if (!product) {
  return NextResponse.json(
    { error: 'Failed to create product' },
    { status: 500 }
  );
}
```

---

## Summary

### Key Takeaways

1. **All database writes use `supabaseAdmin`** (server-side client with service role)
2. **Database operations are server-only** - called from API routes, never directly from client
3. **Data transformation** happens between database (snake_case) and app (camelCase)
4. **Orders are saved FIRST** before any external operations (email)
5. **Authentication** uses Supabase Auth with email-based admin list
6. **Cache revalidation** ensures fresh data after writes
7. **Error handling** is comprehensive with detailed logging

### File Structure

```
src/
├── lib/
│   └── supabase/
│       ├── client.ts          # Client-side Supabase (rarely used)
│       ├── server.ts          # Server-side Supabase (primary)
│       ├── products.ts        # Product CRUD operations
│       ├── orders.ts          # Order operations
│       └── auth.ts             # Authentication utilities
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   └── products/
│   │   │       ├── route.ts              # GET all, POST create
│   │   │       └── [slug]/
│   │   │           └── route.ts         # GET, PATCH, DELETE single
│   │   └── send-shipping-email/
│   │       └── route.ts                  # Order submission
│   └── admin/
│       └── products/
│           ├── new/page.tsx               # Create product form
│           └── [slug]/edit/page.tsx      # Edit product form
└── checkout/
    └── page.tsx                           # Checkout form
```

This architecture ensures:
- ✅ Secure database operations (server-side only)
- ✅ Type safety (TypeScript throughout)
- ✅ Data integrity (database-first approach)
- ✅ Good UX (immediate feedback, error handling)
- ✅ Maintainability (clear separation of concerns)

