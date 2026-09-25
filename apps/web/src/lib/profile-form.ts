import type { UpdateClubMemberProfileInput } from "@/types/club-admin"

/** Editable state of the member file's single "Enregistrer" button (everything except the
 * household card, the role and the level, which act immediately). Dates are "YYYY-MM-DD" strings
 * (as in an `<input type="date">`), empty string = not set. */
export interface ProfileForm {
  licenseNumber: string
  licenseValidUntil: string
  medicalCertificateValidUntil: string
  phoneOverride: string
  isVip: boolean
  licensedElsewhere: boolean | null
  householdRank: number | null
  communeInsee: string | null
  communeName: string | null
  dateOfBirth: string
  isAdherent: boolean | null
  isNewMember: boolean | null
  tagIds: string[]
}

/** The slice of the member detail response the form is built from. */
export interface ProfileFormSource {
  member: {
    licenseNumber: string | null
    licenseValidUntil: string | null
    medicalCertificateValidUntil: string | null
    phoneOverride: string | null
    isVip: boolean | null
    licensedElsewhere: boolean | null
    householdRank: number | null
    communeInsee: string | null
    communeName: string | null
    clubDateOfBirth: string | null
    isAdherent: boolean | null
    isNewMember: boolean | null
  }
  tagIds?: string[]
}

export type ProfilePatch = Omit<UpdateClubMemberProfileInput, "organizationId" | "userId">

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : ""
}

export function formFromDetail(detail: ProfileFormSource): ProfileForm {
  const { member } = detail
  return {
    licenseNumber: member.licenseNumber ?? "",
    licenseValidUntil: toDateInput(member.licenseValidUntil),
    medicalCertificateValidUntil: toDateInput(member.medicalCertificateValidUntil),
    phoneOverride: member.phoneOverride ?? "",
    isVip: !!member.isVip,
    licensedElsewhere: member.licensedElsewhere,
    householdRank: member.householdRank,
    communeInsee: member.communeInsee,
    communeName: member.communeName,
    // A legacy non-ISO value is not editable as a date: it shows as empty and is flagged separately.
    dateOfBirth: member.clubDateOfBirth && ISO_DATE.test(member.clubDateOfBirth) ? member.clubDateOfBirth : "",
    isAdherent: member.isAdherent,
    isNewMember: member.isNewMember,
    tagIds: detail.tagIds ?? [],
  }
}

function sameTags(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sorted = [...a].sort()
  return [...b].sort().every((id, i) => id === sorted[i])
}

export function tagsChanged(initial: ProfileForm, current: ProfileForm): boolean {
  return !sameTags(initial.tagIds, current.tagIds)
}

/** Only the profile fields that changed, in the API's shape (an absent key = leave untouched). */
export function diffProfileForm(initial: ProfileForm, current: ProfileForm): ProfilePatch | null {
  const patch: ProfilePatch = {}

  if (initial.licenseNumber !== current.licenseNumber) patch.licenseNumber = current.licenseNumber || null
  if (initial.licenseValidUntil !== current.licenseValidUntil) {
    patch.licenseValidUntil = current.licenseValidUntil ? new Date(current.licenseValidUntil).toISOString() : null
  }
  if (initial.medicalCertificateValidUntil !== current.medicalCertificateValidUntil) {
    patch.medicalCertificateValidUntil = current.medicalCertificateValidUntil
      ? new Date(current.medicalCertificateValidUntil).toISOString()
      : null
  }
  if (initial.phoneOverride !== current.phoneOverride) patch.phoneOverride = current.phoneOverride || null
  if (initial.isVip !== current.isVip) patch.isVip = current.isVip
  if (initial.licensedElsewhere !== current.licensedElsewhere) patch.licensedElsewhere = current.licensedElsewhere
  if (initial.householdRank !== current.householdRank) patch.householdRank = current.householdRank
  // Code and name always travel together.
  if (initial.communeInsee !== current.communeInsee || initial.communeName !== current.communeName) {
    patch.communeInsee = current.communeInsee
    patch.communeName = current.communeName
  }
  if (initial.dateOfBirth !== current.dateOfBirth) patch.dateOfBirth = current.dateOfBirth || null
  if (initial.isAdherent !== current.isAdherent) patch.isAdherent = current.isAdherent
  if (initial.isNewMember !== current.isNewMember) patch.isNewMember = current.isNewMember

  return Object.keys(patch).length > 0 ? patch : null
}

export function isProfileFormDirty(initial: ProfileForm, current: ProfileForm): boolean {
  return diffProfileForm(initial, current) !== null || tagsChanged(initial, current)
}

/** Element id to scroll to for each pricing field the engine can report as missing. Fields
 * derived automatically (lessons per week, registration date) have no input to point at. */
export const MISSING_FIELD_ANCHORS: Record<string, string> = {
  birthDate: "field-dateOfBirth",
  licensedElsewhere: "field-licensedElsewhere",
  communeInsee: "field-commune",
  householdRank: "member-household-card",
  tags: "field-tags",
  isNew: "field-isNewMember",
}
