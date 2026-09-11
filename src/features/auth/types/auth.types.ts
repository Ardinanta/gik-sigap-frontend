export type UserRole = 'farmer' | 'buyer' | 'admin'

export interface Location {
  id: number
  code: string | null
  name: string
  type: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  phone: string | null
  status: string
  location: Location | null
  roles: UserRole[]
  email_verified_at: string | null
  created_at: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export type FieldErrors = Record<string, string[]>

export interface ApiError {
  success?: boolean
  message?: string
  errors?: FieldErrors
}

export interface LoginInput {
  email: string
  password: string
  remember: boolean
}

export interface RegisterInput {
  name: string
  email: string
  phone: string
  location_id: number
  role: 'farmer' | 'buyer'
  password: string
  password_confirmation: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  token: string
  email: string
  password: string
  password_confirmation: string
}
