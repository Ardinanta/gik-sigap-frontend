import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { buyerDemandApi } from '../api/buyerDemandApi'

export const buyerDemandKeys = {
  all: ['buyer-demands'] as const,
  active: (page: number) => [...buyerDemandKeys.all, 'active', page] as const,
  fishSizes: ['master', 'fish-sizes'] as const,
  locations: ['locations', 'district'] as const,
}

export function useBuyerDemands(page: number) {
  return useQuery({
    queryKey: buyerDemandKeys.active(page),
    queryFn: () => buyerDemandApi.list(page),
    placeholderData: keepPreviousData,
  })
}

export function useCreateBuyerDemand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: buyerDemandApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: buyerDemandKeys.all }),
  })
}

export function useFishSizes() {
  return useQuery({
    queryKey: buyerDemandKeys.fishSizes,
    queryFn: buyerDemandApi.fishSizes,
    staleTime: 5 * 60_000,
  })
}

export function useBuyerLocations() {
  return useQuery({
    queryKey: buyerDemandKeys.locations,
    queryFn: buyerDemandApi.locations,
    staleTime: 5 * 60_000,
  })
}
