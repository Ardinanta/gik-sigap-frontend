import { Search } from 'lucide-react'
import { BuyerEmptyState } from '../components/BuyerEmptyState'

export function BuyerSupplyPage() {
  return <BuyerEmptyState icon={Search} title="Cari Pasokan" description="Katalog pasokan belum tersedia. Nantinya Anda dapat mencari rencana panen berdasarkan lokasi, ukuran bandeng, dan periode." />
}
