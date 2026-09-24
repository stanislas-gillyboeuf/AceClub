import { describe, expect, it } from "vitest"
import { autoMapColumns, isMappingUsable } from "./columns"
import { TEMPLATE_HEADERS } from "./template"

describe("autoMapColumns", () => {
  it("maps the template headers to the expected fields", () => {
    const mapping = autoMapColumns([...TEMPLATE_HEADERS])
    expect(mapping).toEqual({
      Nom: "lastName",
      Prénom: "firstName",
      Email: "email",
      Téléphone: "phone",
      "Date de naissance": "dateOfBirth",
      "Code postal": "postalCode",
      Commune: "city",
      "N° de licence": "licenseNumber",
      "Licence valide jusqu'au": "licenseValidUntil",
      "Licencié ailleurs": "licensedElsewhere",
      "Email du responsable": "householdEmail",
      Statuts: "tags",
    })
  })

  it("ignores accents, case and punctuation", () => {
    const mapping = autoMapColumns(["NOM DE FAMILLE", "prenom", "E-mail", "Né(e) le", "CP", "Ville", "Courriel parent"])
    expect(mapping["NOM DE FAMILLE"]).toBe("lastName")
    expect(mapping["prenom"]).toBe("firstName")
    expect(mapping["E-mail"]).toBe("email")
    expect(mapping["Né(e) le"]).toBe("dateOfBirth")
    expect(mapping["CP"]).toBe("postalCode")
    expect(mapping["Ville"]).toBe("city")
    expect(mapping["Courriel parent"]).toBe("householdEmail")
  })

  it("recognises a full-name column and longer headers", () => {
    const mapping = autoMapColumns(["Nom complet", "Licencié ailleurs (oui/non)", "Email du parent"])
    expect(mapping["Nom complet"]).toBe("name")
    expect(mapping["Licencié ailleurs (oui/non)"]).toBe("licensedElsewhere")
    expect(mapping["Email du parent"]).toBe("householdEmail")
  })

  it("claims each field once and ignores unknown or repeated columns", () => {
    const mapping = autoMapColumns(["Email", "Mail", "Numéro de sécu", "Contact d'urgence"])
    expect(mapping["Email"]).toBe("email")
    expect(mapping["Mail"]).toBe("ignore")
    expect(mapping["Numéro de sécu"]).toBe("ignore")
    expect(mapping["Contact d'urgence"]).toBe("ignore")
  })
})

describe("isMappingUsable", () => {
  it("needs a name and an email or a birth date", () => {
    expect(isMappingUsable({ Nom: "lastName", Email: "email" })).toBe(true)
    expect(isMappingUsable({ Prénom: "firstName", Naissance: "dateOfBirth" })).toBe(true)
    expect(isMappingUsable({ Nom: "name" })).toBe(false)
    expect(isMappingUsable({ Email: "email" })).toBe(false)
    expect(isMappingUsable({ A: "ignore" })).toBe(false)
  })
})
