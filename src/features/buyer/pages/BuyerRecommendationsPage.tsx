import { Sparkles } from 'lucide-react'
import { BuyerEmptyState } from '../components/BuyerEmptyState'

export function BuyerRecommendationsPage() {
  return <BuyerEmptyState icon={Sparkles} title="Rekomendasi" description="Belum ada rekomendasi pasokan. Rekomendasi akan dibuat dari kebutuhan aktif dan rencana panen yang sesuai." />
}
