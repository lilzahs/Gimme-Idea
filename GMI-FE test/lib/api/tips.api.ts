/**
 * Tips API Service
 */

import { apiGet, apiPost, ApiResponse } from './client'

export interface SendTipInput {
  commentId: string
  amount: number
  txSignature: string
}

export interface Tip {
  id: string
  commentId: string
  fromWallet: string
  toWallet: string
  amount: number
  txSignature: string
  createdAt: string
}

/**
 * Send tip to comment
 */
export async function sendTip(
  input: SendTipInput,
  walletAddress: string,
  walletSignature: string
): Promise<ApiResponse<{ tip: Tip; message: string }>> {
  return apiPost('/api/tips/send', input, {
    walletAddress,
    walletSignature
  })
}

/**
 * Get tip history for wallet
 */
export async function getTipHistory(
  walletAddress: string,
  type: 'all' | 'sent' | 'received' = 'all'
): Promise<ApiResponse<{ tips: Tip[]; stats: any }>> {
  return apiGet(`/api/tips/${walletAddress}?type=${type}`)
}

/**
 * Get tips for specific comment
 */
export async function getCommentTips(
  commentId: string
): Promise<ApiResponse<{ tips: Tip[]; total: number; count: number }>> {
  return apiGet(`/api/tips/comment/${commentId}`)
}
