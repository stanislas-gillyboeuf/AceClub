import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { GetGridResponse, TarifAuditLogEntry, TarifGrid } from "@/types/tarif-grid"

export function useTarifGrids(organizationId: string, seasonLabel?: string) {
  const searchParams = new URLSearchParams({ organizationId })
  if (seasonLabel) searchParams.set("seasonLabel", seasonLabel)

  return useQuery({
    queryKey: ["tarif-grids", organizationId, seasonLabel ?? null],
    queryFn: () => apiClient<{ grids: TarifGrid[] }>(`/pricing/grids?${searchParams.toString()}`),
    enabled: !!organizationId,
  })
}

export function useActiveTarifGrid(organizationId: string, seasonLabel: string | undefined) {
  return useQuery({
    queryKey: ["tarif-grid-active", organizationId, seasonLabel],
    queryFn: () =>
      apiClient<{ grid: TarifGrid | null }>(
        `/pricing/grids/active?organizationId=${organizationId}&seasonLabel=${encodeURIComponent(seasonLabel!)}`,
      ),
    enabled: !!organizationId && !!seasonLabel,
  })
}

export function useTarifGrid(gridId: string | undefined) {
  return useQuery({
    queryKey: ["tarif-grid", gridId],
    queryFn: () => apiClient<GetGridResponse>(`/pricing/grids/get?id=${gridId}`),
    enabled: !!gridId,
  })
}

export function useTarifGridAuditLog(gridId: string | undefined) {
  return useQuery({
    queryKey: ["tarif-grid-audit-log", gridId],
    queryFn: () => apiClient<{ logs: TarifAuditLogEntry[] }>(`/pricing/grids/audit-log?tarifGridId=${gridId}`),
    enabled: !!gridId,
  })
}
