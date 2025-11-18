/**
 * TEMPLATE: Updated PostCard Component
 * Copy this to: components/post-card.tsx
 *
 * Changes:
 * - Updated prop names to match GMI-BE response format
 * - short_description → description
 * - image_url → imageUrl
 * - prize_pool_amount → prizePoolAmount (in USDC, not SOL)
 * - comment_count → commentsCount
 */

"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PostCardProps {
  id: string
  title: string
  description: string // Changed from short_description
  imageUrl?: string // Changed from image_url
  category: string
  prizePoolAmount?: number // Changed from prize_pool_amount, now in USDC
  commentsCount?: number // Changed from comment_count
}

export function PostCard({
  id,
  title,
  description,
  imageUrl,
  category,
  prizePoolAmount,
  commentsCount = 0,
}: PostCardProps) {
  return (
    <Link href={`/post/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {imageUrl && (
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="w-full aspect-video object-cover"
          />
        )}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          <div className="flex justify-between items-center pt-2">
            <Badge>{category}</Badge>
            <div className="flex gap-3 text-xs text-muted-foreground">
              {prizePoolAmount && prizePoolAmount > 0 && (
                <span>💰 ${prizePoolAmount} USDC</span>
              )}
              <span>💬 {commentsCount}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
