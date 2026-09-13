import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { partnershipApi } from '../api/partnershipApi'
import { catalogKeys } from './useCatalog'
import { useCurrentUser } from '../../auth/hooks/useAuth'

export const partnershipKeys = {
  all: ['partnerships'] as const,
  handover: (id: number, userId: number) => [...partnershipKeys.all, 'handover', id, userId] as const,
  list: (view: 'active' | 'history', page: number) => [...partnershipKeys.all, 'list', view, page] as const,
  detail: (id: number) => [...partnershipKeys.all, 'detail', id] as const,
  reservations: (page: number) => [...partnershipKeys.all, 'reservations', page] as const,
  transactions: (page: number) => [...partnershipKeys.all, 'transactions', page] as const,
}

export function usePartnerships(view: 'active' | 'history', page: number, enabled = true) {
  return useQuery({
    queryKey: partnershipKeys.list(view, page),
    queryFn: () => partnershipApi.list(view, page),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function usePartnershipDetail(id: number | null) {
  return useQuery({
    queryKey: partnershipKeys.detail(id ?? 0),
    queryFn: () => partnershipApi.detail(id as number),
    enabled: id !== null,
  })
}

export function useHandover(id: number | null) {
  const user = useCurrentUser()
  return useQuery({
    queryKey: partnershipKeys.handover(id ?? 0, user.data?.id ?? 0),
    queryFn: () => partnershipApi.handover(id as number),
    enabled: id !== null && !!user.data,
    staleTime: 0,
  })
}

export function useConfirmHandover(id: number) {
  const user = useCurrentUser()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { volume_kg: string; version: number }) => partnershipApi.confirmHandover(id, payload),
    onSuccess: async (response) => {
      queryClient.setQueryData(partnershipKeys.handover(id, user.data?.id ?? 0), response.data)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: partnershipKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['farmer-partnerships'] }),
        queryClient.invalidateQueries({ queryKey: catalogKeys.all }),
      ])
    },
  })
}

export function usePendingReservations(page = 1, enabled = true) {
  return useQuery({
    queryKey: partnershipKeys.reservations(page),
    queryFn: () => partnershipApi.reservations('pending', page),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useTransactions(page: number) {
  return useQuery({
    queryKey: partnershipKeys.transactions(page),
    queryFn: () => partnershipApi.transactions(page),
    placeholderData: keepPreviousData,
  })
}

export function useCreatePartnership(demandId: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: partnershipApi.create,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: partnershipKeys.all }),
        demandId ? queryClient.invalidateQueries({ queryKey: ['recommendations', demandId] }) : Promise.resolve(),
      ])
    },
  })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: partnershipApi.cancelReservation,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: partnershipKeys.all }),
        queryClient.invalidateQueries({ queryKey: catalogKeys.all }),
      ])
    },
  })
}
