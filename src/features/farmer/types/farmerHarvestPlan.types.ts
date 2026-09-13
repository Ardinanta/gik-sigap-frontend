import type { Location } from '../../auth/types/auth.types'
import type { FishSize, PaginatedResponse } from '../../buyer/types/buyerDemand.types'

export type HarvestPlanStatus = 'planned' | 'completed' | 'cancelled'

export interface FarmerHarvestPlan {
  id: number
  pond_name: string
  pond_address: string | null
  location: Location
  fish_size: FishSize
  estimated_volume_kg: string
  asking_price_per_kg: string | null
  harvest_date: string
  status: HarvestPlanStatus
  notes: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export type FarmerHarvestPlanResponse = PaginatedResponse<FarmerHarvestPlan>

export interface FarmerHarvestPlanInput {
  pond_name: string
  location_id: number
  fish_size_id: number
  estimated_volume_kg: number
  harvest_date: string
  asking_price_per_kg: number | null
  pond_address: string | null
  notes: string | null
  photo: File | null
}
