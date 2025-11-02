"use server"

import { getSupabaseServiceRole } from "@/lib/supabase/server"
import { headers } from "next/headers"

interface ViewData {
  postId: string
  viewerWallet?: string
}

/**
 * Track a post view with deduplication
 * Returns true if view was counted, false if deduplicated
 */
export async function trackPostView(data: ViewData): Promise<boolean> {
  const supabase = await getSupabaseServiceRole()

  try {
    // Get IP address from headers
    const headersList = await headers()
    const forwarded = headersList.get("x-forwarded-for")
    const realIp = headersList.get("x-real-ip")
    const viewerIp = forwarded?.split(",")[0] || realIp || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Check if we should count this view (24h deduplication)
    const { data: shouldCount, error: checkError } = await supabase.rpc("should_count_view", {
      p_post_id: data.postId,
      p_viewer_ip: viewerIp,
      p_viewer_wallet: data.viewerWallet || null,
    })

    if (checkError) {
      console.error("[View Tracking] Error checking view eligibility:", checkError)
      // If check fails, we still record the view
    }

    // If shouldCount is false, skip recording
    if (shouldCount === false) {
      return false
    }

    // Record the view
    const { error: insertError } = await supabase.from("post_views").insert({
      post_id: data.postId,
      viewer_wallet: data.viewerWallet || null,
      viewer_ip: viewerIp,
      user_agent: userAgent,
    })

    if (insertError) {
      console.error("[View Tracking] Error recording view:", insertError)
      return false
    }

    return true
  } catch (error) {
    console.error("[View Tracking] Unexpected error:", error)
    return false
  }
}

/**
 * Get view count for a specific post
 */
export async function getPostViewCount(postId: string): Promise<number> {
  const supabase = await getSupabaseServiceRole()

  try {
    const { data, error } = await supabase.from("posts").select("view_count").eq("id", postId).single()

    if (error) {
      console.error("[View Tracking] Error fetching view count:", error)
      return 0
    }

    return data?.view_count || 0
  } catch (error) {
    console.error("[View Tracking] Unexpected error:", error)
    return 0
  }
}

/**
 * Get detailed view analytics for a post
 */
export async function getPostViewAnalytics(postId: string) {
  const supabase = await getSupabaseServiceRole()

  try {
    // Get total views
    const { count: totalViews, error: countError } = await supabase
      .from("post_views")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)

    if (countError) throw countError

    // Get unique viewers (by wallet)
    const { data: uniqueWallets, error: walletsError } = await supabase
      .from("post_views")
      .select("viewer_wallet")
      .eq("post_id", postId)
      .not("viewer_wallet", "is", null)

    if (walletsError) throw walletsError

    const uniqueViewers = new Set(uniqueWallets?.map((v) => v.viewer_wallet)).size

    // Get views in last 24h
    const { count: recentViews, error: recentError } = await supabase
      .from("post_views")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (recentError) throw recentError

    return {
      totalViews: totalViews || 0,
      uniqueViewers,
      recentViews: recentViews || 0,
    }
  } catch (error) {
    console.error("[View Tracking] Error fetching analytics:", error)
    return {
      totalViews: 0,
      uniqueViewers: 0,
      recentViews: 0,
    }
  }
}

/**
 * Get trending posts based on view velocity
 */
export async function getTrendingPosts(limit: number = 10) {
  const supabase = await getSupabaseServiceRole()

  try {
    // Get posts with most views in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from("post_views")
      .select("post_id, posts!inner(*)")
      .gte("created_at", sevenDaysAgo)

    if (error) throw error

    // Count views per post
    const viewCounts = new Map<string, number>()
    data?.forEach((view) => {
      const count = viewCounts.get(view.post_id) || 0
      viewCounts.set(view.post_id, count + 1)
    })

    // Sort by view count and get top posts
    const sortedPostIds = Array.from(viewCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map((entry) => entry[0])

    // Fetch full post data
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .in("id", sortedPostIds)

    if (postsError) throw postsError

    return posts || []
  } catch (error) {
    console.error("[View Tracking] Error fetching trending posts:", error)
    return []
  }
}
