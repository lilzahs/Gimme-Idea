// Zustand store for authentication state

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiClient } from "@/lib/api-client"
import type { User } from "@/lib/types"

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  connectWallet: (walletAddress: string, chainId: number) => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.login(email, password)

          apiClient.setToken(response.token)

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          console.log("[v0] ✅ Login successful")
        } catch (error: any) {
          console.error("[v0] ❌ Login failed:", error)
          set({
            error: error.message || "Login failed",
            isLoading: false,
          })
          throw error
        }
      },

      register: async (email: string, password: string, username: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.register(email, password, username)

          apiClient.setToken(response.token)

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          console.log("[v0] ✅ Registration successful")
        } catch (error: any) {
          console.error("[v0] ❌ Registration failed:", error)
          set({
            error: error.message || "Registration failed",
            isLoading: false,
          })
          throw error
        }
      },

      logout: async () => {
        try {
          await apiClient.logout()
        } catch (error) {
          console.error("[v0] ❌ Logout error:", error)
        } finally {
          apiClient.setToken(null)
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          })
          console.log("[v0] ✅ Logged out")
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null })
        try {
          const updatedUser = await apiClient.updateProfile(data)
          set({
            user: updatedUser,
            isLoading: false,
          })
          console.log("[v0] ✅ Profile updated")
        } catch (error: any) {
          console.error("[v0] ❌ Profile update failed:", error)
          set({
            error: error.message || "Profile update failed",
            isLoading: false,
          })
          throw error
        }
      },

      connectWallet: async (walletAddress: string, chainId: number) => {
        set({ isLoading: true, error: null })
        try {
          const updatedUser = await apiClient.connectWallet(walletAddress, chainId)
          set({
            user: updatedUser,
            isLoading: false,
          })
          console.log("[v0] ✅ Wallet connected")
        } catch (error: any) {
          console.error("[v0] ❌ Wallet connection failed:", error)
          set({
            error: error.message || "Wallet connection failed",
            isLoading: false,
          })
          throw error
        }
      },

      refreshAuth: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return

        try {
          const response = await apiClient.refreshToken(refreshToken)
          apiClient.setToken(response.token)

          set({
            token: response.token,
            refreshToken: response.refreshToken,
          })

          console.log("[v0] ✅ Token refreshed")
        } catch (error) {
          console.error("[v0] ❌ Token refresh failed:", error)
          get().logout()
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
