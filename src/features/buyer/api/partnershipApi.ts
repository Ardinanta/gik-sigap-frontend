import { apiClient, ensureCsrfCookie } from '../../../lib/axios'
import type { ApiResponse } from '../../auth/types/auth.types'
import type {
  Partnership,
  PartnershipHistory,
  PartnershipResponse,
  Reservation,
  ReservationResponse,
  Transaction,
  TransactionResponse,
} from '../types/partnership.types'

export const partnershipApi = {
  async handover(id: number) {
    const response = await apiClient.get<ApiResponse<Partnership>>(`/api/v1/partnerships/${id}/handover`)
    return response.data.data
  },

  async confirmHandover(id: number, payload: { volume_kg: string; version: number }) {
    await ensureCsrfCookie()
    const response = await apiClient.post<ApiResponse<Partnership>>(`/api/v1/partnerships/${id}/handover`, payload)
    return response.data
  },
  async list(view: 'active' | 'history', page = 1) {
    const response = await apiClient.get<PartnershipResponse>('/api/v1/partnerships', {
      params: { view, page },
    })
    return response.data
  },

  async detail(id: number) {
    const response = await apiClient.get<ApiResponse<Partnership>>(`/api/v1/partnerships/${id}`)
    return response.data.data
  },

  async history(id: number) {
    const response = await apiClient.get<ApiResponse<PartnershipHistory[]>>(`/api/v1/partnerships/${id}/history`)
    return response.data.data
  },

  async create(matchId: number) {
    await ensureCsrfCookie()
    const response = await apiClient.post<ApiResponse<Partnership>>(`/api/v1/matches/${matchId}/partnership`)
    return response.data
  },

  async reservations(status: Reservation['status'] = 'pending', page = 1) {
    const response = await apiClient.get<ReservationResponse>('/api/v1/reservations', {
      params: { status, page },
    })
    return response.data
  },

  async cancelReservation(id: number) {
    await ensureCsrfCookie()
    const response = await apiClient.delete<ApiResponse<Reservation>>(`/api/v1/reservations/${id}`)
    return response.data
  },

  async transactions(page = 1) {
    const response = await apiClient.get<TransactionResponse>('/api/v1/transactions', { params: { page } })
    return response.data
  },

  async transaction(id: number) {
    const response = await apiClient.get<ApiResponse<Transaction>>(`/api/v1/transactions/${id}`)
    return response.data.data
  },
}
