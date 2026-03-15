"use client"

import { useState, useCallback, useRef } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"

export interface FFTClub {
  nom: string
  clubId: string
  ville?: string
  distance?: string
  terrainPratiqueLibelle?: string
  pratiques?: string[]
  lat: number
  lng: number
}

export interface BulkImportProgress {
  index: number
  total: number
  clubId: string
  nom: string
  slug?: string
  address?: string | null
  status?: string
  created: number
  errors: number
}

export interface BulkImportError {
  index: number
  clubId: string
  nom: string
  error: string
}

export interface BulkImportResult {
  created: number
  errors: number
}

export type ImportStatus = "idle" | "importing" | "complete" | "error"

export function useBulkImportOrganizations() {
  const [status, setStatus] = useState<ImportStatus>("idle")
  const [progress, setProgress] = useState<BulkImportProgress | null>(null)
  const [total, setTotal] = useState(0)
  const [errors, setErrors] = useState<BulkImportError[]>([])
  const [result, setResult] = useState<BulkImportResult | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const startImport = useCallback(async (clubs: FFTClub[]) => {
    setStatus("importing")
    setProgress(null)
    setTotal(clubs.length)
    setErrors([])
    setResult(null)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch(
        `${API_URL}/api/admin/bulk-create-organizations`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clubs }),
          signal: controller.signal,
        },
      )

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.message || `API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("No response body")

      let buffer = ""
      let currentEvent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()

          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.slice(6).trim()
          } else if (trimmed.startsWith("data:")) {
            const jsonStr = trimmed.slice(5).trim()
            if (!jsonStr) continue

            try {
              const parsed = JSON.parse(jsonStr)

              switch (currentEvent) {
                case "start":
                  setTotal(parsed.total)
                  break
                case "progress":
                  setProgress(parsed)
                  break
                case "error":
                  setErrors((prev) => [
                    ...prev,
                    {
                      index: parsed.index,
                      clubId: parsed.clubId,
                      nom: parsed.nom,
                      error: parsed.error,
                    },
                  ])
                  setProgress((prev) =>
                    prev
                      ? { ...prev, errors: parsed.errors, created: parsed.created }
                      : null,
                  )
                  break
                case "complete":
                  setResult(parsed)
                  setStatus("complete")
                  break
              }
            } catch {
              /* skip malformed JSON */
            }

            currentEvent = ""
          }
        }
      }

      if (status !== "complete") {
        setStatus("complete")
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStatus("idle")
      } else {
        setStatus("error")
      }
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setStatus("idle")
  }, [])

  const reset = useCallback(() => {
    setStatus("idle")
    setProgress(null)
    setTotal(0)
    setErrors([])
    setResult(null)
  }, [])

  return { status, progress, total, errors, result, startImport, cancel, reset }
}
