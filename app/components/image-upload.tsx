"use client"

import type React from "react"

import { useState } from "react"
import { Upload, ImageIcon, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import type { AnalysisResult } from "@/app/types"

export default function ImageUpload({ onResult }: { onResult: (result: AnalysisResult) => void }) {
  const [image, setImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!image) return

    setIsLoading(true)

    const formData = new FormData()
    formData.append("file", image)

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process image")
      }

      const result = await response.json()
      onResult(result)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("An error occurred while processing the image. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex justify-center mb-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            {image ? (
              <Image
                src={URL.createObjectURL(image)}
                alt="Preview"
                width={200}
                height={200}
                className="max-w-full max-h-full"
              />
            ) : (
              <Upload className="w-12 h-12 text-gray-400" />
            )}
          </div>
        </label>
        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
      <div className="flex justify-center gap-4">
        <Button onClick={() => document.getElementById("file-upload")?.click()} disabled={isLoading}>
          <ImageIcon className="mr-2 h-4 w-4" /> Choose Image
        </Button>
        <Button disabled={isLoading}>
          <Camera className="mr-2 h-4 w-4" /> Take Photo
        </Button>
        <Button onClick={handleUpload} disabled={!image || isLoading}>
          <Upload className="mr-2 h-4 w-4" /> {isLoading ? "Processing..." : "Upload"}
        </Button>
      </div>
    </div>
  )
}

