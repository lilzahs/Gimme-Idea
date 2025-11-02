"use server"

import { getSupabaseServiceRole } from "@/lib/supabase/server"

export interface PrizeDistribution {
  rank: number
  amount: number
  winner_wallet?: string
  comment_id?: string
  tx_signature?: string
  claimed?: boolean
}

export interface PrizeWinner {
  rank: number
  comment_id: string
  wallet_address: string
  amount: number
}

/**
 * Create equal prize distribution for a post
 * Divides prize pool equally among all winners
 */
export async function createEqualPrizeDistribution(postId: string) {
  const supabase = await getSupabaseServiceRole()

  try {
    const { error } = await supabase.rpc("create_equal_prize_distribution", {
      p_post_id: postId,
    })

    if (error) {
      console.error("[Prize] Error creating equal distribution:", error)
      throw new Error("Failed to create prize distribution")
    }

    return { success: true }
  } catch (error) {
    console.error("[Prize] Unexpected error:", error)
    throw error
  }
}

/**
 * Create custom prize distribution with percentages
 * Example: [50, 30, 20] for 1st: 50%, 2nd: 30%, 3rd: 20%
 */
export async function createCustomPrizeDistribution(postId: string, percentages: number[]) {
  const supabase = await getSupabaseServiceRole()

  try {
    // Validate percentages
    const sum = percentages.reduce((a, b) => a + b, 0)
    if (Math.abs(sum - 100) > 0.01) {
      throw new Error("Percentages must sum to 100")
    }

    const { error } = await supabase.rpc("create_custom_prize_distribution", {
      p_post_id: postId,
      p_percentages: percentages,
    })

    if (error) {
      console.error("[Prize] Error creating custom distribution:", error)
      throw new Error("Failed to create prize distribution")
    }

    return { success: true }
  } catch (error) {
    console.error("[Prize] Unexpected error:", error)
    throw error
  }
}

/**
 * Get prize distribution template for a post
 */
