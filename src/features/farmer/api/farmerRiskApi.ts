import { apiClient } from '../../../lib/axios'
import type { ApiResponse } from '../../auth/types/auth.types'
import type { FarmerRiskDashboard } from '../types/farmerRisk.types'

export const farmerRiskApi = {
  async dashboard(week?: string) {
    const response = await apiClient.get<ApiResponse<FarmerRiskDashboard>>('/api/v1/farmer/risks', { params: { week } })
    return response.data.data
  },
}
