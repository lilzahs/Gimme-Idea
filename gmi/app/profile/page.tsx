"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { useAppStore } from "@/lib/stores/app-store"
import { ArrowLeft } from "lucide-react"
import { updateProfile } from "@/lib/actions/profile-actions"

export default function ProfilePage() {
  const router = useRouter()
  const { wallet, userProfile, setUserProfile } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  })

  useEffect(() => {
    if (!wallet.connected) {
      router.push("/")
    } else if (userProfile) {
      setFormData({
        name: userProfile.name,
        bio: userProfile.bio || "",
      })
    }
  }, [wallet.connected, router, userProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const updatedProfile = await updateProfile(wallet.address!, {
        name: formData.name,
        bio: formData.bio,
      })

      setUserProfile(updatedProfile)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium block mb-2">Wallet Address</label>
              <Input type="text" value={wallet.address || ""} disabled className="bg-muted" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Display Name</label>
              <Input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Bio</label>
              <Textarea
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={4}
              />
            </div>

            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} isLoading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
