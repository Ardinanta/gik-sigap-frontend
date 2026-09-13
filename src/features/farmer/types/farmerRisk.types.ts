export type RiskLevel = 'safe' | 'warning' | 'high'
export interface RiskRegion {
  location: { id: number; code: string; name: string }
  period_start: string
  period_end: string
  total_volume_kg: string
  threshold_volume_kg: string
  warning_ratio: string
  utilization_percentage: number
  risk_level: RiskLevel
  my_volume_kg: string
  other_volume_kg: string
  remaining_volume_kg: string
  source_note: string | null
}
export interface FarmerRiskDashboard {
  period: { start: string; end: string }
  summary: { safe_count: number; warning_count: number; high_count: number; configured_region_count: number }
  my_regions: RiskRegion[]
  regions: RiskRegion[]
  unconfigured_my_region_count: number
}
