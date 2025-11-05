import { Router, Response } from 'express'
import { AuthRequest, CreateCommentInput } from '../types'
import { authMiddleware } from '../middleware/auth.middleware'
import prisma from '../config/database'

const router = Router({ mergeParams: true })

/**
 * POST /api/posts/:postId/comments
 * Add comment to post
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params
    const { content, parentId }: CreateCommentInput = req.body

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content required' })
    }

    if (!req.wallet) {
      return res.status(401).json({ error: 'Wallet not authenticated' })
    }

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // If replying to comment, check parent exists
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } })
      if (!parent) {
        return res.status(404).json({ error: 'Parent comment not found' })
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        postId,
        walletId: req.wallet.id,
        content: content.trim(),
        parentId: parentId || null
      },
      include: {
        wallet: {
          select: {
            address: true,
            type: true
          }
        }
      }
    })

    // Update post comment count (only for top-level comments)
    if (!parentId) {
      await prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } }
      })
    }

    res.status(201).json({ comment })
  } catch (error) {
    console.error('[Comments] Create error:', error)
    res.status(500).json({ error: 'Failed to create comment' })
  }
})

/**
 * GET /api/posts/:postId/comments
 * Get all comments for a post
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null // Only top-level comments
      },
      include: {
        wallet: {
          select: {
            address: true,
            type: true
          }
        },
        replies: {
          include: {
            wallet: {
              select: {
                address: true,
                type: true
              }
            },
            _count: {
              select: {
                tips: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        ranking: true,
        _count: {
          select: {
            tips: true,
            replies: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ comments })
  } catch (error) {
    console.error('[Comments] Get error:', error)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

/**
 * DELETE /api/comments/:id
 * Delete comment (owner only)
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    if (!req.wallet) {
      return res.status(401).json({ error: 'Wallet not authenticated' })
    }

    // Check ownership
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        wallet: true,
        ranking: true
      }
    })

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    if (comment.wallet.address !== req.walletAddress) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' })
    }

    // Don't allow deletion if comment has ranking
    if (comment.ranking) {
      return res.status(400).json({
        error: 'Cannot delete comment with prize ranking'
      })
    }

    // Delete comment (will cascade to replies)
    await prisma.comment.delete({ where: { id } })

    // Update post comment count if top-level comment
    if (!comment.parentId) {
      await prisma.post.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } }
      })
    }

    res.json({ success: true, message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('[Comments] Delete error:', error)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
})

export default router
