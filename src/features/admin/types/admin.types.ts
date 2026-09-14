export interface AdminMeta { current_page: number; last_page: number; per_page: number; total: number }
export interface NamedItem { id: number; code: string; name: string }
export interface PricePoint { date: string; weighted_average_price: string; volume_kg: string; transaction_count: number }
export interface AdminTransaction { id: number; partnership_id: number; seller_name: string; buyer_name: string; location: NamedItem; fish_size: NamedItem; volume_kg: string; price_per_kg: string; total_value: string; transaction_date: string }
export interface TransactionSummary { transaction_count: number; transaction_volume_kg: string; transaction_value: string; weighted_average_price: string }
export interface AdminDashboard { period: { start: string; end: string }; risk_period: { start: string; end: string }; summary: { planned_supply_kg: string; active_demand_kg: string; active_match_count: number; warning_risk_count: number; high_risk_count: number; uncoordinated_risk_count: number } & TransactionSummary; risk_priorities: AdminRiskRegion[]; price_trend: PricePoint[]; latest_transactions: AdminTransaction[] }
export interface AdminHarvestPlan { id: number; farmer_name: string; pond_name: string; location: NamedItem; fish_size: NamedItem; harvest_date: string; estimated_volume_kg: string; asking_price_per_kg: string | null; status: 'planned' | 'completed' | 'cancelled' }
export interface HarvestPlanResponse { success: boolean; message: string; data: AdminHarvestPlan[]; summary: { plan_count: number; estimated_volume_kg: string }; meta: AdminMeta }
export type RiskLevel = 'safe' | 'warning' | 'high'
export interface AdminRiskRegion { id: number; location: NamedItem; period_start: string; period_end: string; total_volume_kg: string; threshold_volume_kg: string; utilization_percentage: number; risk_level: RiskLevel; coordination_status: 'uncoordinated' | 'coordinated'; coordinated_at: string | null; contributor_count: number }
export interface AdminRisks { period: { start: string; end: string }; summary: { safe_count: number; warning_count: number; high_count: number; uncoordinated_count: number }; regions: AdminRiskRegion[] }
export interface AdminRiskDetail extends AdminRiskRegion { coordinator_name: string | null; contributors: { harvest_plan_id: number; farmer_name: string; pond_name: string; harvest_date: string; fish_size_name: string; volume_kg: string }[]; suggestions: { id: number; harvest_plan_id: number; suggested_start_date: string; suggested_end_date: string; reason: string; status: string }[] }
export interface TransactionResponse { success: boolean; message: string; data: AdminTransaction[]; summary: TransactionSummary; price_trend: PricePoint[]; meta: AdminMeta }
export interface AdminLocation extends NamedItem { is_active: boolean }
export interface AdminFishSize extends NamedItem { min_weight_gram: string | null; max_weight_gram: string | null; is_active: boolean }
export interface AdminThreshold { id: number; location: NamedItem; period_type: string; threshold_volume_kg: string; warning_ratio: string; effective_from: string; effective_until: string | null; source_note: string | null; is_active: boolean }
export interface MasterData { locations: AdminLocation[]; fish_sizes: AdminFishSize[]; risk_thresholds: AdminThreshold[] }
export interface AdminFilters { page?: number; search?: string; status?: string; location_id?: number; fish_size_id?: number; date_from?: string; date_to?: string; week?: string }
