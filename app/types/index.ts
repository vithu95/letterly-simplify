export interface AnalysisResult {
  success: boolean
  summary: string
  actions: string[]
  ocrText: string
}

export interface ApiResponse {
  error?: string
  success?: boolean
  summary?: string
  actions?: string[]
  ocrText?: string
} 