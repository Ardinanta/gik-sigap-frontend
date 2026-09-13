import type { PaginatedResponse } from './buyerDemand.types'

export type PartnershipStatus = 'interested' | 'discussing' | 'matched' | 'completed' | 'cancelled'
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired'

interface NamedReference {
  id: number
  code: string
  name: string
}

export interface PartnershipHistory {
  id: number
  from_status: PartnershipStatus | null
  to_status: PartnershipStatus
  note: string | null
  changed_at: string
  changed_by_name: string | null
}

export interface Transaction {
  id: number
  partnership_id: number
  seller_name: string | null
  buyer_name?: string | null
  location: NamedReference
  commodity: NamedReference
  fish_size: NamedReference
  volume_kg: string
  price_per_kg: string
  total_value: string
  transaction_date: string
  locked_at: string | null
  created_at: string
}

export interface Partnership {
  buyer?: { id: number; name: string | null; whatsapp_url?: string | null }
  handover: {
    version: number
    can_confirm: boolean
    unavailable_reason: string | null
    seller_weight_kg: string | null
    buyer_weight_kg: string | null
    seller_confirmed_at: string | null
    buyer_confirmed_at: string | null
  }
  id: number
  match_id: number | null
  status: PartnershipStatus
  agreed_volume_kg: string | null
  proposed_volume_kg: string | null
  agreed_price_per_kg: string | null
  agreed_total: string | null
  notes: string | null
  started_at: string
  completed_at: string | null
  cancelled_at: string | null
  supply: {
    id: number
    farmer_name: string | null
    pond_name: string
    location: NamedReference
    commodity: NamedReference
    fish_size: NamedReference
    harvest_date: string
    asking_price_per_kg: string | null
    whatsapp_url: string | null
  }
  history: PartnershipHistory[]
  transaction: Transaction | null
}

export interface PartnershipSummary {
  active_count: number
  agreed_volume_kg: string
  harvest_start_date: string | null
  harvest_end_date: string | null
  pending_reservation_count: number
}

export interface FarmerPartnershipSummary {
  active_count: number
  agreed_volume_kg: string
  harvest_start_date: string | null
  harvest_end_date: string | null
  pending_request_count: number
}

export interface FarmerPartnershipResponse extends PaginatedResponse<Partnership> {
  summary: FarmerPartnershipSummary
}

export interface PartnershipResponse extends PaginatedResponse<Partnership> {
  summary: PartnershipSummary
}

export interface Reservation {
  id: number
  buyer?: { id: number; name: string; whatsapp_url: string | null } | null
  harvest_plan: {
    id: number
    pond_name: string
    farmer_name: string | null
    location: NamedReference
    fish_size: NamedReference
    harvest_date: string
    asking_price_per_kg: string | null
    whatsapp_url: string | null
  }
  reserved_volume_kg: string
  estimated_total: string | null
  notes: string | null
  status: ReservationStatus
  expires_at: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  created_at: string
}

export type ReservationResponse = PaginatedResponse<Reservation>
export type TransactionResponse = PaginatedResponse<Transaction>
