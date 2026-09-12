import type { Location } from '../../auth/types/auth.types'

export interface FishSize {
  id: number
  code: string
  name: string
  min_weight_gram: string | null
  max_weight_gram: string | null
}

export interface BuyerDemand {
  id: number
  fish_size: Pick<FishSize, 'id' | 'code' | 'name'>
  target_location: Pick<Location, 'id' | 'code' | 'name'> | null
  required_volume_kg: string
  need_start_date: string
  need_end_date: string
  status: 'active' | 'fulfilled' | 'cancelled' | 'expired'
  notes: string | null
  created_at: string
}

export interface BuyerDemandInput {
  fish_size_id: number
  required_volume_kg: number
  target_location_id: number | null
  need_start_date: string
  need_end_date: string
  notes: string | null
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
