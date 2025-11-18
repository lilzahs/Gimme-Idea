"use server"
import { getSupabaseServer } from "@/lib/supabase/server"

export interface TransactionRecord {
  postId: string
  txSignature: string
  amount: number
  timestamp: string
}

export async function recordTransaction(transaction: TransactionRecord) {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      post_id: transaction.postId,
      tx_signature: transaction.txSignature,
      amount: transaction.amount,
      created_at: transaction.timestamp,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error recording transaction:", error)
    throw new Error("Failed to record transaction")
  }

  return data
}

export async function updatePostWithTransaction(postId: string, txSignature: string) {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("posts")
    .update({
      escrow_locked: true,
      escrow_tx_signature: txSignature,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating post:", error)
    throw new Error("Failed to update post with transaction")
  }

  return data
}

export async function getPostTransactions(postId: string) {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching transactions:", error)
    return []
  }

  return data || []
}
