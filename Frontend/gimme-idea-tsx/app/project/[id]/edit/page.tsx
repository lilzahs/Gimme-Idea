"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import MatrixBackground from "@/components/matrix-background"
import Header from "@/components/layout/header"
import ProtectedRoute from "@/components/protected-route"
import ProjectForm from "@/components/forms/project-form"
import { useProjectStore } from "@/lib/stores/project-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { currentProject, isLoading, fetchProjectById, updateProject } = useProjectStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId)
    }
  }, [projectId])

  useEffect(() => {
    if (currentProject && user && currentProject.userId !== user.id) {
      toast.error("You don't have permission to edit this project")
      router.push(`/project/${projectId}`)
    }
  }, [currentProject, user])

  const handleSubmit = async (data: any) => {
    try {
      await updateProject(projectId, data)
      toast.success("Project updated successfully!")
      router.push(`/project/${projectId}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to update project")
      throw error
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MatrixBackground />
        <Header />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </ProtectedRoute>
    )
  }

  if (!currentProject) {
    return (
      <ProtectedRoute>
        <MatrixBackground />
        <Header />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl text-white mb-4">Project not found</h1>
            <button
              onClick={() => router.push("/browse")}
              className="px-6 py-3 bg-primary text-black rounded font-semibold hover:shadow-lg transition-all"
            >
              Back to Browse
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <MatrixBackground />
      <Header />

      <div className="relative z-10 min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Edit Project</h1>
            <p className="text-gray text-lg">Update your project details</p>
          </div>

          <div className="bg-card rounded-lg p-8 border-2 border-primary/20">
            <ProjectForm onSubmit={handleSubmit} initialData={currentProject} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
