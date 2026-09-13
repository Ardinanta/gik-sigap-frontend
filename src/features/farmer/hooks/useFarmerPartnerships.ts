import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { farmerPartnershipApi } from '../api/farmerPartnershipApi'

const keys = { all: ['farmer-partnerships'] as const, list: (view: string, page: number) => ['farmer-partnerships', view, page] as const, detail: (id: number) => ['farmer-partnerships', 'detail', id] as const, reservations: (page: number) => ['farmer-reservations', page] as const, transactions: (page: number) => ['farmer-transactions', page] as const }

export function useFarmerPartnerships(view: 'active' | 'history', page: number, enabled = true) { return useQuery({ queryKey: keys.list(view, page), queryFn: () => farmerPartnershipApi.partnerships(view, page), enabled, placeholderData: keepPreviousData }) }
export function useFarmerPartnershipDetail(id: number | null) { return useQuery({ queryKey: keys.detail(id ?? 0), queryFn: () => farmerPartnershipApi.detail(id as number), enabled: id !== null }) }
export function useFarmerReservations(page: number, enabled = true) { return useQuery({ queryKey: keys.reservations(page), queryFn: () => farmerPartnershipApi.reservations(page), enabled, placeholderData: keepPreviousData }) }
export function useFarmerTransactions(page: number) { return useQuery({ queryKey: keys.transactions(page), queryFn: () => farmerPartnershipApi.transactions(page), placeholderData: keepPreviousData }) }
export function useConfirmFarmerPartnership() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: farmerPartnershipApi.confirmPartnership,
    onSuccess: async (response) => {
      client.setQueryData(keys.detail(response.data.id), response.data)
      await client.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useConfirmFarmerReservation() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: farmerPartnershipApi.confirmReservation,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['farmer-reservations'] }),
        client.invalidateQueries({ queryKey: keys.all }),
      ])
    },
  })
}
