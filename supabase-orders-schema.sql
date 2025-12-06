-- Orders Table for Storing Checkout Data
-- Run this SQL in your Supabase SQL Editor

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug TEXT NOT NULL,
  product_title TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  full_order_data JSONB NOT NULL, -- Full order details as JSON
  email_sent BOOLEAN DEFAULT FALSE,
  email_error TEXT,
  email_retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist (for existing tables)
DO $$
BEGIN
  -- Add email_retry_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'email_retry_count'
  ) THEN
    ALTER TABLE orders ADD COLUMN email_retry_count INTEGER DEFAULT 0;
  END IF;

  -- Add next_retry_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'next_retry_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN next_retry_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Rename order_data to full_order_data if order_data exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_data'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'full_order_data'
  ) THEN
    ALTER TABLE orders RENAME COLUMN order_data TO full_order_data;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email_sent ON orders(email_sent);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_product_slug ON orders(product_slug);
CREATE INDEX IF NOT EXISTS idx_orders_next_retry_at ON orders(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_orders_updated_at'
      AND tgrelid = 'orders'::regclass
  ) THEN
    CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();
  END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public insert (for checkout)
DROP POLICY IF EXISTS "Public insert access for orders" ON orders;
CREATE POLICY "Public insert access for orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);

-- Create policy for admin read access (service role will bypass RLS)
DROP POLICY IF EXISTS "Admin read access for orders" ON orders;
CREATE POLICY "Admin read access for orders"
  ON orders
  FOR SELECT
  USING (true);

