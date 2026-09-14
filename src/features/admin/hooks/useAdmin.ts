import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/adminApi'
import type { AdminFilters } from '../types/admin.types'

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: (filters: AdminFilters) => ['admin', 'dashboard', filters] as const,
  harvestPlans: (filters: AdminFilters) => ['admin', 'harvest-plans', filters] as const,
  risks: (week?: string) => ['admin', 'risks', week] as const,
  risk: (id: number) => ['admin', 'risk', id] as const,
  transactions: (filters: AdminFilters) => ['admin', 'transactions', filters] as const,
  masterData: ['admin', 'master-data'] as const,
}

export const useAdminDashboard = (filters: AdminFilters = {}) => useQuery({ queryKey: adminKeys.dashboard(filters), queryFn: () => adminApi.dashboard(filters) })
export const useAdminHarvestPlans = (filters: AdminFilters = {}) => useQuery({ queryKey: adminKeys.harvestPlans(filters), queryFn: () => adminApi.harvestPlans(filters) })
export const useAdminRisks = (week?: string) => useQuery({ queryKey: adminKeys.risks(week), queryFn: () => adminApi.risks(week) })
export const useAdminRisk = (id: number | null) => useQuery({ queryKey: adminKeys.risk(id ?? 0), queryFn: () => adminApi.risk(id!), enabled: id !== null })
export const useAdminTransactions = (filters: AdminFilters = {}) => useQuery({ queryKey: adminKeys.transactions(filters), queryFn: () => adminApi.transactions(filters) })
export const useAdminMasterData = () => useQuery({ queryKey: adminKeys.masterData, queryFn: adminApi.masterData })
export function useCoordinateRisk() { const client = useQueryClient(); return useMutation({ mutationFn: adminApi.coordinateRisk, onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'risks'] }) }) }
export function useSaveMasterData() { const client = useQueryClient(); return useMutation({ mutationFn: ({ resource, id, payload }: { resource: 'locations' | 'fish-sizes' | 'risk-thresholds'; id?: number; payload: Record<string, unknown> }) => id ? adminApi.update(resource, id, payload) : adminApi.create(resource, payload), onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.masterData }) }) }
