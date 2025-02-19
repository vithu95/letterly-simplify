"use client"

import { Info, CheckCircle } from "lucide-react"
import type { AnalysisResult } from "@/app/types"
import ActionItem from "./action-item"

interface AnalysisResultsProps {
  result: AnalysisResult | null
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const getStatusIcon = () => {
    if (!result) return <Info className="w-8 h-8 text-gray-400 mb-4" />
    return <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-white mb-4">Analysis Results</h2>
      
      {!result ? (
        <div className="border border-white/10 bg-white/5 rounded-xl p-8 h-[300px] flex flex-col items-center justify-center">
          {getStatusIcon()}
          <p className="text-gray-400">Waiting for document...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-white/10 bg-white/5 rounded-xl p-6">
            <h3 className="text-white font-medium mb-3">Summary:</h3>
            <p className="text-gray-400 leading-relaxed">{result.summary}</p>
          </div>
          
          <div className="border border-white/10 bg-white/5 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">Actions to Take:</h3>
            <div className="space-y-3">
              {result.actions.map((action, index) => (
                <ActionItem 
                  key={index}
                  action={action}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

