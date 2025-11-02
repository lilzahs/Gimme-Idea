"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PostCardProps {
  id: string
  title: string
  short_description: string
  image_url?: string
  category: string
  prize_pool_amount: number
  comment_count?: number
}

export function PostCard({
  id,
  title,
  short_description,
  image_url,
  category,
  prize_pool_amount,
  comment_count = 0,
}: PostCardProps) {
  return (
    <Link href={`/post/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {image_url && (
          <img src={image_url || "/placeholder.svg"} alt={title} className="w-full aspect-video object-cover" />
        )}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{short_description}</p>
          <div className="flex justify-between items-center pt-2">
            <Badge>{category}</Badge>
            <div className="flex gap-3 text-xs text-muted-foreground">
              {prize_pool_amount > 0 && <span>💰 {prize_pool_amount} SOL</span>}
              <span>💬 {comment_count}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
