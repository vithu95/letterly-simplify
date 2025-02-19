"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import UploadSection from "./components/upload-section"
import Summary from "./components/summary"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import type { Language } from "./components/summary"
import type { AnalysisResult } from "./types"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleResult = (data: AnalysisResult) => {
    if (data.error) {
      setError(data.error)
      setResult(null)
    } else {
      setResult(data)
      setError(null)
    }
  }

  const handleLanguageChange = async (newLanguage: Language, ocrText: string) => {
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: ocrText,
          language: newLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to translate")
      }

      const data = await response.json()
      handleResult(data)
    } catch (error) {
      console.error("Error changing language:", error)
    }
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen">
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/10 hover:bg-white/20"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-foreground" />
          ) : (
            <Moon className="h-5 w-5 text-foreground" />
          )}
        </Button>
      </div>

      {error && (
        <div className="absolute top-4 left-4 bg-destructive/10 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div 
            className="h-screen flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <UploadSection onResult={handleResult} />
          </motion.div>
        ) : (
          <motion.div 
            className="min-h-screen p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-5xl mx-auto pt-16">
              <Summary result={result} onLanguageChange={handleLanguageChange} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

