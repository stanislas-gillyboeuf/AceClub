---
paths: services/api/**/validators.ts
---
# API Validation Rules (Zod)

## Nommage

Format : `<action>Validator`

Exemples :
- `createUserValidator`
- `updateProfileValidator`
- `searchUsersValidator`
- `completeOnboardingValidator`

## Structure

```typescript
import { z } from "zod";

// Constantes pour les enums
const VALID_ROLES = ["user", "admin", "moderator"] as const;
const SPORTS = ["tennis", "padel"] as const;

// Validator simple
export const createItemValidator = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(VALID_ROLES).optional(),
});

// Validator avec coerce pour query params
export const searchValidator = z.object({
  query: z.string().min(1, "Search query required"),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  offset: z.coerce.number().min(0).optional().default(0),
});

// Validator avec refine pour validation cross-field
export const onboardingValidator = z
  .object({
    sport: z.enum(SPORTS),
    skillLevel: z.string().min(1),
  })
  .refine(
    (data) => {
      if (data.sport === "tennis") return TENNIS_LEVELS.includes(data.skillLevel);
      return PADEL_LEVELS.includes(data.skillLevel);
    },
    { message: "Invalid skill level for sport", path: ["skillLevel"] }
  );
```

## Règles

1. **Un fichier par domaine** : `validators.ts` dans chaque dossier domaine
2. **Export nommé** : `export const <name>Validator`
3. **Messages d'erreur** : Toujours fournir des messages clairs
4. **Coerce pour query** : Utiliser `z.coerce.number()` pour les query params
5. **Refine** : Utiliser `.refine()` pour la validation conditionnelle
6. **Constantes** : Définir les valeurs valides comme `const` arrays

## Utilisation dans les routers

```typescript
import { zValidator } from "@hono/zod-validator";
import { createItemValidator } from "./validators";

router.post("/", zValidator("json", createItemValidator), handler);
router.get("/search", zValidator("query", searchValidator), handler);
```

## Utilisation dans les handlers

```typescript
import { z } from "zod";
import { createItemValidator } from "../validators";

export const createItem = async (c: Context<HonoContext>) => {
  // @ts-ignore - nécessaire pour le typage
  const validated = c.req.valid("json") as z.infer<typeof createItemValidator>;

  // Utiliser validated.name, validated.email, etc.
};
```

## Types de validation

| Source | Méthode | Exemple |
|--------|---------|---------|
| Body JSON | `zValidator("json", ...)` | POST/PUT data |
| Query params | `zValidator("query", ...)` | GET filters |
| URL params | `zValidator("param", ...)` | Route `:id` |
