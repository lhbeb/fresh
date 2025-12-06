-- Optional: Add dedicated published column for better query performance
-- This is OPTIONAL - the feature works without this using meta.published
-- Only run this if you want better database-level filtering performance

-- Add published column (if it doesn't exist)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

-- Create index for faster filtering by published status
CREATE INDEX IF NOT EXISTS idx_products_published ON products(published);

-- Optional: Migrate existing meta.published values to the new column
-- This updates any products that already have meta.published set
UPDATE products
SET published = COALESCE((meta->>'published')::boolean, false)
WHERE published IS NULL OR published = false;

-- Optional: Create a trigger to keep meta.published and published column in sync
-- This ensures both stay synchronized if you update either one
CREATE OR REPLACE FUNCTION sync_published_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If published column is updated, update meta.published
  IF TG_OP = 'UPDATE' AND (OLD.published IS DISTINCT FROM NEW.published) THEN
    NEW.meta = COALESCE(NEW.meta, '{}'::jsonb) || jsonb_build_object('published', NEW.published);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (only if it doesn't exist)
DROP TRIGGER IF EXISTS sync_published_trigger ON products;
CREATE TRIGGER sync_published_trigger
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION sync_published_status();

