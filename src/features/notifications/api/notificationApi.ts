import { apiClient, ensureCsrfCookie } from '../../../lib/axios'
import type { ApiResponse } from '../../auth/types/auth.types'
import type { AppNotification, NotificationResponse } from '../types/notification.types'

export const notificationApi = {
  async list() {
    const response = await apiClient.get<NotificationResponse>('/api/v1/notifications', {
      params: { per_page: 15 },
    })
    return response.data
  },

  async markAsRead(id: string) {
    await ensureCsrfCookie()
    const response = await apiClient.patch<ApiResponse<AppNotification>>(`/api/v1/notifications/${id}/read`)
    return response.data.data
  },

  async markAllAsRead() {
    await ensureCsrfCookie()
    await apiClient.patch('/api/v1/notifications/read-all')
  },
}
