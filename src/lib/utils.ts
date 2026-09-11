import axios from 'axios'
import type { ApiError, FieldErrors } from '../features/auth/types/auth.types'

export function getApiError(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiError>(error)) {
    return { message: fallback, errors: {} as FieldErrors }
  }

  if (!error.response) {
    return {
      message: 'Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.',
      errors: {} as FieldErrors,
    }
  }

  if (error.response.status === 429) {
    return {
      message: 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
      errors: {} as FieldErrors,
    }
  }

  return {
    message: error.response.data?.message ?? fallback,
    errors: error.response.data?.errors ?? {},
  }
}
