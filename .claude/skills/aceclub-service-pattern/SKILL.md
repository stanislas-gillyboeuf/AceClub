# AceClub Service Pattern

Use this skill when creating or modifying an API service in the AceClub Expo app.

## Trigger

When creating or modifying a file under `apps/mobile/services/`.

## File Structure

```tsx
import { api } from "@/lib/api";
import type { DomainType, ListResponse, CreateRequest } from "@/types/domain";

export const domainService = {
  getDomain: (id: string) =>
    api.get<DomainType>(`/domain/${id}`),

  listDomains: (params?: { status?: string; limit?: number }) =>
    api.get<ListResponse>("/domain", params),

  createDomain: (data: CreateRequest) =>
    api.post<DomainType>("/domain", data),

  updateDomain: (id: string, data: Partial<CreateRequest>) =>
    api.put<DomainType>(`/domain/${id}`, data),

  deleteDomain: (id: string) =>
    api.delete<{ success: boolean }>(`/domain/${id}`),
};
```

## Mandatory Rules

### 1. Const object export
```tsx
// GOOD
export const domainService = { ... };

// BAD — no class, no default export
export default class DomainService { ... }
```

### 2. Thin wrappers — no async/await unless transforming data
```tsx
// GOOD — direct return (no async/await needed)
getDomain: (id: string) =>
  api.get<DomainType>(`/domain/${id}`),

// GOOD — async/await ONLY when transformation is needed
getProcessedDomain: async (id: string) => {
  const data = await api.get<RawDomain>(`/domain/${id}`);
  return { ...data, fullName: `${data.firstName} ${data.lastName}` };
},

// BAD — unnecessary async/await
getDomain: async (id: string) => {
  return await api.get<DomainType>(`/domain/${id}`);
},
```

### 3. Always typed with generics
```tsx
// GOOD
api.get<User>("/user/me")
api.post<CreateMatchResponse>("/match", data)
api.delete<{ success: boolean }>(`/match/${id}`)

// BAD — untyped
api.get("/user/me")
```

### 4. Naming
- File: `<domain>.ts` in `services/`
- Export: `<domain>Service`
- Methods: camelCase matching the API action

### 5. No business logic
Services are pure HTTP wrappers. All business logic lives in hooks or components.
```tsx
// BAD — business logic in service
createMatch: async (data: CreateRequest) => {
  if (!data.players.length) throw new Error("Need players"); // NO
  return api.post("/match", data);
},

// GOOD — validation belongs in the hook or component
createMatch: (data: CreateRequest) =>
  api.post<CreateMatchResponse>("/match", data),
```

### 6. Query parameters as object
```tsx
// GOOD — params object for GET queries
listDomains: (params?: { status?: string; limit?: number; offset?: number }) =>
  api.get<ListResponse>("/domain", params),

// GOOD — individual params for simple cases
searchUsers: (query: string, limit = 10) =>
  api.get<SearchResponse>("/user/search", { query, limit }),
```

## Gold Standard Reference Files
- `apps/mobile/services/user.ts` — simple CRUD service
- `apps/mobile/services/match.ts` — full CRUD with nested resources
