/**
 * Prizes API Service
 */

import { apiGet, apiPost, ApiResponse } from './client'

export interface PrizePoolStatus {
  prizePool: {
    id: string
    totalAmount: number
    winnersCount: number
    distribution: number[]
    endsAt: string
    ended: boolean
    distributed: boolean
    distributeTx?: string
    escrowPda?: string
    escrowTx?: string
  }
  rankings: Array<{
    rank: number
    amount: number
    winner: string
    claimed: boolean
    claimTx?: string
    commentId: string
  }>
  status: {
    rankingsComplete: boolean
    canDistribute: boolean
    timeRemaining: number
  }
}

/**
 * Get prize pool status
 */
export async function getPrizePoolStatus(
  prizePoolId: string
): Promise<ApiResponse<PrizePoolStatus>> {
  return apiGet(`/api/prizes/${prizePoolId}/status`)
}

/**
 * Distribute prizes (post owner only)
 */
export async function distributePrizes(
  prizePoolId: string,
  walletAddress: string,
  walletSignature: string
): Promise<ApiResponse<any>> {
  return apiPost(`/api/prizes/${prizePoolId}/distribute`, {}, {
    walletAddress,
    walletSignature
  })
}

/**
 * Claim prize (winner only)
 */
export async function claimPrize(
  rankingId: string,
  walletAddress: string,
  walletSignature: string
): Promise<ApiResponse<{ success: boolean; message: string; claimTx: string }>> {
  return apiPost(`/api/prizes/${rankingId}/claim`, {}, {
    walletAddress,
    walletSignature
  })
}
