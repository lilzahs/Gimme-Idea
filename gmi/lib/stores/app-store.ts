import { create } from "zustand"

interface Wallet {
  address: string | null
  type: "phantom" | "solflare" | "lazorkit" | null
  connected: boolean
}

interface UserProfile {
  wallet_address: string
  name: string
  bio: string
  avatar_url?: string
  created_at: string
}

interface Post {
  id: string
  wallet_address: string
  title: string
  description: string
  short_description: string
  image_url?: string
  project_link: string
  category: string
  prize_pool_amount: number
  prize_pool_count: number
  ends_at?: string
  escrow_locked: boolean
  created_at: string
}

interface AppState {
  // Access
  hasAccess: boolean
  setHasAccess: (value: boolean) => void

  // Wallet
  wallet: Wallet
  setWallet: (wallet: Wallet) => void
  disconnectWallet: () => void

  // User Profile
  userProfile: UserProfile | null
  setUserProfile: (profile: UserProfile | null) => void

  // Posts
  posts: Post[]
  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  currentPost: Post | null
  setCurrentPost: (post: Post | null) => void

  // UI
  loading: boolean
  setLoading: (value: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Access
  hasAccess: false,
  setHasAccess: (value) => set({ hasAccess: value }),

  // Wallet
  wallet: { address: null, type: null, connected: false },
  setWallet: (wallet) => set({ wallet }),
  disconnectWallet: () => set({ wallet: { address: null, type: null, connected: false } }),

  // User Profile
  userProfile: null,
  setUserProfile: (profile) => set({ userProfile: profile }),

  // Posts
  posts: [],
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  currentPost: null,
  setCurrentPost: (post) => set({ currentPost: post }),

  // UI
  loading: false,
  setLoading: (value) => set({ loading: value }),
}))
