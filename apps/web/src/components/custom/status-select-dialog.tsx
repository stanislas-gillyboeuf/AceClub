"use client"

import { useState, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function StatusSelectDialog<T extends string>({
  open,
  onOpenChange,
  title,
  description,
  label = "Nouveau statut",
  initialValue,
  options,
  isPending = false,
  submitLabel = "Mettre à jour",
  pendingLabel = "Mise à jour...",
  onSubmit,
  footerExtra,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description: ReactNode
  label?: string
  initialValue: T
  options: { value: T; label: string }[]
  isPending?: boolean
  submitLabel?: string
  pendingLabel?: string
  onSubmit: (value: T) => void
  footerExtra?: ReactNode
}) {
  const [value, setValue] = useState<T>(initialValue)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{label}</Label>
            <Select value={value} onValueChange={(v) => setValue(v as T)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter
          className={
            footerExtra
              ? "flex items-center justify-between sm:justify-between"
              : undefined
          }
        >
          {footerExtra}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => onSubmit(value)}
              disabled={isPending || value === initialValue}
            >
              {isPending ? pendingLabel : submitLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
