-- Add listed_by column to products table
-- This migration adds a new column to track who listed each product
-- Run this SQL in your Supabase SQL Editor
--
-- IMPORTANT: Make sure the products table exists first!
-- If you get an error "relation products does not exist", 
-- you need to run supabase-schema.sql first to create the products table.

-- Add the listed_by column (VARCHAR(50), nullable for backward compatibility)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS listed_by VARCHAR(50) DEFAULT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN products.listed_by IS 'The user who listed this product (walid, abdo, jebbar, amine, othmane, janah, youssef)';

-- Verify the column was added successfully
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'listed_by';
