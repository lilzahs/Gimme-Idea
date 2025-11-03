/**
 * Image Actions
 * Client-side actions for image upload
 */

import {
  uploadImage as apiUploadImage,
  deleteImage as apiDeleteImage,
  type UploadResponse
} from '../api/upload.api'

/**
 * Upload post image
 */
export async function uploadPostImage(
  file: File,
  walletAddress: string,
  walletSignature: string
): Promise<string> {
  const response = await apiUploadImage(file, walletAddress, walletSignature)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to upload image')
  }

  // Return the URL of the uploaded image
  return response.data.url
}

/**
 * Delete image
 */
export async function deleteImage(
  path: string,
  walletAddress: string,
  walletSignature: string
) {
  const response = await apiDeleteImage(path, walletAddress, walletSignature)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to delete image')
  }

  return response.data
}

// Re-export types
export type { UploadResponse }
