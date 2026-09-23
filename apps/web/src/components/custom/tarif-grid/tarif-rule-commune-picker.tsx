"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"
import { rememberCommuneName, getCommuneName } from "./commune-name-cache"

interface CommuneSuggestion {
  nom: string
  code: string
}

interface TarifRuleCommunePickerProps {
  selectedCodes: string[]
  onChange: (codes: string[]) => void
}

/** Autocomplete against the free, keyless geo.api.gouv.fr — called directly client-side, never
 * proxied through our own API since it needs no auth and no server logic. */
export function TarifRuleCommunePicker({ selectedCodes, onChange }: TarifRuleCommunePickerProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<CommuneSuggestion[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code&limit=10`, {
        signal: controller.signal,
      })
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

  function addCommune(commune: CommuneSuggestion) {
    rememberCommuneName(commune.code, commune.nom)
    if (!selectedCodes.includes(commune.code)) {
      onChange([...selectedCodes, commune.code])
    }
    setQuery("")
    setSuggestions([])
    setOpen(false)
  }

  function removeCommune(code: string) {
    onChange(selectedCodes.filter((c) => c !== code))
  }

  return (
    <div className="space-y-2">
      {selectedCodes.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedCodes.map((code) => (
            <Badge key={code} variant="secondary" className="gap-1">
              {getCommuneName(code) ?? code}
              <button
                type="button"
                onClick={() => removeCommune(code)}
                className="ml-0.5 rounded-full hover:bg-black/10"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Input
            placeholder="Rechercher une commune..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-1"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {suggestions.map((commune) => (
            <button
              key={commune.code}
              type="button"
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
              onClick={() => addCommune(commune)}
            >
              <span>{commune.nom}</span>
              <span className="text-xs text-muted-foreground">{commune.code}</span>
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}
