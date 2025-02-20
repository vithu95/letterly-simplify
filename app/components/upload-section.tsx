"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Loader2 } from "lucide-react"
import { LanguageSelector, type Language } from "./language-selector"
import type { AnalysisResult } from "@/app/types"

interface UploadSectionProps {
  onResult: (result: AnalysisResult) => void
}

export default function UploadSection({ onResult }: UploadSectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<Language>('english')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setIsLoading(true)
      setError(null)
      const file = acceptedFiles[0]
      // Check if file type is supported
      const supportedTypes = ['image/jpeg', 'image/png','image/heic','image/heif', 'application/pdf']
      if (!supportedTypes.includes(file.type)) {
        setError('Unsupported file type. Please upload a PDF, PNG, or JPEG file.')
        setIsLoading(false)
        return
      }

      const formData = new FormData()
      formData.append("file", file)

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to process image")
        }

        const result = await response.json()
        onResult(result)
      } catch (error) {
        console.error("Error uploading file:", error)
        setError(error instanceof Error ? error.message : "Failed to process the file")
      } finally {
        setIsLoading(false)
      }
    },
    [onResult]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif']
    },
    maxFiles: 1,
    disabled: isLoading
  })

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-white mb-4">Upload Document</h2>
      <LanguageSelector 
        selectedLanguage={language}
        onLanguageSelect={setLanguage}
      />
      <div
        {...getRootProps()}
        className={`border-2 border-dashed border-gray-600 rounded-lg p-8 h-[300px] flex flex-col items-center justify-center cursor-pointer transition-colors
          ${isLoading ? "opacity-50" : ""}
          ${isDragActive ? "border-white bg-white/5" : "hover:border-gray-500 hover:bg-white/5"}
          ${error ? "border-red-500" : ""}`}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <Loader2 className="w-12 h-12 text-gray-400 mb-4 animate-spin" />
        ) : (
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
        )}
        <p className="text-gray-400 text-center mb-2">
          {isLoading
            ? "Processing your document..."
            : "Drop your letter here or click to upload"}
        </p>
        <p className="text-gray-500 text-sm">Support for PDF, PNG, JPEG, and HEIC files</p>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>
    </div>
  )
}

