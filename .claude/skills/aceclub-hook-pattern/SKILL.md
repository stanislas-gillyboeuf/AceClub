# AceClub Hook Pattern

Use this skill when creating or modifying a React Query hook in the AceClub Expo app.

## Trigger

When creating or modifying a file under `apps/mobile/hooks/use-*.ts`.

## File Structure

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { domainService } from "@/services/domain";
import type { DomainType } from "@/types/domain";

// --- Queries ---

export function useDomain(id: string) {
  return useQuery({
    queryKey: ["domain", id],
    queryFn: () => domainService.getDomain(id),
    enabled: !!id,
  });
}

export function useDomains(params?: { status?: string }) {
  return useQuery({
    queryKey: ["domain", "list", params],
    queryFn: () => domainService.listDomains(params),
  });
}

// --- Mutations ---

export function useCreateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDomainRequest) => domainService.createDomain(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["domain", "list"] });
    },
  });
}
```

## Mandatory Rules

### 1. Query Keys: `["domain", "action", params?]`
```tsx
// Single item
queryKey: ["match", id]

// List
queryKey: ["match", "list", params]

// Infinite
queryKey: ["match", "infinite", params]

// Nested
queryKey: ["conversation", conversationId, "messages", params]
```

### 2. `enabled: !!id` for single-item queries
Always guard queries that depend on a dynamic ID:
```tsx
export function useMatch(id: string) {
  return useQuery({
    queryKey: ["match", id],
    queryFn: () => matchService.getMatch(id),
    enabled: !!id,
  });
}
```

### 3. Mutations: ALWAYS `onSettled` (NEVER `onSuccess` for invalidation)
`onSettled` fires whether the mutation succeeds OR fails, ensuring cache stays fresh.
```tsx
// GOOD
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ["domain", "list"] });
}

// BAD — stale cache on error
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["domain", "list"] });
}
```

**Exception**: `onSuccess` is valid when doing `setQueryData` (optimistic local updates), not `invalidateQueries`.

### 4. Signature for `onSettled` with variables
When you need access to variables:
```tsx
// No variables needed
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ["domain"] });
}

// Variables needed
onSettled: (_data, _err, variables) => {
  queryClient.invalidateQueries({ queryKey: ["domain", variables.id] });
}

// Variables is a primitive
onSettled: (_data, _err, id) => {
  queryClient.invalidateQueries({ queryKey: ["domain", id] });
}
```

### 5. Optimistic Updates (full pattern)
For instant UI feedback (used in `use-match.ts`):
```tsx
export function useUpdateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => domainService.update(id, data),
    onMutate: async ({ id, data }) => {
      // 1. Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ["domain", id] });
      // 2. Snapshot previous value
      const previous = queryClient.getQueryData(["domain", id]);
      // 3. Optimistically update cache
      if (previous) {
        queryClient.setQueryData(["domain", id], { ...previous, ...data });
      }
      // 4. Return snapshot for rollback
      return { previous };
    },
    onError: (_err, { id }, context) => {
      // 5. Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(["domain", id], context.previous);
      }
    },
    onSettled: (_, __, { id }) => {
      // 6. Always refetch from server
      queryClient.invalidateQueries({ queryKey: ["domain", id] });
      queryClient.invalidateQueries({ queryKey: ["domain", "list"] });
    },
  });
}
```

### 6. Helper functions for shared invalidation
When 2+ mutations share the same invalidation pattern, extract a helper:
```tsx
function settleDomain(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  queryClient.invalidateQueries({ queryKey: ["domain", id] });
  queryClient.invalidateQueries({ queryKey: ["domain", "list"] });
  queryClient.invalidateQueries({ queryKey: ["domain", "infinite"] });
}
```

### 7. Naming
- File: `use-<domain>.ts` in `hooks/`
- Query: `use<Domain>` or `use<Domain>s` for lists
- Mutation: `use<Action><Domain>` (e.g., `useCreateMatch`, `useDeleteComment`)

## Gold Standard Reference Files
- `apps/mobile/hooks/use-match.ts` — optimistic updates, helpers, full CRUD
- `apps/mobile/hooks/use-event.ts` — simple queries + mutations with onSettled
