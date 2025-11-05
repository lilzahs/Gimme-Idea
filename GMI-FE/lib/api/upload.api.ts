/**
 * Upload API Service
 */

import { apiUpload, apiDelete, ApiResponse } from './client'

export interface UploadResponse {
  url: string
  path: string
  size: number
  mimeType: string
}

/**
 * Upload image
 */
export async function uploadImage(
  file: File,
  walletAddress: string,
  walletSignature: string,
  message?: string
): Promise<ApiResponse<UploadResponse>> {
  return apiUpload('/api/upload', file, walletAddress, walletSignature, message)
}

/**
 * Delete image
 */
export async function deleteImage(
  path: string,
  walletAddress: string,
  walletSignature: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return apiDelete('/api/upload', {
    walletAddress,
    walletSignature
  })
}
