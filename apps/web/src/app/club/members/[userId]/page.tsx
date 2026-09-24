"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  CalendarPlus,
  CalendarDays,
  MapPin,
  Cake,
  Phone,
  IdCard,
  ShieldCheck,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
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
import { TarifRuleCommunePicker } from "@/components/custom/tarif-grid/tarif-rule-commune-picker"
import { getCommuneName } from "@/components/custom/tarif-grid/commune-name-cache"
import { useClubTags } from "@/hooks/use-club-tag-queries"
import { useSetMemberTags } from "@/hooks/use-club-tag-mutations"
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

function sportLabel(sport: string | null) {
  return sport === "padel" ? "Padel" : "Tennis"
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
  const { data: tagsData } = useClubTags(organizationId)
  const setMemberTags = useSetMemberTags()

  const [licenseNumber, setLicenseNumber] = useState("")
  const [licenseValidUntil, setLicenseValidUntil] = useState("")
  const [medicalCertificateValidUntil, setMedicalCertificateValidUntil] = useState("")
  const [phoneOverride, setPhoneOverride] = useState("")
  const [city, setCity] = useState("")
  const [isVip, setIsVip] = useState(false)
  const [licensedElsewhere, setLicensedElsewhere] = useState<boolean | null>(null)
  const [householdRank, setHouseholdRank] = useState<number | null>(null)
  const [communeInsee, setCommuneInsee] = useState<string | null>(null)
  const [communeName, setCommuneName] = useState<string | null>(null)
  const [tagIds, setTagIds] = useState<string[]>([])
  const [levelDialogOpen, setLevelDialogOpen] = useState(false)

  useEffect(() => {
    if (!data) return
    setLicenseNumber(data.member.licenseNumber ?? "")
    setLicenseValidUntil(toDateInputValue(data.member.licenseValidUntil))
    setMedicalCertificateValidUntil(toDateInputValue(data.member.medicalCertificateValidUntil))
    setPhoneOverride(data.member.phoneOverride ?? "")
    setCity(data.member.city ?? "")
    setIsVip(!!data.member.isVip)
    setLicensedElsewhere(data.member.licensedElsewhere)
    setHouseholdRank(data.member.householdRank)
    setCommuneInsee(data.member.communeInsee)
    setCommuneName(data.member.communeName)
    setTagIds(data.tagIds ?? [])
  }, [data])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Membre introuvable.</p>
  }

  const { member, bookings, cancelledBookingCount } = data
  const isFullAdmin = access === "full"
  const isOwner = member.role === "owner"
  const age = computeAge(member.dateOfBirth)
  const bookingLinkParams = `userId=${member.userId}&name=${encodeURIComponent(member.userName)}`
  const phone = phoneOverride || member.userPhone

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
      licensedElsewhere,
      householdRank,
      communeInsee,
      communeName,
    })
  }

  function handleSaveTags() {
    setMemberTags.mutate({ organizationId, userId: member.userId, tagIds })
  }

  function toggleTag(tagId: string, checked: boolean) {
    setTagIds((prev) => (checked ? [...prev, tagId] : prev.filter((id) => id !== tagId)))
  }

  return (
    <div className="mx-auto max-w-6xl px-2">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.push("/club/members")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux membres
      </Button>

      {/* Header: identité + actions rapides */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={member.userImage ?? undefined} alt={member.userName} />
            <AvatarFallback>{getInitials(member.userName)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{member.userName}</h1>
              {member.role !== "member" ? <Badge>{ROLE_LABELS[member.role] ?? member.role}</Badge> : null}
              {isVip ? <Badge variant="outline">VIP</Badge> : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Membre depuis {formatDate(member.memberSince)}
              {member.lastBookingAt ? ` · Dernière réservation le ${formatDate(member.lastBookingAt)}` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${member.userEmail}`}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </a>
          </Button>
          {phone ? (
            <Button variant="outline" size="sm" asChild>
              <a href={`sms:${phone}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS
              </a>
            </Button>
          ) : null}
          <Button size="sm" asChild>
            <Link href={`/club/bookings?${bookingLinkParams}`}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Nouvelle réservation
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Réservations</p>
            <p className="text-xl font-semibold">{upcomingData?.totalCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Annulations</p>
            <p className="text-xl font-semibold">{cancelledBookingCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Niveau(x) — cartes colorées par sport */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {member.skillLevel ? (
          <Card
            className={
              member.sport === "padel"
                ? "border-orange-200 bg-orange-50"
                : "border-emerald-200 bg-emerald-50"
            }
          >
            <CardContent className="flex items-center justify-between py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {sportLabel(member.sport)}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <p className="text-lg font-semibold">{member.skillLevel}</p>
                  {member.skillLevelVerified ? <VerifiedBadge /> : null}
                </div>
              </div>
              {isFullAdmin ? (
                <Button variant="ghost" size="sm" onClick={() => setLevelDialogOpen(true)}>
                  Modifier
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-between py-5">
              <p className="text-sm text-muted-foreground">Aucun niveau défini</p>
              {isFullAdmin ? (
                <Button variant="ghost" size="sm" onClick={() => setLevelDialogOpen(true)}>
                  Définir
                </Button>
              ) : null}
            </CardContent>
          </Card>
        )}

        {member.secondarySport && member.secondarySkillLevel ? (
          <Card
            className={
              member.secondarySport === "padel"
                ? "border-orange-200 bg-orange-50"
                : "border-emerald-200 bg-emerald-50"
            }
          >
            <CardContent className="py-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {sportLabel(member.secondarySport)} (secondaire)
              </p>
              <p className="mt-1 text-lg font-semibold">{member.secondarySkillLevel}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Colonne gauche : contact + dossier club */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {member.userEmail}
              </div>
              {phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {phone}
                </div>
              ) : null}
              {city ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {city}
                </div>
              ) : null}
              {age != null ? (
                <div className="flex items-center gap-2">
                  <Cake className="h-4 w-4 text-muted-foreground" />
                  {age} ans
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dossier club</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="license" className="flex items-center gap-1.5">
                  <IdCard className="h-3.5 w-3.5" />
                  Numéro de licence
                </Label>
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
                <Label htmlFor="medicalCertificateValidUntil" className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Certificat médical valide jusqu'au
                </Label>
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
              <div className="space-y-1.5">
                <Label>Licencié dans un autre club</Label>
                <Select
                  value={licensedElsewhere === null ? "unknown" : licensedElsewhere ? "yes" : "no"}
                  onValueChange={(v) => setLicensedElsewhere(v === "unknown" ? null : v === "yes")}
                  disabled={!isFullAdmin}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unknown">Non renseigné</SelectItem>
                    <SelectItem value="yes">Oui</SelectItem>
                    <SelectItem value="no">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Rang dans le foyer</Label>
                <Select
                  value={householdRank === null ? "unknown" : String(householdRank)}
                  onValueChange={(v) => setHouseholdRank(v === "unknown" ? null : Number(v))}
                  disabled={!isFullAdmin}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unknown">Non renseigné</SelectItem>
                    <SelectItem value="1">1er</SelectItem>
                    <SelectItem value="2">2e</SelectItem>
                    <SelectItem value="3">3e</SelectItem>
                    <SelectItem value="4">4e et plus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Commune de résidence</Label>
                {isFullAdmin ? (
                  <TarifRuleCommunePicker
                    selectedCodes={communeInsee ? [communeInsee] : []}
                    onChange={(codes) => {
                      const last = codes[codes.length - 1] ?? null
                      setCommuneInsee(last)
                      setCommuneName(last ? (getCommuneName(last) ?? null) : null)
                    }}
                  />
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {communeInsee ? `${communeName ?? communeInsee} (${communeInsee})` : "Non renseignée"}
                </p>
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
              <CardTitle>Statuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!tagsData?.tags.length ? (
                <p className="text-sm text-muted-foreground">Aucun statut défini pour ce club.</p>
              ) : (
                tagsData.tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={tagIds.includes(tag.id)}
                      onCheckedChange={(checked) => toggleTag(tag.id, checked === true)}
                      disabled={!isFullAdmin}
                    />
                    <Label htmlFor={`tag-${tag.id}`}>{tag.name}</Label>
                  </div>
                ))
              )}
              {isFullAdmin && tagsData?.tags.length ? (
                <Button onClick={handleSaveTags} disabled={setMemberTags.isPending}>
                  {setMemberTags.isPending ? "Enregistrement..." : "Enregistrer les statuts"}
                </Button>
              ) : null}
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

        {/* Colonne centrale : historique de réservations */}
        <div className="space-y-6 lg:col-span-1">
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

        {/* Colonne droite : réservations à venir + notes */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Réservations à venir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Voir le planning
                </Link>
              </Button>
            </CardContent>
          </Card>

          <MemberNotesCard organizationId={organizationId} userId={member.userId} />
        </div>
      </div>

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
                  Retire son adhésion à ce club (profil, notes internes). Son historique de
                  réservations reste intact.
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
    </div>
  )
}
