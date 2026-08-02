"use client"

import { useMutation } from "@tanstack/react-query"
import { analysisApi } from "@/lib/sdk"
import type { ReportData } from "@/types/report"
import type { ApiErrorInfo } from "@/types/api"

/**
 * Uploads a real file and runs it through the actual backend audit pipeline
 * (POST /api/upload → POST /api/analyze/:id) — not a scripted demo. Two
 * network calls collapsed into one mutation so the UI only has to track a
 * single pending/success/error state for "run verification."
 */
export function useRunVerification() {
  return useMutation<ReportData, ApiErrorInfo, File>({
    mutationFn: async (file: File) => {
      const uploadResult = await analysisApi.uploadDocument(file)
      if (!uploadResult.ok) throw uploadResult.error

      const analyzeResult = await analysisApi.analyzeDocument(uploadResult.data.documentId)
      if (!analyzeResult.ok) throw analyzeResult.error

      return analyzeResult.data.report
    },
  })
}
