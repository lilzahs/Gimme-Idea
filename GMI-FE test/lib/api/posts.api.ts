/**
 * Posts API Service
 */

import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './client'

export interface CreatePostInput {
  title: string
  description: string
  category: string
  imageUrl?: string
  prizePool?: {
    totalAmount: number
    winnersCount: number
    distribution: number[]
    endsAt: string // ISO date string
  }
}

export interface UpdatePostInput {
  title?: string
  description?: string
  category?: string
  imageUrl?: string
}

export interface Post {
  id: string
  title: string
  description: string
  category: string
  imageUrl?: string
  walletId: string
  createdAt: string
  updatedAt: string
  wallet: {
    address: string
  }
  prizePool?: any
  _count?: {
    comments: number
  }
}

/**
 * Get all posts with optional filters
 */
export async function getPosts(params?: {
  category?: string
  walletAddress?: string
  page?: number
  limit?: number
}): Promise<ApiResponse<{ posts: Post[]; total: number }>> {
  const searchParams = new URLSearchParams()

  if (params?.category) searchParams.append('category', params.category)
  if (params?.walletAddress) searchParams.append('walletAddress', params.walletAddress)
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.limit) searchParams.append('limit', params.limit.toString())

  const query = searchParams.toString()
  return apiGet(`/api/posts${query ? `?${query}` : ''}`)
}

/**
 * Get single post by ID
 */
export async function getPost(id: string): Promise<ApiResponse<Post>> {
  return apiGet(`/api/posts/${id}`)
}

/**
 * Create new post
 */
export async function createPost(
  input: CreatePostInput,
  walletAddress: string,
  walletSignature: string,
  message?: string
): Promise<ApiResponse<Post>> {
  // Include message in body for signature verification
  const body = message ? { ...input, message } : input

  return apiPost('/api/posts', body, {
    walletAddress,
    walletSignature
  })
}

/**
 * Update post
 */
export async function updatePost(
  id: string,
  input: UpdatePostInput,
  walletAddress: string,
  walletSignature: string
): Promise<ApiResponse<Post>> {
  return apiPut(`/api/posts/${id}`, input, {
    walletAddress,
    walletSignature
  })
}

/**
 * Delete post
 */
export async function deletePost(
  id: string,
  walletAddress: string,
  walletSignature: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiDelete(`/api/posts/${id}`, {
    walletAddress,
    walletSignature
  })
}
