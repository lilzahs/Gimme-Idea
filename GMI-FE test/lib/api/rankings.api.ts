/**
 * Rankings API Service
 */

import { apiGet, apiPost, apiDelete, ApiResponse } from './client'

export interface RankCommentInput {
  commentId: string
  rank: number
}

export interface Ranking {
  id: string
  prizePoolId: string
  commentId: string
  rank: number
  prizeAmount: number
  claimed: boolean
  claimTx?: string
  createdAt: string
  comment: {
    content: string
    wallet: {
      address: string
    }
  }
}

/**
 * Get rankings for a post
 */
export async function getRankings(
  postId: string
): Promise<ApiResponse<{ rankings: Ranking[] }>> {
  return apiGet(`/api/posts/${postId}/rankings`)
}

/**
 * Rank a comment (post owner only)
 */
export async function rankComment(
  postId: string,
  input: RankCommentInput,
  walletAddress: string,
  walletSignature: string
): Promise<ApiResponse<Ranking>> {
  return apiPost(`/api/posts/${postId}/rank`, input, {
    walletAddress,
    walletSignature
  })
}

/**
 * Remove ranking (before distribution)
 */
export async function removeRanking(
  rankingId: string,
  walletAddress: string,
  walletSignature: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiDelete(`/api/rankings/${rankingId}`, {
    walletAddress,
    walletSignature
  })
}
