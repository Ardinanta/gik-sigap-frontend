import { useQuery } from '@tanstack/react-query'
import { farmerRiskApi } from '../api/farmerRiskApi'

export function useFarmerRisk(week?: string) {
  return useQuery({ queryKey: ['farmer-risk', week], queryFn: () => farmerRiskApi.dashboard(week), staleTime: 60_000 })
}
