import { describe, expect, it } from "vitest"
import {
  diffProfileForm,
  formFromDetail,
  isProfileFormDirty,
  tagsChanged,
  type ProfileForm,
  type ProfileFormSource,
} from "./profile-form"

const source: ProfileFormSource = {
  member: {
    licenseNumber: "L123",
    licenseValidUntil: "2027-08-31T00:00:00.000Z",
    medicalCertificateValidUntil: null,
    phoneOverride: null,
    isVip: false,
    licensedElsewhere: null,
    householdRank: null,
    communeInsee: "35238",
    communeName: "Rennes",
    clubDateOfBirth: "2010-12-31",
    isAdherent: null,
    isNewMember: null,
  },
  tagIds: ["b", "a"],
}

describe("formFromDetail", () => {
  it("convertit la fiche en état de formulaire", () => {
    const form = formFromDetail(source)
    expect(form.licenseValidUntil).toBe("2027-08-31")
    expect(form.medicalCertificateValidUntil).toBe("")
    expect(form.dateOfBirth).toBe("2010-12-31")
    expect(form.tagIds).toEqual(["b", "a"])
  })

  it("laisse vide une date de naissance héritée au mauvais format", () => {
    const form = formFromDetail({ ...source, member: { ...source.member, clubDateOfBirth: "31/12/2010" } })
    expect(form.dateOfBirth).toBe("")
  })
})

describe("diffProfileForm", () => {
  const initial = formFromDetail(source)

  it("renvoie null quand rien n'a changé", () => {
    expect(diffProfileForm(initial, { ...initial })).toBeNull()
    expect(isProfileFormDirty(initial, { ...initial })).toBe(false)
  })

  it("n'envoie que les champs modifiés", () => {
    const patch = diffProfileForm(initial, { ...initial, phoneOverride: "0601020304", isVip: true })
    expect(patch).toEqual({ phoneOverride: "0601020304", isVip: true })
  })

  it("efface un champ vidé avec null et convertit les dates en ISO complet", () => {
    const current: ProfileForm = { ...initial, licenseNumber: "", licenseValidUntil: "2028-08-31" }
    expect(diffProfileForm(initial, current)).toEqual({
      licenseNumber: null,
      licenseValidUntil: new Date("2028-08-31").toISOString(),
    })
  })

  it("distingue null (non renseigné) de false", () => {
    const patch = diffProfileForm(initial, { ...initial, licensedElsewhere: false })
    expect(patch).toEqual({ licensedElsewhere: false })
  })

  it("envoie le code et le nom de la commune ensemble", () => {
    const patch = diffProfileForm(initial, { ...initial, communeInsee: "35047", communeName: "Cesson-Sévigné" })
    expect(patch).toEqual({ communeInsee: "35047", communeName: "Cesson-Sévigné" })
    const cleared = diffProfileForm(initial, { ...initial, communeInsee: null, communeName: null })
    expect(cleared).toEqual({ communeInsee: null, communeName: null })
  })

  it("vide la date de naissance avec null", () => {
    expect(diffProfileForm(initial, { ...initial, dateOfBirth: "" })).toEqual({ dateOfBirth: null })
  })
})

describe("tagsChanged", () => {
  const initial = formFromDetail(source)

  it("ignore l'ordre des statuts", () => {
    expect(tagsChanged(initial, { ...initial, tagIds: ["a", "b"] })).toBe(false)
  })

  it("détecte un ajout, un retrait et le rend sale", () => {
    expect(tagsChanged(initial, { ...initial, tagIds: ["a", "b", "c"] })).toBe(true)
    expect(tagsChanged(initial, { ...initial, tagIds: ["a"] })).toBe(true)
    expect(isProfileFormDirty(initial, { ...initial, tagIds: ["a"] })).toBe(true)
  })
})
