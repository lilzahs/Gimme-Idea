"use client"

import { useState } from "react"
import { useProjectStore } from "@/lib/stores/project-store"
import { Filter, X } from "lucide-react"

const CATEGORIES = ["All", "Web App", "Mobile App", "Design", "AI/ML", "Blockchain", "Game", "Tool", "Other"]

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
]

export default function ProjectFilters() {
  const { filters, setFilters } = useProjectStore()
  const [minBounty, setMinBounty] = useState(filters.minBounty?.toString() || "")
  const [maxBounty, setMaxBounty] = useState(filters.maxBounty?.toString() || "")

  const handleCategoryChange = (category: string) => {
    setFilters({ category: category === "All" ? undefined : category, page: 1 })
  }

  const handleStatusChange = (status: string) => {
    setFilters({ status: status || undefined, page: 1 })
  }

  const handleBountyFilter = () => {
    setFilters({
      minBounty: minBounty ? Number.parseInt(minBounty) : undefined,
      maxBounty: maxBounty ? Number.parseInt(maxBounty) : undefined,
      page: 1,
    })
  }

  const clearFilters = () => {
    setFilters({ category: undefined, minBounty: undefined, maxBounty: undefined, status: undefined, page: 1 })
    setMinBounty("")
    setMaxBounty("")
  }

  const hasActiveFilters = filters.category || filters.minBounty || filters.maxBounty || filters.status

  return (
    <div className="bg-card rounded-lg p-6 border-2 border-primary/20 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <Filter size={20} />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-gray hover:text-primary transition-colors text-sm flex items-center gap-1"
          >
            <X size={16} />
            Clear
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="text-white font-semibold mb-3">Category</h4>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`w-full text-left px-3 py-2 rounded transition-all duration-300 ${
                (category === "All" && !filters.category) || filters.category === category
                  ? "bg-primary text-black font-semibold"
                  : "bg-input text-white hover:bg-primary hover:text-black"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Bounty Range */}
      <div className="mb-6">
        <h4 className="text-white font-semibold mb-3">Bounty Range</h4>
        <div className="space-y-3">
          <input
            type="number"
            placeholder="Min"
            value={minBounty}
            onChange={(e) => setMinBounty(e.target.value)}
            className="w-full bg-input border-none outline-none px-3 py-2 rounded text-white placeholder:text-gray focus:bg-[#3a3a3a]"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxBounty}
            onChange={(e) => setMaxBounty(e.target.value)}
            className="w-full bg-input border-none outline-none px-3 py-2 rounded text-white placeholder:text-gray focus:bg-[#3a3a3a]"
          />
          <button
            onClick={handleBountyFilter}
            className="w-full px-3 py-2 bg-primary text-black rounded font-semibold hover:shadow-lg transition-all"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <h4 className="text-white font-semibold mb-3">Status</h4>
        <select
          value={filters.status || ""}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full bg-input border-none outline-none px-3 py-2 rounded text-white focus:bg-[#3a3a3a] cursor-pointer"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
