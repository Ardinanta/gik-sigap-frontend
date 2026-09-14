import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL?.trim() || '/'

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

let csrfPromise: Promise<void> | null = null

export function ensureCsrfCookie(): Promise<void> {
  if (!csrfPromise) {
    csrfPromise = apiClient
      .get('/sanctum/csrf-cookie')
      .then(() => undefined)
      .catch((error) => {
        // Reset so the next call retries instead of silently succeeding
        csrfPromise = null
        throw error
      })
  }
  return csrfPromise
}
