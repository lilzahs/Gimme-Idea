/**
 * Post Actions
 * Client-side actions for post management
 */

import {
  getPosts as apiGetPosts,
  getPost as apiGetPost,
  createPost as apiCreatePost,
  updatePost as apiUpdatePost,
  deletePost as apiDeletePost,
  type CreatePostInput,
  type UpdatePostInput,
  type Post
} from '../api/posts.api'

/**
 * Get all posts with optional filters
 */
export async function getPosts(params?: {
  category?: string
  walletAddress?: string
  page?: number
  limit?: number
}) {
  const response = await apiGetPosts(params)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get posts')
  }

  return response.data
}

/**
 * Get posts by wallet address (user's posts)
 */
export async function getUserPosts(walletAddress: string) {
  const response = await apiGetPosts({ walletAddress })

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get user posts')
  }

  return response.data.posts
}

/**
 * Get single post by ID
 */
export async function getPost(id: string) {
  const response = await apiGetPost(id)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get post')
  }

  return response.data
}

/**
 * Create new post
 */
export async function createPost(
  input: CreatePostInput,
  walletAddress: string,
  walletSignature: string,
  message?: string
) {
  const response = await apiCreatePost(input, walletAddress, walletSignature, message)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create post')
  }

  return response.data
}

/**
 * Update post
 */
export async function updatePost(
  id: string,
  input: UpdatePostInput,
  walletAddress: string,
  walletSignature: string
) {
  const response = await apiUpdatePost(id, input, walletAddress, walletSignature)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update post')
  }

  return response.data
}

/**
 * Delete post
 */
export async function deletePost(
  id: string,
  walletAddress: string,
  walletSignature: string
) {
  const response = await apiDeletePost(id, walletAddress, walletSignature)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to delete post')
  }

  return response.data
}

// Re-export types
export type { CreatePostInput, UpdatePostInput, Post }
