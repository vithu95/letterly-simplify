"use client"

import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"

export type Language = 'english' | 'tamil'

interface LanguageSelectorProps {
  onLanguageSelect: (language: Language) => void
  selectedLanguage: Language
}

export function LanguageSelector({ onLanguageSelect, selectedLanguage }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Languages className="w-4 h-4" />
        <span>Translate to:</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className={`${
            selectedLanguage === 'english' 
              ? 'bg-white/10 text-white' 
              : 'bg-transparent text-gray-400'
          }`}
          onClick={() => onLanguageSelect('english')}
        >
          English
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`${
            selectedLanguage === 'tamil' 
              ? 'bg-white/10 text-white' 
              : 'bg-transparent text-gray-400'
          }`}
          onClick={() => onLanguageSelect('tamil')}
        >
          தமிழ்
        </Button>
      </div>
    </div>
  )
} 