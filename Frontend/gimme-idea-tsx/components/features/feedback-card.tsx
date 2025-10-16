"use client"

import type { Feedback } from "@/lib/types"
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react"

interface FeedbackCardProps {
  feedback: Feedback
  isOwner: boolean
  onUpdate: () => void
}

export default function FeedbackCard({ feedback, isOwner, onUpdate }: FeedbackCardProps) {
  const getStatusIcon = () => {
    switch (feedback.status) {
      case "approved":
        return <CheckCircle size={16} className="text-green-500" />
      case "rejected":
        return <XCircle size={16} className="text-red-500" />
      default:
        return <Clock size={16} className="text-yellow-500" />
    }
  }

  const getStatusText = () => {
    switch (feedback.status) {
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      default:
        return "Pending"
    }
  }

  return (
    <div className="bg-input rounded-lg p-6 border-2 border-transparent hover:border-primary/50 transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {feedback.user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-white font-semibold">{feedback.user?.username || "Anonymous"}</p>
            <p className="text-gray text-sm flex items-center gap-1">
              <Calendar size={12} />
              {new Date(feedback.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          <span className="text-gray">{getStatusText()}</span>
          {feedback.rewardAmount && <span className="text-primary font-semibold ml-2">${feedback.rewardAmount}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {feedback.content.overall && (
          <div>
            <h4 className="text-primary font-semibold mb-2">Overall</h4>
            <p className="text-white">{feedback.content.overall}</p>
          </div>
        )}

        {feedback.content.pros && feedback.content.pros.length > 0 && (
          <div>
            <h4 className="text-green-500 font-semibold mb-2">Pros</h4>
            <ul className="list-disc list-inside space-y-1">
              {feedback.content.pros.map((pro, index) => (
                <li key={index} className="text-white">
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.content.cons && feedback.content.cons.length > 0 && (
          <div>
            <h4 className="text-red-500 font-semibold mb-2">Cons</h4>
            <ul className="list-disc list-inside space-y-1">
              {feedback.content.cons.map((con, index) => (
                <li key={index} className="text-white">
                  {con}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.content.suggestions && feedback.content.suggestions.length > 0 && (
          <div>
            <h4 className="text-primary font-semibold mb-2">Suggestions</h4>
            <ul className="list-disc list-inside space-y-1">
              {feedback.content.suggestions.map((suggestion, index) => (
                <li key={index} className="text-white">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
