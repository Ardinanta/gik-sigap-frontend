import { apiClient, ensureCsrfCookie } from '../../../lib/axios'
import type {
  ApiResponse,
  AuthUser,
  ForgotPasswordInput,
  Location,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../types/auth.types'

async function postWithCsrf<T>(url: string, payload?: unknown) {
  await ensureCsrfCookie()
  const response = await apiClient.post<ApiResponse<T>>(url, payload)
  return response.data
}

export const authApi = {
  async me() {
    const response = await apiClient.get<ApiResponse<AuthUser>>('/api/v1/auth/me')
    return response.data.data
  },

  async login(payload: LoginInput) {
    const response = await postWithCsrf<AuthUser>('/api/v1/auth/login', payload)
    return response.data
  },

  async register(payload: RegisterInput) {
    const response = await postWithCsrf<AuthUser>('/api/v1/auth/register', payload)
    return response.data
  },

  async logout() {
    return postWithCsrf<null>('/api/v1/auth/logout')
  },

  async forgotPassword(payload: ForgotPasswordInput) {
    return postWithCsrf<null>('/api/v1/auth/forgot-password', payload)
  },

  async resetPassword(payload: ResetPasswordInput) {
    return postWithCsrf<null>('/api/v1/auth/reset-password', payload)
  },

  async locations() {
    const response = await apiClient.get<ApiResponse<Location[]>>('/api/v1/locations', {
      params: { type: 'district' },
    })
    return response.data.data
  },
}
