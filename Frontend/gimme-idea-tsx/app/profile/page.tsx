"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MatrixBackground from "@/components/matrix-background"
import Header from "@/components/layout/header"
import ProtectedRoute from "@/components/protected-route"
import { useAuthStore } from "@/lib/stores/auth-store"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { User, Mail, Wallet, Save, Upload } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateProfile } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateProfile(formData)
      toast.success("Profile updated successfully!")
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    try {
      await apiClient.uploadAvatar(file)
      toast.success("Avatar uploaded successfully!")
      // Refresh user data
      const updatedUser = await apiClient.getProfile()
      updateProfile(updatedUser)
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar")
    }
  }

  return (
    <ProtectedRoute>
      <MatrixBackground />
      <Header />

      <div className="relative z-10 min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Profile Settings</h1>
            <p className="text-gray text-lg">Manage your account information</p>
          </div>

          <div className="bg-card rounded-lg p-8 border-2 border-primary/20">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray/20">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center text-primary text-5xl font-bold">
                  {user?.avatar ? (
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user?.username?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-black p-2 rounded-full cursor-pointer hover:shadow-lg transition-all"
                >
                  <Upload size={20} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-gray text-sm">Click the icon to upload a new avatar (max 5MB)</p>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                  <User size={18} />
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!isEditing}
                  className="w-full bg-input border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white placeholder:text-gray outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                  <Mail size={18} />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full bg-input border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white placeholder:text-gray outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-white font-semibold mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-input border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white placeholder:text-gray outline-none transition-all disabled:opacity-50 resize-none"
                />
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                  <Wallet size={18} />
                  Connected Wallet
                </label>
                <div className="w-full bg-input rounded px-4 py-3 text-gray">
                  {user?.walletAddress || "No wallet connected"}
                </div>
                <p className="text-gray text-sm mt-1">
                  Use the "Connect Wallet" button in the header to link your wallet
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                {isEditing ? (
                  <>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 bg-primary text-black rounded font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          username: user?.username || "",
                          email: user?.email || "",
                          bio: user?.bio || "",
                        })
                      }}
                      disabled={isSaving}
                      className="px-6 py-3 bg-input text-white rounded font-semibold hover:bg-gray/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-6 py-3 bg-primary text-black rounded font-semibold hover:shadow-lg transition-all"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
