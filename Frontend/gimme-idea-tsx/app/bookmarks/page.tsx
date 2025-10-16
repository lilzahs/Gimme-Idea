"use client"

import { useEffect, useState } from "react"
import MatrixBackground from "@/components/matrix-background"
import Header from "@/components/layout/header"
import ProtectedRoute from "@/components/protected-route"
import ProjectCard from "@/components/features/project-card"
import { apiClient } from "@/lib/api-client"
import { Loader2, Bookmark } from "lucide-react"
import type { Project } from "@/lib/types"

export default function BookmarksPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBookmarkedProjects()
  }, [])

  const loadBookmarkedProjects = async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.getBookmarkedProjects()
      setProjects(data)
    } catch (error) {
      console.error("[v0] Failed to load bookmarks:", error)
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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">Bookmarked Projects</h1>
            <p className="text-gray text-lg">Projects you've saved for later</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <Bookmark size={64} className="mx-auto text-gray mb-4" />
              <p className="text-gray text-xl">No bookmarked projects yet</p>
              <p className="text-gray mt-2">Start exploring and bookmark projects you like!</p>
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
    </ProtectedRoute>
  )
}
