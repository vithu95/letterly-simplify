"use client"

import { Info, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ActionItem from "./action-item"

interface SummaryProps {
  result: {
    summary: string
    actions: string[]
    ocrText: string
  } | null
}

export default function Summary({ result }: SummaryProps) {
  return (
    <AnimatePresence mode="wait">
      {result && (
        <motion.div 
          className="w-full space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="text-center mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">Letter Analysis</h1>
          </motion.div>
          
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
        </motion.div>
      )}
    </AnimatePresence>
  )
} 