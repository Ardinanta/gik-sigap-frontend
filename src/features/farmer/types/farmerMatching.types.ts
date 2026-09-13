import type { PaginatedResponse } from '../../buyer/types/buyerDemand.types'

interface Reference { id: number; code: string; name: string }

export interface FarmerMatch {
  id: number
  match_score: string
  matched_at: string
  buyer: { name: string | null; whatsapp_url: string | null }
  demand: {
    id: number
    required_volume_kg: string
    need_start_date: string
    need_end_date: string
    fish_size: Reference
    target_location: Reference | null
  }
  harvest_plan: {
    id: number
    pond_name: string
    estimated_volume_kg: string
    harvest_date: string
    fish_size: Reference
  }
}

export type FarmerMatchingResponse = PaginatedResponse<FarmerMatch>
