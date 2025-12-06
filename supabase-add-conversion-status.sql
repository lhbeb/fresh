-- Add is_converted column to orders table
-- Run this SQL in your Supabase SQL Editor

-- Add is_converted column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'is_converted'
  ) THEN
    ALTER TABLE orders ADD COLUMN is_converted BOOLEAN DEFAULT FALSE;
    
    -- Create index for faster filtering
    CREATE INDEX IF NOT EXISTS idx_orders_is_converted ON orders(is_converted);
    
    RAISE NOTICE 'Column is_converted added successfully';
  ELSE
    RAISE NOTICE 'Column is_converted already exists';
  END IF;
END $$;

