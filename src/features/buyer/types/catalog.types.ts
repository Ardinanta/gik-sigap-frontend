import type { Location } from '../../auth/types/auth.types'
import type { FishSize, PaginatedResponse } from './buyerDemand.types'

export interface CatalogFilters {
  location_id?: number
  fish_size_id?: number
  start_date?: string
  end_date?: string
  page: number
  per_page: number
}

export interface CatalogSupply {
  id: number
  farmer_name: string
  location: Pick<Location, 'id' | 'code' | 'name'>
  fish_size: Pick<FishSize, 'id' | 'code' | 'name'>
  harvest_date: string
  pond_name: string
  pond_address: string | null
  coordinates: { latitude: string; longitude: string } | null
  estimated_volume_kg: string
  allocated_volume_kg: string
  reserved_volume_kg: string
  available_volume_kg: string
  asking_price_per_kg: string | null
  notes: string | null
  whatsapp_url: string | null
}

export interface ReservationInput {
  volume_kg: number
  notes: string | null
}

export interface Reservation {
  id: number
  harvest_plan: Pick<CatalogSupply, 'id' | 'pond_name'>
  reserved_volume_kg: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired'
  expires_at: string | null
  created_at: string
}

export type CatalogResponse = PaginatedResponse<CatalogSupply>
