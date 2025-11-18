/**
 * Wallet API Service
 */

import { apiPost, apiGet, ApiResponse } from './client'

export interface ConnectWalletInput {
  address: string
  type: string
  signature: string
  message: string
}

export interface Wallet {
  id: string
  address: string
  type: string
  postsCount: number
  tipsReceived: number
  tipsGiven: number
  createdAt: string
  updatedAt: string
}

/**
 * Connect wallet (first time or login)
 */
export async function connectWallet(
  input: ConnectWalletInput
): Promise<ApiResponse<{ wallet: Wallet; message: string }>> {
  return apiPost('/api/wallet/connect', input)
}

/**
 * Get wallet info by address
 */
export async function getWallet(address: string): Promise<ApiResponse<Wallet>> {
  return apiGet(`/api/wallet/${address}`)
}
