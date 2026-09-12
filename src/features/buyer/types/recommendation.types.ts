import type { BuyerDemand, PaginatedResponse } from './buyerDemand.types'
import type { CatalogSupply } from './catalog.types'

export interface Recommendation {
  id: number
  match_score: string
  score_category: 'Sangat Cocok' | 'Cocok' | 'Cukup Cocok' | 'Tidak Direkomendasikan'
  matched_volume_kg: string
  score_breakdown: {
    size: number
    location: number
    period: number
    volume: number
  }
  algorithm_version: string
  matched_at: string
  supply: CatalogSupply
}

export interface RecommendationResponse extends PaginatedResponse<Recommendation> {
  demand: BuyerDemand
}
