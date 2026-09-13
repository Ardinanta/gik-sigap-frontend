import { apiClient } from '../../../lib/axios'
import type { FarmerMatchingResponse } from '../types/farmerMatching.types'

export const farmerMatchingApi = {
  async list(harvestPlanId: number | null, page: number) {
    const response = await apiClient.get<FarmerMatchingResponse>('/api/v1/farmer/matches', {
      params: { harvest_plan_id: harvestPlanId ?? undefined, page },
    })
    return response.data
  },
}
