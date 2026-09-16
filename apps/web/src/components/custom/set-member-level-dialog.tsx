"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLevelCategories } from "@/hooks/use-club-level-queries"
import { useSetMemberLevel } from "@/hooks/use-club-level-mutations"
import type { LevelSport } from "@/types/club-level"

interface SetMemberLevelDialogProps {
  organizationId: string
  userId: string
  currentSport?: LevelSport | null
  currentSkillLevel?: string | null
  currentVerified?: boolean | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SetMemberLevelDialog({
  organizationId,
  userId,
  currentSport,
  currentSkillLevel,
  currentVerified,
  open,
  onOpenChange,
}: SetMemberLevelDialogProps) {
  const [sport, setSport] = useState<LevelSport>(currentSport ?? "tennis")
  const [skillLevel, setSkillLevel] = useState(currentSkillLevel ?? "")
  const [verified, setVerified] = useState(!!currentVerified)

  useEffect(() => {
    if (!open) return
    setSport(currentSport ?? "tennis")
    setSkillLevel(currentSkillLevel ?? "")
    setVerified(!!currentVerified)
  }, [open, currentSport, currentSkillLevel, currentVerified])

  const { data: categories } = useLevelCategories(organizationId, sport)
  const setMemberLevel = useSetMemberLevel()

  function handleSubmit() {
    if (!skillLevel) return
    setMemberLevel.mutate(
      { organizationId, userId, sport, skillLevel, verified },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le niveau</DialogTitle>
          <DialogDescription>
            Échelle FFT/padel intégrée, ou l&apos;une des catégories propres au club.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Sport</Label>
            <Select
              value={sport}
              onValueChange={(v: LevelSport) => {
                setSport(v)
                setSkillLevel("")
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="padel">Padel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Niveau</Label>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un niveau" />
              </SelectTrigger>
              <SelectContent>
                {categories?.custom.length ? (
                  <>
                    {categories.custom.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </>
                ) : null}
                {categories?.builtin.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="level-verified"
              checked={verified}
              onCheckedChange={(checked) => setVerified(checked === true)}
            />
            <Label htmlFor="level-verified" className="font-normal">
              Vérifié par le club
            </Label>
          </div>
        </div>

        {setMemberLevel.isError ? (
          <p className="text-sm text-destructive">{setMemberLevel.error.message}</p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!skillLevel || setMemberLevel.isPending}>
            {setMemberLevel.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
