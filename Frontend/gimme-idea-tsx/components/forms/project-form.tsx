"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X, Plus } from "lucide-react"
import type { Project } from "@/lib/types"

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be less than 5000 characters"),
  demoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  category: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()).min(1, "Add at least one tag").max(10, "Maximum 10 tags allowed"),
  bountyAmount: z.number().min(0, "Bounty must be at least 0").max(100000, "Bounty must be less than 100,000"),
  deadline: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
})

type ProjectFormData = z.infer<typeof projectSchema>

const CATEGORIES = ["Web App", "Mobile App", "Design", "AI/ML", "Blockchain", "Game", "Tool", "Other"]

interface ProjectFormProps {
  onSubmit: (data: any) => Promise<void>
  initialData?: Partial<Project>
}

export default function ProjectForm({ onSubmit, initialData }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      demoUrl: initialData?.demoUrl || "",
      category: initialData?.category || "",
      tags: initialData?.tags || [],
      bountyAmount: initialData?.bountyAmount || 0,
      deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().split("T")[0] : "",
      status: initialData?.status || "draft",
    },
  })

  const description = watch("description")
  const characterCount = description?.length || 0

  useEffect(() => {
    setValue("tags", tags)
  }, [tags, setValue])

  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const onFormSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      })
    } catch (error) {
      console.error("[v0] Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Project Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register("title")}
          type="text"
          placeholder="Enter your project title..."
          className="w-full bg-input border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white placeholder:text-gray outline-none transition-all"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("description")}
          rows={8}
          placeholder="Describe your project in detail..."
          className="w-full bg-input border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white placeholder:text-gray outline-none transition-all resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          <p className={`text-sm ml-auto ${characterCount < 50 ? "text-red-500" : "text-gray"}`}>
            {characterCount} / 5000 characters
          </p>
        </div>
      </div>

      {/* Demo URL */}
      <div>
        <label className="block text-white font-semibold mb-2">Demo URL</label>
        <input
          {...register("demoUrl")}
          type="url"
          placeholder="https://your-demo-url.com"
          className="w-full bg-input border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white placeholder:text-gray outline-none transition-all"
        />
        {errors.demoUrl && <p className="text-red-500 text-sm mt-1">{errors.demoUrl.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          {...register("category")}
          className="w-full bg-input border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white outline-none transition-all cursor-pointer"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Tags <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add tags (press Enter)"
            className="flex-1 bg-input border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white placeholder:text-gray outline-none transition-all"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!tagInput.trim() || tags.length >= 10}
            className="px-6 py-3 bg-primary text-black rounded font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-input text-primary rounded-full text-sm flex items-center gap-2">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>}
        <p className="text-gray text-sm">Add 1-10 tags to help others find your project</p>
      </div>

      {/* Bounty Amount */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Bounty Amount ($) <span className="text-red-500">*</span>
        </label>
        <input
          {...register("bountyAmount", { valueAsNumber: true })}
          type="number"
          min="0"
          step="1"
          placeholder="0"
          className="w-full bg-input border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white placeholder:text-gray outline-none transition-all"
        />
        {errors.bountyAmount && <p className="text-red-500 text-sm mt-1">{errors.bountyAmount.message}</p>}
        <p className="text-gray text-sm mt-1">Set a bounty to incentivize quality feedback</p>
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-white font-semibold mb-2">Deadline (Optional)</label>
        <input
          {...register("deadline")}
          type="date"
          min={new Date().toISOString().split("T")[0]}
          className="w-full bg-input border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white outline-none transition-all"
        />
        {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>}
      </div>

      {/* Status */}
      <div>
        <label className="block text-white font-semibold mb-2">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          {...register("status")}
          className="w-full bg-input border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white outline-none transition-all cursor-pointer"
        >
          <option value="draft">Draft (not visible to others)</option>
          <option value="published">Published (visible to everyone)</option>
          <option value="archived">Archived (read-only)</option>
        </select>
        {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-primary text-black rounded font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : initialData ? "Update Project" : "Create Project"}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
          className="px-6 py-3 bg-input text-white rounded font-semibold hover:bg-gray/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
