"use client"

import { motion, AnimatePresence } from "framer-motion"
import ActionItem from "./action-item"
import { LanguageSelector, type Language } from "./language-selector"
import type { ApiResponse } from "@/app/types"
import { useState } from "react"

interface SummaryProps {
  result: ApiResponse | null
  onLanguageChange: (language: Language, ocrText: string) => Promise<void>
}

export default function Summary({ result, onLanguageChange }: SummaryProps) {
  const [language, setLanguage] = useState<Language>('english')

  const handleSelect = async (lang: Language) => {
    if (!result) return
    setLanguage(lang)
    await onLanguageChange(lang, result.ocrText!)
  }
  return (
    <AnimatePresence mode="wait">
      {result?.success && result.summary && result.actions && (
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
          <LanguageSelector selectedLanguage={language} onLanguageSelect={handleSelect} />
          
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