import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { authApi } from '../api/authApi'

export const authKeys = {
  user: ['auth', 'user'] as const,
  locations: ['locations', 'district'] as const,
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      try {
        return await authApi.me()
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return null
        throw error
      }
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => queryClient.setQueryData(authKeys.user, user),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (user) => queryClient.setQueryData(authKeys.user, user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear()
      queryClient.setQueryData(authKeys.user, null)
    },
  })
}

export function useLocations() {
  return useQuery({
    queryKey: authKeys.locations,
    queryFn: authApi.locations,
    staleTime: 5 * 60_000,
  })
}
