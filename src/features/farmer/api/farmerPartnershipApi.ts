import { apiClient, ensureCsrfCookie } from '../../../lib/axios'
import type { ApiResponse } from '../../auth/types/auth.types'
import type { FarmerPartnershipResponse, Partnership, Reservation, ReservationResponse, TransactionResponse } from '../../buyer/types/partnership.types'

export const farmerPartnershipApi = {
  async partnerships(view: 'active' | 'history', page = 1) {
    const response = await apiClient.get<FarmerPartnershipResponse>('/api/v1/farmer/partnerships', { params: { view, page } })
    return response.data
  },
  async detail(id: number) {
    const response = await apiClient.get<ApiResponse<Partnership>>(`/api/v1/farmer/partnerships/${id}`)
    return response.data.data
  },
  async confirmPartnership(id: number) {
    await ensureCsrfCookie()
    return (await apiClient.post<ApiResponse<Partnership>>(`/api/v1/farmer/partnerships/${id}/confirmation`)).data
  },
  async reservations(page = 1) {
    return (await apiClient.get<ReservationResponse>('/api/v1/farmer/reservations', { params: { page } })).data
  },
  async confirmReservation(id: number) {
    await ensureCsrfCookie()
    return (await apiClient.post<ApiResponse<Reservation>>(`/api/v1/farmer/reservations/${id}/confirmation`)).data
  },
  async transactions(page = 1) {
    return (await apiClient.get<TransactionResponse>('/api/v1/farmer/transactions', { params: { page } })).data
  },
}
