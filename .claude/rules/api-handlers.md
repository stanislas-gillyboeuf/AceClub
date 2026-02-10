---
paths:
  - services/api/**/queries/**/*.ts
  - services/api/**/mutations/**/*.ts
---
# API Handlers Rules (Hono)

## Signature

```typescript
import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";

export const handlerName = async (c: Context<HonoContext>) => {
  // ...
};
```

## Query Handler (GET)

```typescript
import { Context } from "hono";
import { eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { itemTable } from "../../../db/schema";

export const getItem = async (c: Context<HonoContext>) => {
  // Récupérer l'utilisateur authentifié
  const user = c.get("user");

  // Récupérer les params validés (si applicable)
  const { id } = c.req.param();

  // Query la base de données
  const [item] = await db
    .select()
    .from(itemTable)
    .where(eq(itemTable.id, id))
    .limit(1);

  if (!item) {
    return c.json({ error: "NotFound", message: "Item not found" }, 404);
  }

  return c.json({
    id: item.id,
    name: item.name,
    // ... autres champs
  });
};
```

## Mutation Handler (POST/PUT/DELETE)

```typescript
import { Context } from "hono";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ulid } from "ulid";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { itemTable } from "../../../db/schema";
import { createItemValidator } from "../validators";

export const createItem = async (c: Context<HonoContext>) => {
  const user = c.get("user");

  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof createItemValidator>;

  // Vérifier l'existence (si nécessaire)
  const [existing] = await db
    .select({ id: itemTable.id })
    .from(itemTable)
    .where(eq(itemTable.email, validated.email))
    .limit(1);

  if (existing) {
    return c.json({ error: "Conflict", message: "Item already exists" }, 409);
  }

  // Créer l'item
  const [created] = await db
    .insert(itemTable)
    .values({
      id: ulid(),
      name: validated.name,
      email: validated.email,
      createdBy: user!.id,
    })
    .returning();

  return c.json(created, 201);
};
```

## Règles

1. **Signature** : `async (c: Context<HonoContext>)`
2. **User** : Récupérer avec `c.get("user")`
3. **Validation** : `c.req.valid("json")` avec type casting
4. **Retour succès** : `c.json(data)` ou `c.json(data, 201)`
5. **Retour erreur** : `c.json({ error: "Type", message: "..." }, statusCode)`
6. **IDs** : Utiliser `ulid()` pour générer les IDs
7. **Drizzle** : Utiliser `.returning()` pour récupérer l'item créé/modifié

## Format des erreurs

```typescript
// 400 Bad Request - Validation
return c.json({ error: "BadRequest", message: "Invalid input" }, 400);

// 401 Unauthorized - Non authentifié
return c.json({ error: "Unauthorized", message: "Authentication required" }, 401);

// 403 Forbidden - Pas les droits
return c.json({ error: "Forbidden", message: "Insufficient permissions" }, 403);

// 404 Not Found - Ressource inexistante
return c.json({ error: "NotFound", message: "Item not found" }, 404);

// 409 Conflict - Déjà existant
return c.json({ error: "Conflict", message: "Item already exists" }, 409);

// 500 Internal Server Error
return c.json({ error: "InternalError", message: "Something went wrong" }, 500);
```

## Patterns avancés

### Transaction

```typescript
const result = await db.transaction(async (tx) => {
  const [item] = await tx
    .insert(itemTable)
    .values({ id: ulid(), ...data })
    .returning();

  await tx
    .insert(relatedTable)
    .values({ id: ulid(), itemId: item.id, ...relatedData });

  return item;
});

return c.json(result, 201);
```

### Queries parallèles

```typescript
const [items, count] = await Promise.all([
  db.select().from(itemTable).where(eq(itemTable.userId, user!.id)),
  db.select({ count: sql`count(*)` }).from(itemTable).where(eq(itemTable.userId, user!.id)),
]);
```

### Gestion erreurs PostgreSQL (unique constraint)

```typescript
try {
  const [created] = await db
    .insert(itemTable)
    .values({ id: ulid(), ...data })
    .returning();
  return c.json(created, 201);
} catch (err: any) {
  if (err?.code === "23505") {
    return c.json({ error: "Conflict", message: "Already exists" }, 409);
  }
  throw err;
}
```

### Map-based grouping

```typescript
const rows = await db.select().from(itemTable);

const grouped = new Map<string, typeof rows>();
for (const row of rows) {
  const key = row.categoryId;
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key)!.push(row);
}
```

### Side effects après DB success

```typescript
const [created] = await db
  .insert(itemTable)
  .values({ id: ulid(), ...data })
  .returning();

// Side effects APRÈS le succès DB
await NotificationService.send(created.userId, "New item created");

return c.json(created, 201);
```

## Barrel exports

Chaque dossier `queries/` et `mutations/` DOIT avoir un `index.ts` :

```typescript
// queries/index.ts
export { getItem } from "./get-item";
export { listItems } from "./list-items";
export { searchItems } from "./search-items";
```
