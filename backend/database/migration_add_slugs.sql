-- Migration: Add slug fields to users and projects
-- This enables clean URLs like /profile/john-doe and /idea/my-awesome-idea

-- Add slug column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Add slug column to projects table  
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Create function to generate slug from text
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT) 
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          TRIM(text_input),
          '[^\w\s-]', '', 'g'  -- Remove special characters
        ),
        '\s+', '-', 'g'  -- Replace spaces with hyphens
      ),
      '-+', '-', 'g'  -- Replace multiple hyphens with single
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to generate unique slug for users
CREATE OR REPLACE FUNCTION generate_unique_user_slug(username_input TEXT, user_id_input UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := generate_slug(username_input);
  final_slug := base_slug;
  
  -- Check if slug exists and increment counter if needed
  WHILE EXISTS (SELECT 1 FROM users WHERE slug = final_slug AND id != user_id_input) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate unique slug for projects
CREATE OR REPLACE FUNCTION generate_unique_project_slug(title_input TEXT, project_id_input UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := generate_slug(title_input);
  final_slug := base_slug;
  
  -- Check if slug exists and increment counter if needed
  WHILE EXISTS (SELECT 1 FROM projects WHERE slug = final_slug AND id != project_id_input) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing users with slugs
UPDATE users 
SET slug = generate_unique_user_slug(username, id)
WHERE slug IS NULL;

-- Update existing projects with slugs
UPDATE projects 
SET slug = generate_unique_project_slug(title, id)
WHERE slug IS NULL;

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_slug ON users(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug) WHERE slug IS NOT NULL;

-- Create trigger to auto-generate slug on user insert/update
CREATE OR REPLACE FUNCTION auto_generate_user_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if username changed or slug is null
  IF NEW.slug IS NULL OR OLD.username IS DISTINCT FROM NEW.username THEN
    NEW.slug := generate_unique_user_slug(NEW.username, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_user_slug ON users;
CREATE TRIGGER trigger_auto_user_slug
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_user_slug();

-- Create trigger to auto-generate slug on project insert/update
CREATE OR REPLACE FUNCTION auto_generate_project_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if title changed or slug is null
  IF NEW.slug IS NULL OR OLD.title IS DISTINCT FROM NEW.title THEN
    NEW.slug := generate_unique_project_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_project_slug ON projects;
CREATE TRIGGER trigger_auto_project_slug
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_project_slug();

-- Add comment
COMMENT ON COLUMN users.slug IS 'URL-friendly unique identifier derived from username';
COMMENT ON COLUMN projects.slug IS 'URL-friendly unique identifier derived from title';
