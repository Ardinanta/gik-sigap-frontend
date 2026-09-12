import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { catalogApi } from '../api/catalogApi'
import type { CatalogFilters } from '../types/catalog.types'

export const catalogKeys = {
  all: ['catalog'] as const,
  list: (filters: CatalogFilters) => [...catalogKeys.all, 'list', filters] as const,
  detail: (id: number) => [...catalogKeys.all, 'detail', id] as const,
}

export function useCatalog(filters: CatalogFilters) {
  return useQuery({
    queryKey: catalogKeys.list(filters),
    queryFn: () => catalogApi.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useCatalogDetail(id: number | null) {
  return useQuery({
    queryKey: catalogKeys.detail(id ?? 0),
    queryFn: () => catalogApi.detail(id as number),
    enabled: id !== null,
  })
}
