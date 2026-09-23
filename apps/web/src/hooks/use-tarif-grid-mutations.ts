import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type {
  AgeCategoryItemInput,
  BaseRateItemInput,
  Breakdown,
  CreateAdditionalLineInput,
  CreateGridInput,
  CreateRuleInput,
  LessonRateItemInput,
  MemberPricingProfile,
  TarifAdditionalLine,
  TarifAgeCategory,
  TarifBaseRate,
  TarifGrid,
  TarifLessonRate,
  TarifRule,
  UpdateAdditionalLineInput,
  UpdateGridSettingsInput,
  UpdateRuleInput,
} from "@/types/tarif-grid"

/** Every content mutation may trigger copy-on-write versioning server-side and come back with a
 * DIFFERENT gridId than the one sent (the active grid gets cloned into a new draft/active row).
 * Callers must always re-point their local "current grid id" state at the id in the response —
 * never assume the sent gridId is still the right one to keep querying. */
function settleTarifGrid(queryClient: ReturnType<typeof useQueryClient>, gridId: string | undefined) {
  queryClient.invalidateQueries({ queryKey: ["tarif-grid", gridId] })
  queryClient.invalidateQueries({ queryKey: ["tarif-grids"] })
  queryClient.invalidateQueries({ queryKey: ["tarif-grid-active"] })
  queryClient.invalidateQueries({ queryKey: ["tarif-grid-audit-log", gridId] })
}

export function useCreateTarifGrid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGridInput) =>
      apiClient<{ grid: TarifGrid }>("/pricing/grids/create", { method: "POST", body: JSON.stringify(data) }),
    onSettled: (data) => settleTarifGrid(queryClient, data?.grid.id),
  })
}

export function useUpdateGridSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateGridSettingsInput) =>
      apiClient<{ grid: TarifGrid }>("/pricing/grids/update-settings", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.grid.id ?? variables.gridId),
  })
}

export function useActivateTarifGrid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (gridId: string) =>
      apiClient<{ grid: TarifGrid }>("/pricing/grids/activate", { method: "POST", body: JSON.stringify({ gridId }) }),
    onSettled: (data, _err, gridId) => settleTarifGrid(queryClient, data?.grid.id ?? gridId),
  })
}

export function useUpsertAgeCategories() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { gridId: string; items: AgeCategoryItemInput[] }) =>
      apiClient<{ gridId: string; categories: TarifAgeCategory[] }>("/pricing/age-categories/upsert", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.gridId ?? variables.gridId),
  })
}

export function useUpsertBaseRates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { gridId: string; items: BaseRateItemInput[] }) =>
      apiClient<{ gridId: string; baseRates: TarifBaseRate[] }>("/pricing/base-rates/upsert", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.gridId ?? variables.gridId),
  })
}

export function useUpsertLessonRates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { gridId: string; items: LessonRateItemInput[] }) =>
      apiClient<{ gridId: string; lessonRates: TarifLessonRate[] }>("/pricing/lesson-rates/upsert", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.gridId ?? variables.gridId),
  })
}

export function useCreateAdditionalLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAdditionalLineInput) =>
      apiClient<{ gridId: string; additionalLine: TarifAdditionalLine }>("/pricing/additional-lines/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.gridId ?? variables.gridId),
  })
}

export function useUpdateAdditionalLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateAdditionalLineInput) =>
      apiClient<{ gridId: string; additionalLine: TarifAdditionalLine }>("/pricing/additional-lines/update", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.gridId ?? variables.gridId),
  })
}

export function useDeleteAdditionalLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { gridId: string; additionalLineId: string }) =>
      apiClient<{ gridId: string; success: boolean }>("/pricing/additional-lines/delete", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.gridId ?? variables.gridId),
  })
}

export function useCreateRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRuleInput) =>
      apiClient<{ gridId: string; rule: TarifRule }>("/pricing/rules/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.gridId ?? variables.gridId),
  })
}

export function useUpdateRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateRuleInput) =>
      apiClient<{ gridId: string; rule: TarifRule }>("/pricing/rules/update", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.gridId ?? variables.gridId),
  })
}

export function useDeleteRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { gridId: string; ruleId: string }) =>
      apiClient<{ gridId: string; success: boolean }>("/pricing/rules/delete", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.gridId ?? variables.gridId),
  })
}

export function useReorderRules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { gridId: string; orderedRuleIds: string[] }) =>
      apiClient<{ gridId: string; rules: TarifRule[] }>("/pricing/rules/reorder", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.gridId ?? variables.gridId),
  })
}

export function useDuplicateRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { gridId: string; ruleId: string }) =>
      apiClient<{ gridId: string; rule: TarifRule }>("/pricing/rules/duplicate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.gridId ?? variables.gridId),
  })
}

export function useToggleRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { gridId: string; ruleId: string; isActive: boolean }) =>
      apiClient<{ gridId: string; rule: TarifRule }>("/pricing/rules/toggle", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled: (data, _err, variables) => settleTarifGrid(queryClient, data?.gridId ?? variables.gridId),
  })
}

/** Read-only — never triggers versioning, never invalidates anything. Called on every simulator
 * debounce tick, so it stays a plain mutation rather than a cached query. */
export function useSimulateTarifGrid() {
  return useMutation({
    mutationFn: (data: { gridId: string; profile: MemberPricingProfile }) =>
      apiClient<Breakdown>("/pricing/grids/simulate", { method: "POST", body: JSON.stringify(data) }),
  })
}
