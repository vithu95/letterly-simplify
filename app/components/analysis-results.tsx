"use client"

import { Info, CheckCircle } from "lucide-react"

interface AnalysisResultsProps {
  result: any | null
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
            <p className="text-gray-400 leading-relaxed">
              {result.summary}
            </p>
          </div>
          
          <div className="border border-white/10 bg-white/5 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">Actions to Take:</h3>
            <div className="space-y-3">
              {result.actions.map((action: string, index: number) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-sm text-white flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-400">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

