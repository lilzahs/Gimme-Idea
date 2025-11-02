"use server"

import { getSupabaseServiceRole } from "@/lib/supabase/server"
import { withRateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function createPost(postData: {
  wallet_address: string
  title: string
  description: string
  short_description: string
  image_url: string
  project_link: string
  category: string
  prize_pool_amount: number
  prize_pool_count: number
  ends_at?: string
  escrow_locked: boolean
}) {
  // Apply rate limiting: 5 posts per hour per wallet
  return withRateLimit(
    {
      ...RateLimitPresets.CREATE_POST,
      identifier: `create_post:${postData.wallet_address}`,
    },
    async () => {
      const supabase = await getSupabaseServiceRole()

  const { data, error } = await supabase
    .from("posts")
    .insert({
      wallet_address: postData.wallet_address,
      title: postData.title,
      description: postData.description,
      short_description: postData.short_description,
      image_url: postData.image_url,
      project_link: postData.project_link,
      category: postData.category,
      prize_pool_amount: postData.prize_pool_amount,
      prize_pool_count: postData.prize_pool_count,
      ends_at: postData.ends_at || null,
      escrow_locked: postData.escrow_locked,
    })
    .select()
    .single()

      if (error) {
        console.error("Error creating post:", error)
        throw new Error("Failed to create post")
      }

      return data
    },
  )
}

export async function getUserPosts(walletAddress: string) {
  const supabase = await getSupabaseServiceRole()

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("wallet_address", walletAddress)
    .order("created_at", { ascending: false })

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching posts:", error)
    throw new Error("Failed to fetch posts")
  }

  return data || []
}

export async function getAllPosts(category?: string) {
  const supabase = await getSupabaseServiceRole()

  let query = supabase.from("posts").select("*").order("created_at", { ascending: false })

  if (category && category !== "All") {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching posts:", error)
    throw new Error("Failed to fetch posts")
  }

  return data || []
}
