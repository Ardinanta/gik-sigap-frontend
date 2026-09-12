import { apiClient, ensureCsrfCookie } from '../../../lib/axios'
import type { ApiResponse } from '../../auth/types/auth.types'
import type { CatalogFilters, CatalogResponse, CatalogSupply, Reservation, ReservationInput } from '../types/catalog.types'

export const catalogApi = {
  async list(filters: CatalogFilters) {
    const response = await apiClient.get<CatalogResponse>('/api/v1/catalog', { params: filters })
    return response.data
  },

  async detail(id: number) {
    const response = await apiClient.get<ApiResponse<CatalogSupply>>(`/api/v1/catalog/${id}`)
    return response.data.data
  },

  async reserve(id: number, payload: ReservationInput) {
    await ensureCsrfCookie()
    const response = await apiClient.post<ApiResponse<Reservation>>(`/api/v1/harvest-plans/${id}/reservations`, payload)
    return response.data
  },
}
