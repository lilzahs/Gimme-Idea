-- Migration: Add function to find project by ID prefix
-- This enables efficient lookup by first 8 characters of UUID

CREATE OR REPLACE FUNCTION find_project_by_id_prefix(prefix TEXT)
RETURNS UUID AS $$
DECLARE
  found_id UUID;
BEGIN
  SELECT id INTO found_id 
  FROM projects 
  WHERE id::text ILIKE prefix || '%'
  LIMIT 1;
  
  RETURN found_id;
END;
$$ LANGUAGE plpgsql;

-- Create index to speed up text pattern matching on ID
CREATE INDEX IF NOT EXISTS idx_projects_id_text ON projects ((id::text));
