# AceClub - Conventions Generales

## Architecture

### Mobile - React Native Expo

```
Component (React Native)
    ↓
React Query Hook (hooks/)
    ↓
Service (services/)
    ↓
API Client (lib/api.ts)
    ↓
Backend API
```

### Web - Next.js

```
Page / Component
    ↓
React Query Hook (hooks/)
    ↓
API Client (lib/api-client.ts)
    ↓
Backend API
```

### API - Hono + Drizzle

```
Router (Hono)
    ↓
Middleware (auth, admin, org-member)
    ↓
Validator (Zod)
    ↓
Handler (query/mutation)
    ↓
Database (Drizzle ORM)
```

## Conventions de nommage

### Mobile (React Native Expo)

| Type | Convention | Exemple |
|------|------------|---------|
| Service | `<domain>.ts` | `services/user.ts` |
| Hook global | `use-<domain>.ts` | `hooks/use-user.ts` |
| Hook feature | `use-<action>.ts` | `features/discover/hooks/use-discover-state.ts` |
| Type | `<domain>.ts` | `types/user.ts` |
| Store | `<action>-form.ts` | `store/create-match-form.ts` |
| UI component | kebab-case | `components/ui/glass-view.tsx` |
| Feature component | PascalCase | `features/chat/components/ChatBottomBar.tsx` |

### Web (Next.js)

| Type | Convention | Exemple |
|------|------------|---------|
| Page | `page.tsx` | `app/(admin)/dashboard/users/page.tsx` |
| Layout | `layout.tsx` | `app/(admin)/layout.tsx` |
| UI component | kebab-case | `components/ui/button.tsx` |
| Custom component | kebab-case | `components/custom/data-table.tsx` |
| Hook | `use-<action>.ts` | `hooks/use-admin-queries.ts` |

### API (TypeScript)

| Type | Convention | Exemple |
|------|------------|---------|
| Router file | `router.ts` | `server/user/router.ts` |
| Validator | `<action>Validator` | `createUserValidator` |
| Handler | `<action>.ts` | `queries/me.ts` |
| Route path | `kebab-case` | `/list-users` |
| JSON keys | `camelCase` | `{ userId: "..." }` |

## Patterns de code recurrents

### Mobile - React Query hook

```typescript
// hooks/use-user.ts
export function useMe() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userService.getMe(),
    staleTime: 5 * 60 * 1000,
  });
}
```

### Mobile - Service

```typescript
// services/user.ts
export const userService = {
  getMe: async () => {
    const res = await api.get("/user/me");
    return res.json();
  },
};
```

### Mobile - Mutation avec invalidation

```typescript
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileInput) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}
```

### API - Verification d'existence

```typescript
const [existing] = await db
  .select()
  .from(table)
  .where(eq(table.id, id))
  .limit(1);

if (!existing) {
  return c.json({ error: "NotFound", message: "Not found" }, 404);
}
```

### API - Creation avec ID

```typescript
const [created] = await db
  .insert(table)
  .values({ id: ulid(), ...data })
  .returning();

return c.json(created, 201);
```

## Regles importantes

1. **Async/Await** : Utiliser `async/await` partout, pas de callbacks
2. **Erreurs** : Format API = `{ error: "Type", message: "Description" }`
3. **IDs** : Utiliser `ulid()` pour generer les identifiants
4. **Validation** : Zod cote API, TypeScript strict cote mobile et web
5. **Server state** : React Query gere tout le server state (mobile + web)
6. **Client state** : Zustand uniquement pour formulaires multi-etapes (mobile)
7. **Imports** : Alias `@/*` sur mobile, relatifs sur web
8. **Marketing web** : Server Components (pas de `use client`)
9. **Admin web** : Client Components (`use client` + React Query)

## Structure des dossiers

### Mobile

```
apps/mobile/
├── app/            # Expo Router (file-based routing)
├── components/     # UI components (ui/ for base, feature-specific in features/)
├── features/       # Feature modules (components/, hooks/, lib/)
├── hooks/          # Global React Query hooks
├── services/       # HTTP wrappers par domaine
├── lib/            # Core utils (api, auth, query-client, websocket)
├── store/          # Zustand stores
├── types/          # TypeScript types par domaine
└── constants/      # Theme, colors
```

### Web

```
apps/web/src/
├── app/            # Next.js App Router ((marketing), (admin), (auth), api)
├── components/     # UI (ui/ shadcn, custom/ metier, sections/ marketing)
├── hooks/          # React Query hooks
├── lib/            # Utils (auth-client, api-client, config)
└── types/          # TypeScript types
```

### API

```
services/api/
├── db/             # Database schema (15 modules)
├── middleware/     # Auth, admin, org-member, CORS
├── server/         # Domain routers (17 domaines)
│   └── <domain>/   # router.ts, validators.ts, queries/, mutations/
└── types/          # TypeScript types
```
