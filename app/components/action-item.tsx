"use client"

import { CheckCircle } from "lucide-react"
import { useState } from "react"

interface ActionItemProps {
  action: string
  index: number
}

export default function ActionItem({ action, index }: ActionItemProps) {
  const [isCompleted, setIsCompleted] = useState(false)

  return (
    <div 
      className="flex items-start gap-4 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer group"
      onClick={() => setIsCompleted(!isCompleted)}
    >
      <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-sm text-white flex-shrink-0">
        {isCompleted ? <CheckCircle className="w-4 h-4 text-green-400" /> : index + 1}
      </span>
      <span className={`text-gray-400 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
        {action}
      </span>
    </div>
  )
} 