"use client"

import { useRouter } from "next/navigation"
import MatrixBackground from "@/components/matrix-background"
import Header from "@/components/layout/header"
import ProtectedRoute from "@/components/protected-route"
import ProjectForm from "@/components/forms/project-form"
import { useProjectStore } from "@/lib/stores/project-store"
import { toast } from "sonner"

export default function NewProjectPage() {
  const router = useRouter()
  const { createProject } = useProjectStore()

  const handleSubmit = async (data: any) => {
    try {
      const project = await createProject(data)
      toast.success("Project created successfully!")
      router.push(`/project/${project.id}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to create project")
      throw error
    }
  }

  return (
    <ProtectedRoute>
      <MatrixBackground />
      <Header />

      <div className="relative z-10 min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Submit Your Project</h1>
            <p className="text-gray text-lg">Share your idea and get valuable feedback from the community</p>
          </div>

          <div className="bg-card rounded-lg p-8 border-2 border-primary/20">
            <ProjectForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
