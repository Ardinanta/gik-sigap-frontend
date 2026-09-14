import { apiClient, ensureCsrfCookie } from '../../../lib/axios'
import type { ApiResponse } from '../../auth/types/auth.types'
import type { AdminDashboard, AdminFilters, AdminRiskDetail, AdminRisks, HarvestPlanResponse, MasterData, TransactionResponse } from '../types/admin.types'

const params = (filters: AdminFilters) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined))

export const adminApi = {
  async dashboard(filters: AdminFilters = {}) { const response = await apiClient.get<ApiResponse<AdminDashboard>>('/api/v1/admin/dashboard', { params: params(filters) }); return response.data.data },
  async harvestPlans(filters: AdminFilters = {}) { const response = await apiClient.get<HarvestPlanResponse>('/api/v1/admin/harvest-plans', { params: params(filters) }); return response.data },
  async risks(week?: string) { const response = await apiClient.get<ApiResponse<AdminRisks>>('/api/v1/admin/risks', { params: { week } }); return response.data.data },
  async risk(id: number) { const response = await apiClient.get<ApiResponse<AdminRiskDetail>>(`/api/v1/admin/risks/${id}`); return response.data.data },
  async coordinateRisk(id: number) { await ensureCsrfCookie(); const response = await apiClient.patch<ApiResponse<AdminRiskDetail>>(`/api/v1/admin/risks/${id}/coordination`); return response.data.data },
  async transactions(filters: AdminFilters = {}) { const response = await apiClient.get<TransactionResponse>('/api/v1/admin/transactions', { params: params(filters) }); return response.data },
  async masterData() { const response = await apiClient.get<ApiResponse<MasterData>>('/api/v1/admin/master-data'); return response.data.data },
  async create(resource: 'locations' | 'fish-sizes' | 'risk-thresholds', payload: Record<string, unknown>) { await ensureCsrfCookie(); return (await apiClient.post(`/api/v1/admin/${resource}`, payload)).data },
  async update(resource: 'locations' | 'fish-sizes' | 'risk-thresholds', id: number, payload: Record<string, unknown>) { await ensureCsrfCookie(); return (await apiClient.patch(`/api/v1/admin/${resource}/${id}`, payload)).data },
}
