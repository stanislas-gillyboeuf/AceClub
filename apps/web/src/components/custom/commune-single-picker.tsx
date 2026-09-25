"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"

interface CommuneSuggestion {
  nom: string
  code: string
}

export interface SelectedCommune {
  code: string
  name: string | null
}

interface CommuneSinglePickerProps {
  value: SelectedCommune | null
  onChange: (value: SelectedCommune | null) => void
  disabled?: boolean
}

/** Single-value commune autocomplete against the free, keyless geo.api.gouv.fr. Unlike the
 * multi-select used by pricing rules, a new pick REPLACES the previous one, and the name shown
 * comes from the saved value itself (never from a browser-local cache). */
export function CommuneSinglePicker({ value, onChange, disabled }: CommuneSinglePickerProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<CommuneSuggestion[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      return
    }
    // A 5-digit query is a postal code, anything else a commune name.
    const search = /^\d{5}$/.test(trimmed)
      ? `codePostal=${encodeURIComponent(trimmed)}`
      : `nom=${encodeURIComponent(trimmed)}`
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      fetch(`https://geo.api.gouv.fr/communes?${search}&fields=nom,code&limit=10`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : []))
        .then((data: CommuneSuggestion[]) => {
          setSuggestions(data)
          setOpen(data.length > 0)
        })
        .catch(() => {
          // A failed lookup (offline, API down) just means no suggestions — not a form error.
        })
    }, 250)
    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [query])

  function pick(commune: CommuneSuggestion) {
    onChange({ code: commune.code, name: commune.nom })
    setQuery("")
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          <span>
            {value.name ?? value.code}
            <span className="ml-2 text-xs text-muted-foreground">{value.code}</span>
          </span>
          {!disabled ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-full p-0.5 hover:bg-muted"
              aria-label="Retirer la commune"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Non renseignée</p>
      )}
      {!disabled ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <Input
              placeholder="Rechercher par nom ou code postal..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
            />
          </PopoverAnchor>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-1" onOpenAutoFocus={(e) => e.preventDefault()}>
            {suggestions.map((commune) => (
              <button
                key={commune.code}
                type="button"
                className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                onClick={() => pick(commune)}
              >
                <span>{commune.nom}</span>
                <span className="text-xs text-muted-foreground">{commune.code}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}