export async function getPrizeDistribution(postId: string): Promise<PrizeDistribution[]> {
  const supabase = await getSupabaseServiceRole()

  try {
    const { data, error } = await supabase
      .from("prize_distributions")
      .select("*")
      .eq("post_id", postId)
      .order("rank", { ascending: true })

    if (error) {
      console.error("[Prize] Error fetching distribution:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[Prize] Unexpected error:", error)
    return []
  }
}

/**
 * Calculate winners based on feedback rankings
 */
export async function calculatePrizeWinners(postId: string): Promise<PrizeWinner[]> {
  const supabase = await getSupabaseServiceRole()

  try {
    const { data, error } = await supabase.rpc("calculate_prize_winners", {
      p_post_id: postId,
    })

    if (error) {
      console.error("[Prize] Error calculating winners:", error)
      throw new Error("Failed to calculate winners")
    }

    return data || []
  } catch (error) {
    console.error("[Prize] Unexpected error:", error)
    throw error
  }
}

/**
 * Set feedback rankings for a post (done by post creator)
 */
export async function setFeedbackRankings(
  postId: string,
  rankings: { rank: number; commentId: string }[],
  creatorWallet: string,
) {
  const supabase = await getSupabaseServiceRole()

  try {
    // Verify the caller is the post creator
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("wallet_address, escrow_locked")
      .eq("id", postId)
      .single()

    if (postError || !post) {
      throw new Error("Post not found")
    }

    if (post.wallet_address !== creatorWallet) {
      throw new Error("Only post creator can set rankings")
    }

    if (!post.escrow_locked) {
      throw new Error("Escrow must be locked before setting rankings")
    }

    // Get prize distribution to validate ranks
    const distribution = await getPrizeDistribution(postId)
    const validRanks = distribution.map((d) => d.rank)

    // Validate all ranks are valid
    for (const ranking of rankings) {
      if (!validRanks.includes(ranking.rank)) {
        throw new Error(`Invalid rank: ${ranking.rank}`)
      }
    }

    // Get comment amounts from distribution
    const rankingsWithAmounts = await Promise.all(
      rankings.map(async (r) => {
        const dist = distribution.find((d) => d.rank === r.rank)
        return {
          post_id: postId,
          comment_id: r.commentId,
          rank: r.rank,
          amount: dist?.amount || 0,
        }
      }),
    )

    // Delete existing rankings for this post
    await supabase.from("feedback_rankings").delete().eq("post_id", postId)

    // Insert new rankings
    const { error: insertError } = await supabase.from("feedback_rankings").insert(rankingsWithAmounts)

    if (insertError) {
      console.error("[Prize] Error setting rankings:", insertError)
      throw new Error("Failed to set rankings")
    }

    return { success: true }
  } catch (error) {
    console.error("[Prize] Unexpected error:", error)
    throw error
  }
}

/**
 * Record a prize claim
 */
export async function recordPrizeClaim(
  prizeDistributionId: string,
  postId: string,
  winnerWallet: string,
  amount: number,
  txSignature: string,
) {
  const supabase = await getSupabaseServiceRole()

  try {
    const { data, error } = await supabase
      .from("prize_claims")
      .insert({
        prize_distribution_id: prizeDistributionId,
        post_id: postId,
        winner_wallet: winnerWallet,
        amount,
        tx_signature: txSignature,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("[Prize] Error recording claim:", error)
      throw new Error("Failed to record prize claim")
    }

    return data
  } catch (error) {
    console.error("[Prize] Unexpected error:", error)
    throw error
  }
}

/**
 * Confirm a prize claim (after blockchain confirmation)
 */
export async function confirmPrizeClaim(claimId: string) {
  const supabase = await getSupabaseServiceRole()

  try {
    const { error } = await supabase
      .from("prize_claims")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", claimId)

    if (error) {
      console.error("[Prize] Error confirming claim:", error)
      throw new Error("Failed to confirm prize claim")
    }

    return { success: true }
  } catch (error) {
    console.error("[Prize] Unexpected error:", error)
    throw error
  }
}

/**
 * Mark all prizes as distributed for a post
 */
export async function markPrizesDistributed(postId: string, txSignature: string) {
  const supabase = await getSupabaseServiceRole()

  try {
    const { error } = await supabase.rpc("mark_prizes_distributed", {
      p_post_id: postId,
      p_tx_signature: txSignature,
    })

    if (error) {
      console.error("[Prize] Error marking distributed:", error)
      throw new Error("Failed to mark prizes as distributed")
    }

    return { success: true }
  } catch (error) {
    console.error("[Prize] Unexpected error:", error)
    throw error
  }
}

/**
 * Get prize claims for a user
 */
export async function getUserPrizeClaims(walletAddress: string) {
  const supabase = await getSupabaseServiceRole()

  try {
    const { data, error } = await supabase
      .from("prize_claims")
      .select(
        `
        *,
        posts (
          title,
          image_url
        )
      `,
      )
      .eq("winner_wallet", walletAddress)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[Prize] Error fetching user claims:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[Prize] Unexpected error:", error)
    return []
  }
}

/**
 * Get prize statistics for a post
 */
export async function getPostPrizeStats(postId: string) {
  const supabase = await getSupabaseServiceRole()

  try {
    const { data: post } = await supabase
      .from("posts")
      .select("prize_pool_amount, prize_pool_count, prize_distributed, escrow_locked")
      .eq("id", postId)
      .single()

    const { data: claims } = await supabase
      .from("prize_claims")
      .select("amount, status")
      .eq("post_id", postId)

    const confirmedClaims = claims?.filter((c) => c.status === "confirmed") || []
    const totalDistributed = confirmedClaims.reduce((sum, c) => sum + Number(c.amount), 0)

    return {
      totalPool: Number(post?.prize_pool_amount || 0),
      winnerCount: post?.prize_pool_count || 0,
      distributed: post?.prize_distributed || false,
      escrowLocked: post?.escrow_locked || false,
      totalDistributed,
      claimCount: claims?.length || 0,
      confirmedClaimCount: confirmedClaims.length,
    }
  } catch (error) {
    console.error("[Prize] Error fetching stats:", error)
    return null
  }
}
