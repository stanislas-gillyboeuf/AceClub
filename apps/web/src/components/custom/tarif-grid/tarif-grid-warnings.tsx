import { AlertTriangle } from "lucide-react"
import type { TarifGridWarning } from "@/types/tarif-grid"

/** Non-blocking configuration warnings, e.g. an age gap or a rule with no condition. */
export function TarifGridWarnings({ warnings }: { warnings: TarifGridWarning[] }) {
  if (warnings.length === 0) return null
  return (
    <div className="space-y-1.5 rounded-md border border-amber-300 bg-amber-50 p-3">
      {warnings.map((warning, i) => (
        <p key={i} className="flex items-start gap-1.5 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {warning.message}
        </p>
      ))}
    </div>
  )
}
