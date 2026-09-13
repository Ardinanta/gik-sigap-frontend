import { LoaderCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useFarmerHarvestPlan } from '../hooks/useFarmerHarvestPlans'
import { FarmerHarvestPlansPage } from './FarmerHarvestPlansPage'

export function FarmerEditHarvestPlanPage() {
  const { harvestPlanId } = useParams()
  const id = Number(harvestPlanId)
  const detail = useFarmerHarvestPlan(Number.isInteger(id) && id > 0 ? id : null)

  if (detail.isLoading) return <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-ink-soft"><LoaderCircle className="animate-spin" size={18} /> Memuat rencana panen...</div>
  if (detail.isError || !detail.data) return <div className="mx-auto max-w-2xl rounded-xl border border-line bg-white p-6"><p role="alert" className="text-danger">Rencana panen tidak dapat dimuat atau Anda tidak memiliki akses.</p><button type="button" className="mt-4 font-semibold text-tide" onClick={() => detail.refetch()}>Coba Lagi</button><Link className="ml-4 text-tide" to="/app/farmer/rencana-panen">Kembali ke Rencana Panen</Link></div>
  if (detail.data.status !== 'planned') return <div className="mx-auto max-w-2xl rounded-xl border border-line bg-white p-6"><p>Rencana panen ini sudah selesai atau dibatalkan dan tidak dapat diubah.</p><Link className="mt-4 inline-flex text-tide" to="/app/farmer/rencana-panen">Kembali ke Rencana Panen</Link></div>

  return <FarmerHarvestPlansPage key={detail.data.id} editingPlan={detail.data} />
}
