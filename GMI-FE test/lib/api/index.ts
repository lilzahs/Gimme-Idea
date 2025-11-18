/**
 * GMI-BE API Client
 *
 * Centralized API service for connecting Frontend with Backend
 */

// Export all API services
export * from './client'
export * from './posts.api'
export * from './comments.api'
export * from './wallet.api'
export * from './tips.api'
export * from './rankings.api'
export * from './prizes.api'
export * from './upload.api'

// Re-export for convenience
import * as PostsAPI from './posts.api'
import * as CommentsAPI from './comments.api'
import * as WalletAPI from './wallet.api'
import * as TipsAPI from './tips.api'
import * as RankingsAPI from './rankings.api'
import * as PrizesAPI from './prizes.api'
import * as UploadAPI from './upload.api'

export const API = {
  Posts: PostsAPI,
  Comments: CommentsAPI,
  Wallet: WalletAPI,
  Tips: TipsAPI,
  Rankings: RankingsAPI,
  Prizes: PrizesAPI,
  Upload: UploadAPI
}
