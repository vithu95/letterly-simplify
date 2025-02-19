export interface AnalysisResult {
  success: boolean
  summary: string
  tamilSummary?: string
  actions: string[]
  tamilActions?: string[]
  ocrText: string
  error?: string
} 