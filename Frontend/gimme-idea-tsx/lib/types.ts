// Shared TypeScript interfaces from API contract

export interface User {
  id: string
  username: string
  email: string
  bio?: string
  avatar?: string
  walletAddress?: string
  chainId?: number
  followersCount?: number
  followingCount?: number
  createdAt: Date
  updatedAt?: Date
}

export interface Project {
  id: string
  userId: string
  user?: User
  title: string
  description: string
  demoUrl?: string
  category: string
  tags: string[]
  bountyAmount: number
  deadline?: Date
  status: "draft" | "published" | "archived"
  viewCount: number
  bookmarkCount: number
  feedbackCount: number
  isBookmarked?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Feedback {
  id: string
  projectId: string
  userId: string
  user?: User
  content: {
    overall: string
    pros: string[]
    cons: string[]
    suggestions: string[]
  }
  status: "pending" | "approved" | "rejected"
  rewardAmount?: number
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: "feedback" | "follow" | "project" | "payment"
  title: string
  message: string
  isRead: boolean
  link?: string
  createdAt: Date
}

export interface Payment {
  id: string
  userId: string
  type: "deposit" | "withdraw" | "reward"
  amount: number
  status: "pending" | "completed" | "failed"
  method?: string
  details?: any
  createdAt: Date
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ProjectFilters {
  page?: number
  limit?: number
  category?: string
  minBounty?: number
  maxBounty?: number
  status?: string
  search?: string
}

export interface ApiConfig {
  baseUrl: string
  endpoints: {
    auth: {
      login: string
      register: string
      forgotPassword: string
    }
    projects: string
    feedback: string
  }
}
