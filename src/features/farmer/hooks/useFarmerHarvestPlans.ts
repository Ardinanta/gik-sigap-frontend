import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { farmerHarvestPlanApi } from '../api/farmerHarvestPlanApi'
import type { FarmerHarvestPlanInput } from '../types/farmerHarvestPlan.types'

export const farmerHarvestPlanKeys = { all: ['farmer-harvest-plans'] as const }

export function useFarmerHarvestPlans(enabled = true) {
  return useQuery({ queryKey: farmerHarvestPlanKeys.all, queryFn: farmerHarvestPlanApi.list, enabled })
}

export function useFarmerHarvestPlan(id: number | null) {
  return useQuery({ queryKey: [...farmerHarvestPlanKeys.all, 'detail', id], queryFn: () => farmerHarvestPlanApi.detail(id as number), enabled: id !== null })
}

export function useSaveFarmerHarvestPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | null; payload: FarmerHarvestPlanInput }) => id ? farmerHarvestPlanApi.update(id, payload) : farmerHarvestPlanApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: farmerHarvestPlanKeys.all }),
  })
}
