---
paths:
  - services/api/middleware/**/*.ts
  - services/api/auth.ts
---
# API Authentication Rules (Better Auth)

## Middlewares

### requireAuth (authentification obligatoire)

```typescript
import { Context, Next } from "hono";
import { auth } from "../auth";
import type { HonoContext } from "../types/hono";

export const requireAuth = async (c: Context<HonoContext>, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized", message: "Valid authentication required" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};
```

### authMiddleware (authentification optionnelle)

```typescript
export const authMiddleware = async (c: Context<HonoContext>, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};
```

## Utilisation dans les routers

```typescript
import { requireAuth, authMiddleware } from "../../middleware/auth";

// Toutes les routes protégées
userRouter.use("/*", requireAuth);

// Route spécifique protégée
publicRouter.get("/profile/:id", authMiddleware, getProfile);
```

## Configuration Better Auth

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, admin, organization } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg" }),

  // Champs additionnels sur user
  user: {
    additionalFields: {
      onboardingCompleted: {
        type: "boolean",
        fieldName: "onboarding_completed",
        defaultValue: false,
      },
      isGhost: {
        type: "boolean",
        fieldName: "is_ghost",
        defaultValue: false,
      },
    },
  },

  // OAuth providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID as string,
      clientSecret: process.env.APPLE_CLIENT_SECRET as string,
      appBundleIdentifier: "dev.aceclub.app",
    },
  },

  // Origines autorisées
  trustedOrigins: [
    "http://localhost:3000",
    "aceclub://",
    "https://ace-club-production.up.railway.app",
  ],

  // Plugins
  plugins: [bearer(), admin(), organization()],
});
```

## Règles

1. **requireAuth** : Pour les routes qui DOIVENT être authentifiées
2. **authMiddleware** : Pour les routes où l'auth est optionnelle
3. **c.get("user")** : Accéder à l'utilisateur dans les handlers
4. **Bearer token** : Envoyé via header `Authorization: Bearer <token>`
5. **Database hooks** : Utiliser pour logique métier (ex: convertir ghost → user)

## Accès aux données utilisateur

```typescript
const user = c.get("user");
// user.id, user.name, user.email, user.role, etc.

const session = c.get("session");
// session.token, session.expiresAt, etc.
```
