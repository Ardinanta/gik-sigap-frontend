import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { farmerMatchingApi } from '../api/farmerMatchingApi'

export function useFarmerMatches(harvestPlanId: number | null, page: number) {
  return useQuery({
    queryKey: ['farmer-matches', harvestPlanId, page],
    queryFn: () => farmerMatchingApi.list(harvestPlanId, page),
    placeholderData: keepPreviousData,
  })
}
