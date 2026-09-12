"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useClubMemberDetail } from "@/hooks/use-club-member-queries"
import { useUpdateClubMemberProfile } from "@/hooks/use-club-member-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function toDateInputValue(dateStr: string | null) {
  if (!dateStr) return ""
  return dateStr.slice(0, 10)
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

export default function ClubMemberDetailPage() {
  const router = useRouter()
  const params = useParams<{ userId: string }>()
  const { organizationId, access } = useClubAdminContext()
  const { data, isLoading } = useClubMemberDetail(organizationId, params.userId)
  const updateProfile = useUpdateClubMemberProfile()

  const [licenseNumber, setLicenseNumber] = useState("")
  const [licenseValidUntil, setLicenseValidUntil] = useState("")
  const [phoneOverride, setPhoneOverride] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (!data) return
    setLicenseNumber(data.member.licenseNumber ?? "")
    setLicenseValidUntil(toDateInputValue(data.member.licenseValidUntil))
    setPhoneOverride(data.member.phoneOverride ?? "")
    setNotes(data.member.notes ?? "")
  }, [data])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Membre introuvable.</p>
  }

  const { member, bookings } = data
  const isFullAdmin = access === "full"
  const isMemberAdmin = ["owner", "admin"].includes(member.role)

  function handleSaveProfile() {
    updateProfile.mutate({
      organizationId,
      userId: member.userId,
      licenseNumber: licenseNumber || null,
      licenseValidUntil: licenseValidUntil ? new Date(licenseValidUntil).toISOString() : null,
      phoneOverride: phoneOverride || null,
      notes: notes || null,
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.push("/club/members")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux membres
      </Button>

      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={member.userImage ?? undefined} alt={member.userName} />
          <AvatarFallback>{getInitials(member.userName)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{member.userName}</h1>
          <p className="text-sm text-muted-foreground">{member.userEmail}</p>
        </div>
        {isMemberAdmin ? (
          <Badge className="ml-auto">{member.role === "owner" ? "Propriétaire" : "Admin"}</Badge>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profil club</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="license">Numéro de licence</Label>
              <Input
                id="license"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                disabled={!isFullAdmin}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="licenseValidUntil">Licence valide jusqu'au</Label>
              <Input
                id="licenseValidUntil"
                type="date"
                value={licenseValidUntil}
                onChange={(e) => setLicenseValidUntil(e.target.value)}
                disabled={!isFullAdmin}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone (club)</Label>
              <Input
                id="phone"
                value={phoneOverride}
                onChange={(e) => setPhoneOverride(e.target.value)}
                disabled={!isFullAdmin}
                placeholder={member.userPhone ?? undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!isFullAdmin}
                rows={3}
              />
            </div>
            {isFullAdmin ? (
              <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique de réservations</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune réservation récente.</p>
            ) : (
              <ul className="space-y-2">
                {bookings.map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between text-sm">
                    <span>
                      {booking.courtName} · {booking.sport === "tennis" ? "Tennis" : "Padel"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{formatDate(booking.startAt)}</span>
                      {booking.status === "cancelled" ? (
                        <Badge variant="destructive" className="text-xs">
                          Annulée
                        </Badge>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
