"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, MessageSquare, CalendarPlus, CalendarDays } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { MemberNotesCard } from "@/components/custom/member-notes-card"
import { SetMemberLevelDialog } from "@/components/custom/set-member-level-dialog"
import { AssignSubscriptionDialog } from "@/components/custom/assign-subscription-dialog"
import { useClubMemberDetail, useMemberUpcomingBookings } from "@/hooks/use-club-member-queries"
import {
  useUpdateClubMemberProfile,
  useUpdateMemberRole,
  useRemoveClubMember,
} from "@/hooks/use-club-member-mutations"
import { useClubAdminContext } from "@/lib/club-admin-context"
import type { LevelSport } from "@/types/club-level"

const ROLE_LABELS: Record<string, string> = {
  owner: "Propriétaire",
  admin: "Admin",
  coach: "Coach",
  member: "Membre",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function toDateInputValue(dateStr: string | null) {
  if (!dateStr) return ""
  return dateStr.slice(0, 10)
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

function computeAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  if (isNaN(dob.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const monthDiff = now.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--
  return age
}

export default function ClubMemberDetailPage() {
  const router = useRouter()
  const params = useParams<{ userId: string }>()
  const { organizationId, access } = useClubAdminContext()
  const { data, isLoading } = useClubMemberDetail(organizationId, params.userId)
  const { data: upcomingData } = useMemberUpcomingBookings(organizationId, params.userId)
  const updateProfile = useUpdateClubMemberProfile()
  const updateRole = useUpdateMemberRole()
  const removeMember = useRemoveClubMember()

  const [licenseNumber, setLicenseNumber] = useState("")
  const [licenseValidUntil, setLicenseValidUntil] = useState("")
  const [medicalCertificateValidUntil, setMedicalCertificateValidUntil] = useState("")
  const [phoneOverride, setPhoneOverride] = useState("")
  const [city, setCity] = useState("")
  const [isVip, setIsVip] = useState(false)
  const [levelDialogOpen, setLevelDialogOpen] = useState(false)
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)

  useEffect(() => {
    if (!data) return
    setLicenseNumber(data.member.licenseNumber ?? "")
    setLicenseValidUntil(toDateInputValue(data.member.licenseValidUntil))
    setMedicalCertificateValidUntil(toDateInputValue(data.member.medicalCertificateValidUntil))
    setPhoneOverride(data.member.phoneOverride ?? "")
    setCity(data.member.city ?? "")
    setIsVip(!!data.member.isVip)
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

  const { member, bookings, subscription } = data
  const isFullAdmin = access === "full"
  const isOwner = member.role === "owner"
  const age = computeAge(member.dateOfBirth)
  const bookingLinkParams = `userId=${member.userId}&name=${encodeURIComponent(member.userName)}`

  const subscriptionStatus = !subscription
    ? null
    : subscription.status === "cancelled"
      ? "cancelled"
      : subscription.endDate && new Date(subscription.endDate) < new Date()
        ? "expired"
        : "active"

  const subscriptionLabel =
    subscriptionStatus === "active"
      ? "Actif"
      : subscriptionStatus === "expired"
        ? "Expiré"
        : subscriptionStatus === "cancelled"
          ? "Annulé"
          : "Aucun abonnement"

  function handleSaveProfile() {
    updateProfile.mutate({
      organizationId,
      userId: member.userId,
      licenseNumber: licenseNumber || null,
      licenseValidUntil: licenseValidUntil ? new Date(licenseValidUntil).toISOString() : null,
      medicalCertificateValidUntil: medicalCertificateValidUntil
        ? new Date(medicalCertificateValidUntil).toISOString()
        : null,
      phoneOverride: phoneOverride || null,
      city: city || null,
      isVip,
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.push("/club/members")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux membres
      </Button>

      {/* Identité & contact */}
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={member.userImage ?? undefined} alt={member.userName} />
          <AvatarFallback>{getInitials(member.userName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{member.userName}</h1>
            {member.role !== "member" ? <Badge>{ROLE_LABELS[member.role] ?? member.role}</Badge> : null}
            {isVip ? <Badge variant="outline">VIP</Badge> : null}
            {subscriptionStatus ? (
              <Badge variant={subscriptionStatus === "active" ? "default" : "secondary"}>
                {subscriptionLabel}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {member.userEmail}
            {member.userPhone || phoneOverride ? ` · ${phoneOverride || member.userPhone}` : ""}
            {city ? ` · ${city}` : ""}
            {age != null ? ` · ${age} ans` : ""}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Membre depuis {formatDate(member.memberSince)}
            {member.lastBookingAt ? ` · Dernière réservation le ${formatDate(member.lastBookingAt)}` : ""}
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${member.userEmail}`}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </a>
            </Button>
            {member.userPhone || phoneOverride ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`sms:${phoneOverride || member.userPhone}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  SMS
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profil club</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Niveau</Label>
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{member.skillLevel ?? "Non défini"}</span>
                  {member.skillLevelVerified ? <VerifiedBadge /> : null}
                </div>
                {isFullAdmin ? (
                  <Button variant="ghost" size="sm" onClick={() => setLevelDialogOpen(true)}>
                    Modifier
                  </Button>
                ) : null}
              </div>
            </div>
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
              <Label htmlFor="medicalCertificateValidUntil">Certificat médical valide jusqu'au</Label>
              <Input
                id="medicalCertificateValidUntil"
                type="date"
                value={medicalCertificateValidUntil}
                onChange={(e) => setMedicalCertificateValidUntil(e.target.value)}
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
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!isFullAdmin}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="vip">VIP</Label>
              <Switch id="vip" checked={isVip} onCheckedChange={setIsVip} disabled={!isFullAdmin} />
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
            <CardTitle>Abonnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">{subscription.typeName}</p>
                {subscription.endDate ? (
                  <p className="text-muted-foreground">Échéance : {formatDate(subscription.endDate)}</p>
                ) : (
                  <p className="text-muted-foreground">Sans date de fin</p>
                )}
                {subscription.amountDueCents > 0 ? (
                  <p className="text-amber-600">
                    Solde dû : {(subscription.amountDueCents / 100).toFixed(2)} €
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun abonnement attribué.</p>
            )}
            {isFullAdmin ? (
              <Button variant="outline" size="sm" onClick={() => setSubscriptionDialogOpen(true)}>
                Attribuer un abonnement
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Réservations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {upcomingData?.totalCount ?? 0} réservation
              {(upcomingData?.totalCount ?? 0) > 1 ? "s" : ""} au total
            </p>
            {upcomingData?.upcoming.length ? (
              <ul className="space-y-1.5">
                {upcomingData.upcoming.map((b) => (
                  <li key={b.id} className="flex items-center justify-between text-sm">
                    <span>
                      {b.courtName} · {b.sport === "tennis" ? "Tennis" : "Padel"}
                    </span>
                    <span className="text-muted-foreground">{formatDateTime(b.startAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune réservation à venir.</p>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/club/bookings?${bookingLinkParams}`}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Nouvelle réservation
              </Link>
            </Button>
          </CardContent>
        </Card>

        {isFullAdmin && !isOwner ? (
          <Card>
            <CardHeader>
              <CardTitle>Rôle dans le club</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <Label>Rôle</Label>
              <Select
                value={member.role}
                disabled={updateRole.isPending}
                onValueChange={(role: "admin" | "member" | "coach") =>
                  updateRole.mutate({ organizationId, userId: member.userId, role })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membre</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Un coach n&apos;a accès qu&apos;à ses propres cours, pas au reste du dashboard.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="mt-6">
        <MemberNotesCard organizationId={organizationId} userId={member.userId} />
      </div>

      {/* Historique de réservations (existant) */}
      <Card className="mt-6">
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

      {/* Actions rapides */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/club/bookings?${bookingLinkParams}`}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Nouvelle réservation
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/club/bookings?${bookingLinkParams}`}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Voir le planning
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${member.userEmail}`}>
              <Mail className="mr-2 h-4 w-4" />
              Envoyer un email
            </a>
          </Button>
          {member.userPhone || phoneOverride ? (
            <Button variant="outline" size="sm" asChild>
              <a href={`sms:${phoneOverride || member.userPhone}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Envoyer un SMS
              </a>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {isFullAdmin && !isOwner ? (
        <div className="mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Supprimer l&apos;adhérent</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer {member.userName} ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Retire son adhésion à ce club (profil, notes internes, abonnement). Son
                  historique de réservations reste intact.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    removeMember.mutate(
                      { organizationId, userId: member.userId },
                      { onSuccess: () => router.push("/club/members") },
                    )
                  }
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}

      <SetMemberLevelDialog
        organizationId={organizationId}
        userId={member.userId}
        currentSport={member.sport as LevelSport | null}
        currentSkillLevel={member.skillLevel}
        currentVerified={member.skillLevelVerified}
        open={levelDialogOpen}
        onOpenChange={setLevelDialogOpen}
      />
      <AssignSubscriptionDialog
        organizationId={organizationId}
        userId={member.userId}
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
      />
    </div>
  )
}
