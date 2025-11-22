// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Some features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name (default: 'post-images')
 * @returns The public URL of the uploaded image
 */
export const uploadImageToSupabase = async (
  file: File,
  bucket: string = 'post-images'
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return urlData.publicUrl;
};

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image
 * @param bucket - The storage bucket name (default: 'post-images')
 */
export const deleteImageFromSupabase = async (
  imageUrl: string,
  bucket: string = 'post-images'
): Promise<void> => {
  // Extract file path from URL
  const urlParts = imageUrl.split('/');
  const filePath = urlParts[urlParts.length - 1];

  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

export default supabase;
