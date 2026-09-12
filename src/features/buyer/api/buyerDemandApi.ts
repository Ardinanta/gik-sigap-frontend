import { apiClient, ensureCsrfCookie } from '../../../lib/axios'
import type { ApiResponse, Location } from '../../auth/types/auth.types'
import type { BuyerDemand, BuyerDemandInput, FishSize, PaginatedResponse } from '../types/buyerDemand.types'

export const buyerDemandApi = {
  async list(page = 1) {
    const response = await apiClient.get<PaginatedResponse<BuyerDemand>>('/api/v1/buyer-demands', {
      params: { status: 'active', page, per_page: 5 },
    })
    return response.data
  },

  async create(payload: BuyerDemandInput) {
    await ensureCsrfCookie()
    const response = await apiClient.post<ApiResponse<BuyerDemand>>('/api/v1/buyer-demands', payload)
    return response.data
  },

  async fishSizes() {
    const response = await apiClient.get<ApiResponse<FishSize[]>>('/api/v1/fish-sizes')
    return response.data.data
  },

  async locations() {
    const response = await apiClient.get<ApiResponse<Location[]>>('/api/v1/locations', {
      params: { type: 'district' },
    })
    return response.data.data
  },
}
