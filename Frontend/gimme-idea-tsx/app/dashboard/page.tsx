"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MatrixBackground from "@/components/matrix-background"
import Header from "@/components/layout/header"
import ProtectedRoute from "@/components/protected-route"
import ProjectCard from "@/components/features/project-card"
import { useAuthStore } from "@/lib/stores/auth-store"
import { apiClient } from "@/lib/api-client"
import { Loader2, Plus, FolderOpen } from "lucide-react"
import type { Project } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserProjects()
  }, [])

  const loadUserProjects = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getMyProjects()
      setProjects(response.projects || [])
    } catch (error) {
      console.error("[v0] Failed to load projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <MatrixBackground />
      <Header />

      <div className="relative z-10 min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-12">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">My Dashboard</h1>
              <p className="text-gray text-base sm:text-lg">Welcome back, {user?.username}!</p>
            </div>
            <button
              onClick={() => router.push("/project/new")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black rounded font-semibold hover:shadow-lg transition-all whitespace-nowrap"
            >
              <Plus size={20} />
              New Project
            </button>
          </div>

          {/* Projects Section */}
          <div className="bg-card rounded-lg p-8 border-2 border-primary/20">
            <h2 className="text-2xl font-bold text-white mb-6">My Projects</h2>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={48} />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen size={64} className="mx-auto text-gray mb-4" />
                <p className="text-gray text-xl mb-4">No projects yet</p>
                <button
                  onClick={() => router.push("/project/new")}
                  className="px-6 py-3 bg-primary text-black rounded font-semibold hover:shadow-lg transition-all"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
