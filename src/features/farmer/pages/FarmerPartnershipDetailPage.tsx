import { ArrowLeft, CalendarDays, MessageCircle, Scale } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { formatDate, formatPrice, formatVolume } from '../../buyer/utils/catalogFormatters'
import { useFarmerPartnershipDetail } from '../hooks/useFarmerPartnerships'

export function FarmerPartnershipDetailPage() {
  const id = Number(useParams().partnershipId)
  const detail = useFarmerPartnershipDetail(Number.isInteger(id) && id > 0 ? id : null)
  if (detail.isLoading) return <div className="rounded-xl border border-line bg-white p-8 text-center text-ink-soft">Memuat detail kemitraan...</div>
  if (detail.isError || !detail.data) return <div className="rounded-xl border border-line bg-white p-8 text-center text-danger">Detail kemitraan tidak dapat dimuat.</div>
  const item = detail.data
  return <div className="mx-auto grid w-full max-w-5xl gap-5 pb-10 text-ink">
    <Link className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-tide" to="/app/farmer/kemitraan"><ArrowLeft size={17} /> Kembali ke Kemitraan</Link>
    <header className="rounded-xl border border-line bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs font-semibold uppercase text-tide">Detail Kemitraan #{item.id}</span><h1 className="mt-2 text-2xl font-bold">{item.buyer?.name ?? 'Pembeli SIGAP'}</h1><p className="mt-1 text-sm text-ink-soft">{item.supply.pond_name} · {item.supply.location.name}</p></div><span className="rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">{item.status === 'completed' ? 'Selesai' : item.status === 'matched' ? 'Menunggu Panen' : 'Dalam Proses'}</span></div></header>
    <section className="grid gap-3 sm:grid-cols-3"><Card icon={Scale} label="Volume Disepakati" value={item.agreed_volume_kg ? `${formatVolume(item.agreed_volume_kg)} kg` : 'Belum disepakati'} /><Card icon={Scale} label="Harga Satuan" value={formatPrice(item.agreed_price_per_kg ?? item.supply.asking_price_per_kg)} /><Card icon={CalendarDays} label="Tanggal Panen" value={formatDate(item.supply.harvest_date)} /></section>
    <section className="rounded-xl border border-line bg-white p-6"><h2 className="font-bold">Riwayat Status</h2><div className="mt-4 grid gap-3">{item.history.length ? item.history.map((entry) => <div key={entry.id} className="border-l-2 border-tide pl-4"><strong className="text-sm">{entry.note ?? entry.to_status}</strong><p className="text-xs text-ink-soft">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(entry.changed_at))}</p></div>) : <p className="text-sm text-ink-soft">Belum ada riwayat.</p>}</div></section>
    <div className="flex flex-wrap gap-2">{item.buyer?.whatsapp_url && <a className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold" href={item.buyer.whatsapp_url} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Hubungi Pembeli</a>}{['matched', 'completed'].includes(item.status) && <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-tide bg-tide px-5 py-2.5 text-sm font-semibold no-underline shadow-sm transition-all hover:border-tide-dark hover:bg-tide-dark hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide active:scale-[.98]" style={{ color: '#fff' }} to={`/app/farmer/kemitraan/${item.id}/serah-terima`}><Scale size={17} />{item.status === 'completed' ? 'Lihat Serah Terima' : item.handover.can_confirm ? 'Konfirmasi Timbang & Serah Terima' : `Menunggu Panen ${formatDate(item.supply.harvest_date)}`}</Link>}</div>
  </div>
}

function Card({ icon: Icon, label, value }: { icon: typeof Scale; label: string; value: string }) { return <article className="rounded-xl border border-line bg-white p-5"><Icon className="text-tide" size={19} /><span className="mt-3 block text-xs text-ink-soft">{label}</span><strong className="mt-1 block">{value}</strong></article> }
