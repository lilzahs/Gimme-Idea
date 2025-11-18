/**
 * Profile Actions
 * Client-side actions for profile management
 */

import { getWallet } from '../api/wallet.api'

export interface UpdateProfileInput {
  name: string
  bio?: string
}

/**
 * Update user profile
 */
export async function updateProfile(
  walletAddress: string,
  data: UpdateProfileInput
) {
  // For now, we'll return mock data since profile update isn't in the API yet
  // In a real implementation, this would call the API
  return {
    id: walletAddress,
    name: data.name,
    bio: data.bio || '',
    address: walletAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Get user profile by wallet address
 */
export async function getProfile(walletAddress: string) {
  const response = await getWallet(walletAddress)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get profile')
  }

  return response.data
}
