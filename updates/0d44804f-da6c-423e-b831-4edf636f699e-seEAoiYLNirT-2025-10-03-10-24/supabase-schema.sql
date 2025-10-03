-- GarageVault Supabase Schema
-- Run this SQL in your Supabase SQL Editor

-- Create households table
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create household_members table
CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(household_id, device_id)
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  max_quantity INTEGER NOT NULL,
  threshold INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  image_uri TEXT,
  images TEXT[], -- Array of image URIs
  purchase_links JSONB, -- {homeDepot, lowes, amazon}
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_household ON inventory_items(household_id);
CREATE INDEX IF NOT EXISTS idx_inventory_deleted ON inventory_items(deleted_at);
CREATE INDEX IF NOT EXISTS idx_members_household ON household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_households_invite ON households(invite_code);

-- Enable Row Level Security
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for households
-- Anyone can create a household
CREATE POLICY "Anyone can create households"
  ON households FOR INSERT
  WITH CHECK (true);

-- Anyone can read households (needed for joining via invite code)
CREATE POLICY "Anyone can read households"
  ON households FOR SELECT
  USING (true);

-- Only members can update household
CREATE POLICY "Members can update their household"
  ON households FOR UPDATE
  USING (
    id IN (
      SELECT household_id FROM household_members
    )
  );

-- RLS Policies for household_members
-- Anyone can join a household
CREATE POLICY "Anyone can join households"
  ON household_members FOR INSERT
  WITH CHECK (true);

-- Members can see other members in their household
CREATE POLICY "Members can see household members"
  ON household_members FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members
    )
  );

-- Members can update their own record
CREATE POLICY "Members can update own record"
  ON household_members FOR UPDATE
  USING (device_id = device_id);

-- RLS Policies for inventory_items
-- Members can create items in their household
CREATE POLICY "Members can create inventory items"
  ON inventory_items FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members
    )
  );

-- Members can view items in their household (exclude soft-deleted)
CREATE POLICY "Members can view household inventory"
  ON inventory_items FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members
    )
    AND deleted_at IS NULL
  );

-- Members can update items in their household
CREATE POLICY "Members can update household inventory"
  ON inventory_items FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members
    )
  );

-- Members can delete items in their household (soft delete)
CREATE POLICY "Members can delete household inventory"
  ON inventory_items FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members
    )
  );

-- Function to generate 6-digit invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-digit code
    code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if code already exists
    SELECT COUNT(*) > 0 INTO exists FROM households WHERE invite_code = code;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON households
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable real-time for inventory updates
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE household_members;
