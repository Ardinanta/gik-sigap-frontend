import { apiClient, ensureCsrfCookie } from '../../../lib/axios'
import type { ApiResponse } from '../../auth/types/auth.types'
import type { FarmerHarvestPlan, FarmerHarvestPlanInput, FarmerHarvestPlanResponse } from '../types/farmerHarvestPlan.types'

function formData(payload: FarmerHarvestPlanInput) {
  const data = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== '') data.append(key, value instanceof File ? value : String(value))
  })
  return data
}

export const farmerHarvestPlanApi = {
  async detail(id: number) {
    const response = await apiClient.get<ApiResponse<FarmerHarvestPlan>>(`/api/v1/farmer/harvest-plans/${id}`)
    return response.data.data
  },
  async list() {
    const response = await apiClient.get<FarmerHarvestPlanResponse>('/api/v1/farmer/harvest-plans', { params: { status: 'planned', per_page: 50 } })
    return response.data
  },
  async create(payload: FarmerHarvestPlanInput) {
    await ensureCsrfCookie()
    const response = await apiClient.post<ApiResponse<FarmerHarvestPlan>>('/api/v1/farmer/harvest-plans', formData(payload))
    return response.data
  },
  async update(id: number, payload: FarmerHarvestPlanInput) {
    await ensureCsrfCookie()
    const data = formData(payload)
    data.append('_method', 'PATCH')
    const response = await apiClient.post<ApiResponse<FarmerHarvestPlan>>(`/api/v1/farmer/harvest-plans/${id}`, data)
    return response.data
  },
}
