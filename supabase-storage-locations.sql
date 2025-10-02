-- Create storage_locations table
CREATE TABLE IF NOT EXISTS storage_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('packout', 'bin', 'drawer', 'shelf', 'cabinet', 'toolbox', 'other')),
  description TEXT,
  qr_code TEXT NOT NULL UNIQUE,
  color TEXT,
  date_added TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  synced_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT unique_name_per_household UNIQUE (household_id, name, deleted_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_storage_locations_household ON storage_locations(household_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_storage_locations_qr_code ON storage_locations(qr_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_storage_locations_type ON storage_locations(type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_storage_locations_deleted ON storage_locations(deleted_at);

-- Enable Row Level Security
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;

-- Create policy for household members to read storage locations
CREATE POLICY "Household members can read storage locations"
  ON storage_locations
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE device_id = current_setting('app.current_device_id', true)
    )
    AND deleted_at IS NULL
  );

-- Create policy for household members to insert storage locations
CREATE POLICY "Household members can insert storage locations"
  ON storage_locations
  FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE device_id = current_setting('app.current_device_id', true)
    )
  );

-- Create policy for household members to update storage locations
CREATE POLICY "Household members can update storage locations"
  ON storage_locations
  FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE device_id = current_setting('app.current_device_id', true)
    )
  );

-- Create policy for household members to delete storage locations (soft delete)
CREATE POLICY "Household members can delete storage locations"
  ON storage_locations
  FOR DELETE
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE device_id = current_setting('app.current_device_id', true)
    )
  );

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_storage_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_updated
CREATE TRIGGER storage_locations_update_timestamp
  BEFORE UPDATE ON storage_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_location_timestamp();

-- Add comment explaining storage in inventory items
COMMENT ON TABLE storage_locations IS 'Physical storage locations (bins, drawers, etc.) with QR codes. Storage references are stored in inventory_items.details JSONB field as storageLocationId and storagePosition.';
