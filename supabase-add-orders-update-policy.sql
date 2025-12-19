-- Add UPDATE, INSERT, and DELETE policies for orders table
-- Run this SQL in your Supabase SQL Editor

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all updates for service role" ON orders;
DROP POLICY IF EXISTS "Allow all inserts for service role" ON orders;
DROP POLICY IF EXISTS "Allow all deletes for service role" ON orders;

-- Create UPDATE policy - allows all updates (service role will bypass RLS anyway, but this ensures compatibility)
CREATE POLICY "Allow all updates for service role" 
  ON orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create INSERT policy (if not already exists from orders schema)
-- This is already in the schema, but adding here for completeness
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' 
    AND policyname = 'Public insert access for orders'
  ) THEN
    CREATE POLICY "Public insert access for orders"
      ON orders
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Create DELETE policy
CREATE POLICY "Allow all deletes for service role" 
  ON orders
  FOR DELETE
  USING (true);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- Also verify the is_converted column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'is_converted'
  ) THEN
    ALTER TABLE orders ADD COLUMN is_converted BOOLEAN DEFAULT FALSE;
    CREATE INDEX IF NOT EXISTS idx_orders_is_converted ON orders(is_converted);
    RAISE NOTICE 'Column is_converted added successfully';
  ELSE
    RAISE NOTICE 'Column is_converted already exists';
  END IF;
END $$;




