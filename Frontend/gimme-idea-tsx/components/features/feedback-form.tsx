"use client"

import type React from "react"

import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { Plus, X } from "lucide-react"

interface FeedbackFormProps {
  projectId: string
  onSuccess: () => void
}

export default function FeedbackForm({ projectId, onSuccess }: FeedbackFormProps) {
  const [overall, setOverall] = useState("")
  const [pros, setPros] = useState<string[]>([""])
  const [cons, setCons] = useState<string[]>([""])
  const [suggestions, setSuggestions] = useState<string[]>([""])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addItem = (type: "pros" | "cons" | "suggestions") => {
    if (type === "pros") setPros([...pros, ""])
    if (type === "cons") setCons([...cons, ""])
    if (type === "suggestions") setSuggestions([...suggestions, ""])
  }

  const removeItem = (type: "pros" | "cons" | "suggestions", index: number) => {
    if (type === "pros") setPros(pros.filter((_, i) => i !== index))
    if (type === "cons") setCons(cons.filter((_, i) => i !== index))
    if (type === "suggestions") setSuggestions(suggestions.filter((_, i) => i !== index))
  }

  const updateItem = (type: "pros" | "cons" | "suggestions", index: number, value: string) => {
    if (type === "pros") {
      const newPros = [...pros]
      newPros[index] = value
      setPros(newPros)
    }
    if (type === "cons") {
      const newCons = [...cons]
      newCons[index] = value
      setCons(newCons)
    }
    if (type === "suggestions") {
      const newSuggestions = [...suggestions]
      newSuggestions[index] = value
      setSuggestions(newSuggestions)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!overall.trim()) {
      toast.error("Please provide overall feedback")
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.createFeedback(projectId, {
        overall,
        pros: pros.filter((p) => p.trim()),
        cons: cons.filter((c) => c.trim()),
        suggestions: suggestions.filter((s) => s.trim()),
      })

      toast.success("Feedback submitted successfully!")
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || "Failed to submit feedback")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-input rounded-lg p-6 space-y-6">
      {/* Overall Feedback */}
      <div>
        <label className="block text-white font-semibold mb-2">Overall Feedback *</label>
        <textarea
          value={overall}
          onChange={(e) => setOverall(e.target.value)}
          required
          rows={4}
          placeholder="Share your overall thoughts about this project..."
          className="w-full bg-card border-2 border-transparent focus:border-primary rounded px-4 py-3 text-white placeholder:text-gray outline-none transition-all"
        />
      </div>

      {/* Pros */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-green-500 font-semibold">Pros</label>
          <button
            type="button"
            onClick={() => addItem("pros")}
            className="text-primary hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {pros.map((pro, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={pro}
                onChange={(e) => updateItem("pros", index, e.target.value)}
                placeholder="What did you like?"
                className="flex-1 bg-card border-2 border-transparent focus:border-primary rounded px-4 py-2 text-white placeholder:text-gray outline-none transition-all"
              />
              {pros.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("pros", index)}
                  className="text-gray hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cons */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-red-500 font-semibold">Cons</label>
          <button
            type="button"
            onClick={() => addItem("cons")}
            className="text-primary hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {cons.map((con, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={con}
                onChange={(e) => updateItem("cons", index, e.target.value)}
                placeholder="What could be improved?"
                className="flex-1 bg-card border-2 border-transparent focus:border-primary rounded px-4 py-2 text-white placeholder:text-gray outline-none transition-all"
              />
              {cons.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("cons", index)}
                  className="text-gray hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-primary font-semibold">Suggestions</label>
          <button
            type="button"
            onClick={() => addItem("suggestions")}
            className="text-primary hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={suggestion}
                onChange={(e) => updateItem("suggestions", index, e.target.value)}
                placeholder="Any suggestions for improvement?"
                className="flex-1 bg-card border-2 border-transparent focus:border-primary rounded px-4 py-2 text-white placeholder:text-gray outline-none transition-all"
              />
              {suggestions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem("suggestions", index)}
                  className="text-gray hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-primary text-black rounded font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  )
}
