import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'https://unsecured-sanitizer-porcupine.ngrok-free.dev/'

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
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
