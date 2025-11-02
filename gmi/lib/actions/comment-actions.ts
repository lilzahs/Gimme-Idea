"use server"

import { getSupabaseServiceRole } from "@/lib/supabase/server"

export async function getComments(postId: string) {
  const supabase = await getSupabaseServiceRole()

  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("[v0] Error fetching comments:", error)
    return []
  }
}

export async function createComment(postId: string, walletAddress: string, content: string) {
  const supabase = await getSupabaseServiceRole()

  try {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        wallet_address: walletAddress,
        content: content,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("[v0] Error creating comment:", error)
    throw error
  }
}
