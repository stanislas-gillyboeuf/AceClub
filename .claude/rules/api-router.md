---
paths: services/api/**/router.ts
---
# API Router Rules (Hono)

## Structure des dossiers

Chaque domaine fonctionnel DOIT avoir cette structure :

```
server/<domain>/
├── router.ts        # Définition des routes
├── validators.ts    # Schémas Zod
├── queries/         # Handlers GET
│   ├── index.ts     # Barrel export
│   └── <endpoint>.ts
└── mutations/       # Handlers POST/PUT/DELETE
    ├── index.ts
    └── <endpoint>.ts
```

## Router principal

```typescript
// server/router.ts
import { Hono } from "hono";
import { userRouter } from "./user/router";
import { adminRouter } from "./admin/router";

export const serverRouter = new Hono();

serverRouter.route("/user", userRouter);
serverRouter.route("/admin", adminRouter);
```

## Sous-router (domaine)

```typescript
// server/<domain>/router.ts
import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { listItems, getItem } from "./queries";
import { createItem, updateItem } from "./mutations";
import { createItemValidator, updateItemValidator } from "./validators";
import type { HonoContext } from "../../types/hono";

export const <domain>Router = new Hono<HonoContext>();

// Middleware d'authentification (si toutes les routes sont protégées)
<domain>Router.use("/*", requireAuth);

// Queries (GET)
<domain>Router.get("/list", listItems);
<domain>Router.get("/:id", getItem);

// Mutations avec validation
<domain>Router.post("/", zValidator("json", createItemValidator), createItem);
<domain>Router.put("/:id", zValidator("json", updateItemValidator), updateItem);
```

## Règles

1. **Type HonoContext** : Toujours typer `new Hono<HonoContext>()`
2. **Middleware global** : Utiliser `router.use("/*", middleware)` pour toutes les routes
3. **Validation** : Toujours utiliser `zValidator` pour les inputs
4. **Séparation** : GET dans `queries/`, POST/PUT/DELETE dans `mutations/`
5. **Nommage routes** : kebab-case (`/list-users`, `/set-role`)

## Conventions de nommage des routes

| Méthode | Pattern | Exemple |
|---------|---------|---------|
| GET (liste) | `/list-<entities>` | `/list-users` |
| GET (un) | `/:id` ou `/get-<entity>` | `/get-preferences` |
| POST | `/<action>` | `/complete-onboarding` |
| PUT | `/<resource>` | `/profile` |
| DELETE | `/remove-<entity>` | `/remove-member` |
