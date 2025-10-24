"use client"

import { useEffect, useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { projectsApi } from "@/lib/api/projects"
import Link from "next/link"

export default function DebugProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await projectsApi.list({ limit: 20 })
      setProjects(response.projects || [])
    } catch (err: any) {
      console.error("Debug: Failed to load projects", err)
      setError(err?.message || "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const testProject = async (id: string) => {
    try {
      const response = await projectsApi.getById(id)
      alert(`✅ Success! Project title: ${response.project.title}`)
    } catch (err: any) {
      alert(`❌ Error: ${err?.message || "Failed to fetch project"}`)
    }
  }

  return (
    <LayoutWrapper>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="glass p-6 rounded-xl border">
          <h1 className="text-2xl font-bold mb-2">🔍 Debug: Projects</h1>
          <p className="text-sm text-muted-foreground mb-4">
            This page helps debug "Project not found" issues
          </p>

          <button
            onClick={loadProjects}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
          >
            Refresh Projects
          </button>
        </div>

        {loading && (
          <div className="glass p-8 rounded-xl border">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        )}

        {error && (
          <div className="glass p-8 rounded-xl border border-destructive bg-destructive/10">
            <p className="text-destructive font-semibold">❌ Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="glass p-6 rounded-xl border space-y-4">
            <h2 className="text-xl font-bold">
              Found {projects.length} project{projects.length !== 1 ? "s" : ""}
            </h2>

            {projects.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <p className="mb-4">No projects in database!</p>
                <p className="text-sm">
                  Try creating a new project at{" "}
                  <Link href="/project/new" className="text-primary underline">
                    /project/new
                  </Link>
                </p>
              </div>
            )}

            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4 border rounded-lg bg-background/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{project.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      ID: <code className="bg-muted px-1 rounded">{project.id}</code>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Category: {project.category} | Views: {project.viewCount}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => testProject(project.id)}
                    className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded text-xs"
                  >
                    Test API Call
                  </button>
                  <Link
                    href={`/project/${project.id}`}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs inline-block"
                  >
                    View Project Page
                  </Link>
                  <a
                    href={`https://gimme-idea.onrender.com/api/projects/${project.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-accent text-accent-foreground rounded text-xs inline-block"
                  >
                    Raw API Response
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}
