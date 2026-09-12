import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { recommendationApi } from '../api/recommendationApi'

export const recommendationKeys = {
  all: ['recommendations'] as const,
  demand: (demandId: number) => [...recommendationKeys.all, demandId] as const,
}

export function useRecommendations(demandId: number | null) {
  return useQuery({
    queryKey: recommendationKeys.demand(demandId ?? 0),
    queryFn: () => recommendationApi.list(demandId as number),
    enabled: demandId !== null,
  })
}

export function useGenerateRecommendations(demandId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => recommendationApi.generate(demandId),
    onSuccess: (response) => queryClient.setQueryData(recommendationKeys.demand(demandId), response),
  })
}
