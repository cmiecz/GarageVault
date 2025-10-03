-- Migration: Add details column and fix numeric types for paint
-- This stores brand, size, color, type, material, and rooms as JSONB
-- Also changes quantity columns to support decimals (for paint cans)
-- Run this in your Supabase SQL Editor

-- Add details column
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;

-- Change quantity columns from INTEGER to NUMERIC to support decimals
ALTER TABLE inventory_items 
ALTER COLUMN quantity TYPE NUMERIC USING quantity::numeric;

ALTER TABLE inventory_items 
ALTER COLUMN max_quantity TYPE NUMERIC USING max_quantity::numeric;

ALTER TABLE inventory_items 
ALTER COLUMN threshold TYPE NUMERIC USING threshold::numeric;

-- Create index for better query performance on details
CREATE INDEX IF NOT EXISTS idx_inventory_details ON inventory_items USING GIN (details);

-- Example details structure:
-- {
--   "brand": "DeWalt",
--   "size": "10mm",
--   "color": "Blue",
--   "type": "Phillips head",
--   "material": "Steel",
--   "rooms": ["Kitchen", "Garage", "Living Room"]
-- }
