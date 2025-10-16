"use client"

import Link from "next/link"
import type { Project } from "@/lib/types"
import { Eye, DollarSign, MessageSquare, Bookmark, Calendar } from "lucide-react"

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/project/${project.id}`}>
      <div className="bg-card rounded-lg p-6 border-2 border-transparent hover:border-primary transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white line-clamp-2 flex-1">{project.title}</h3>
          {project.isBookmarked && (
            <Bookmark size={18} className="text-primary flex-shrink-0 ml-2" fill="currentColor" />
          )}
        </div>

        {/* Description */}
        <p className="text-gray text-sm line-clamp-3 mb-4 flex-1">{project.description}</p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 bg-input text-primary rounded text-xs">
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 bg-input text-gray rounded text-xs">+{project.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-gray text-sm pt-4 border-t border-gray/20">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {project.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={14} />
              {project.feedbackCount || 0}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-primary font-semibold">
              <DollarSign size={14} />
              {project.bountyAmount}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1 text-gray text-xs mt-2">
          <Calendar size={12} />
          {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  )
}
