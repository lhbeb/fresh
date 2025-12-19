-- Add in_stock column if it doesn't exist
-- Run this SQL in your Supabase SQL Editor

-- Add the in_stock column
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;

-- Update any existing products that might have NULL values
UPDATE products 
SET in_stock = true 
WHERE in_stock IS NULL;

-- Verify the column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'in_stock';




