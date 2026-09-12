import { apiClient, ensureCsrfCookie } from '../../../lib/axios'
import type { RecommendationResponse } from '../types/recommendation.types'

export const recommendationApi = {
  async list(demandId: number) {
    const response = await apiClient.get<RecommendationResponse>(`/api/v1/buyer-demands/${demandId}/matches`)
    return response.data
  },

  async generate(demandId: number) {
    await ensureCsrfCookie()
    const response = await apiClient.post<RecommendationResponse>(`/api/v1/buyer-demands/${demandId}/matches/generate`)
    return response.data
  },
}
