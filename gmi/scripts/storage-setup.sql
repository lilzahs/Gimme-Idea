-- Enable storage for posts and avatars
-- Note: This script sets up RLS policies for storage buckets
-- Run this in your Supabase SQL editor

-- Create the main gimme-idea bucket
-- (Storage buckets are typically created via Supabase UI or SDK)
-- This script assumes the bucket is already created

-- Set up RLS policies for the gimme-idea bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'gimme-idea',
  'gimme-idea',
  true,
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access to posts
CREATE POLICY "Public read posts"
ON storage.objects FOR SELECT
USING (bucket_id = 'gimme-idea' AND auth.role() = 'authenticated_user');

-- Allow users to upload to their own avatar folder
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gimme-idea' 
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Allow users to upload posts
CREATE POLICY "Users can upload posts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gimme-idea' 
  AND (storage.foldername(name))[1] = 'posts'
);
