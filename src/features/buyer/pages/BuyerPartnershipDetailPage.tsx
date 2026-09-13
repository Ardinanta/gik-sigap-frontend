import { ArrowLeft, CalendarDays, MapPin, MessageCircle, Printer, Scale } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { usePartnershipDetail } from '../hooks/usePartnerships'
import { formatDate, formatPrice, formatVolume } from '../utils/catalogFormatters'

const labels = {
  interested: 'Minat Diajukan', discussing: 'Dalam Diskusi', matched: 'Menunggu Panen', completed: 'Selesai', cancelled: 'Dibatalkan',
} as const

export function BuyerPartnershipDetailPage() {
  const { partnershipId } = useParams()
  const id = Number(partnershipId)
  const detail = usePartnershipDetail(Number.isInteger(id) && id > 0 ? id : null)

  if (detail.isLoading) return <div className="rounded-2xl border border-line bg-white p-8 text-center text-ink-soft">Memuat detail kemitraan...</div>
  if (detail.isError || !detail.data) return <div className="rounded-2xl border border-line bg-white p-8 text-center"><p className="text-danger">Detail kemitraan tidak dapat dimuat.</p><Link className="mt-4 inline-flex rounded-md px-2 py-1 text-sm font-semibold text-tide transition-colors hover:bg-success-soft hover:text-tide-dark" to="/app/buyer/kemitraan">Kembali ke Kemitraan</Link></div>

  const item = detail.data
  const agreementReady = ['matched', 'completed'].includes(item.status) && item.agreed_volume_kg && item.agreed_price_per_kg

  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-10 print:max-w-none">
    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden"><Link className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-tide transition-colors hover:bg-success-soft hover:text-tide-dark" to="/app/buyer/kemitraan"><ArrowLeft size={18} /> Kembali ke Kemitraan</Link>{agreementReady && <button className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-tide hover:bg-success-soft hover:text-tide hover:shadow-sm active:translate-y-0 active:scale-[.98]" type="button" onClick={() => window.print()}><Printer size={17} /> Cetak Ringkasan Kesepakatan</button>}</div>
    <header className="rounded-2xl bg-tide p-6 text-white md:p-8"><span className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Detail Kemitraan #{item.id}</span><div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><h1 className="buyer-typography-page-title text-white!">{item.supply.pond_name}</h1><p className="mt-2 flex items-center gap-2 text-white/80"><MapPin size={17} /> {item.supply.farmer_name ?? 'Petambak'} · {item.supply.location.name}</p></div><span className="w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-bold">{labels[item.status]}</span></div></header>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Detail icon={Scale} label="Volume Disepakati" value={item.agreed_volume_kg ? `${formatVolume(item.agreed_volume_kg)} kg` : 'Belum disepakati'} /><Detail icon={CalendarDays} label="Estimasi Panen" value={formatDate(item.supply.harvest_date)} /><Detail icon={Scale} label="Ukuran Ikan" value={item.supply.fish_size.name} /><Detail icon={Scale} label="Harga" value={formatPrice(item.agreed_price_per_kg ?? item.supply.asking_price_per_kg)} /></section>
    {(item.notes || item.agreed_total) && <section className="rounded-2xl border border-line bg-white p-6"><h2 className="text-lg font-bold text-ink">Ringkasan Kesepakatan</h2>{item.agreed_total && <p className="mt-4 text-sm text-ink-soft">Nilai total <strong className="text-xl text-ink">Rp{new Intl.NumberFormat('id-ID').format(Number(item.agreed_total))}</strong></p>}{item.notes && <p className="mt-3 text-sm leading-6 text-ink-soft">{item.notes}</p>}<p className="mt-4 text-xs text-ink-soft">Ringkasan ini menampilkan data di SIGAP dan bukan dokumen legal yang telah ditandatangani.</p></section>}
    <section className="rounded-2xl border border-line bg-white p-6"><h2 className="text-lg font-bold text-ink">Riwayat Status</h2><div className="mt-5 flex flex-col">{item.history.length ? item.history.map((entry, index) => <div key={entry.id} className="grid grid-cols-[20px_1fr] gap-3"><div className="flex flex-col items-center"><span className="mt-1 size-3 rounded-full bg-tide" />{index < item.history.length - 1 && <span className="h-full w-px bg-line" />}</div><div className="pb-6"><strong className="text-sm text-ink">{labels[entry.to_status]}</strong><p className="mt-1 text-xs text-ink-soft">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(entry.changed_at))}{entry.changed_by_name ? ` · ${entry.changed_by_name}` : ''}</p>{entry.note && <p className="mt-2 text-sm text-ink-soft">{entry.note}</p>}</div></div>) : <p className="text-sm text-ink-soft">Riwayat status belum tersedia.</p>}</div></section>
    <div className="flex flex-wrap gap-3 print:hidden">
      {item.supply.whatsapp_url && <a className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-5 py-3 text-sm font-semibold text-tide shadow-sm transition-all hover:-translate-y-0.5 hover:border-tide hover:bg-success-soft hover:text-tide-dark hover:shadow-md active:translate-y-0 active:scale-[.98]" href={item.supply.whatsapp_url} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> WhatsApp</a>}
      {agreementReady && <Link className="inline-flex min-h-11 items-center rounded-lg bg-tide px-5 py-3 text-sm font-semibold text-white! shadow-sm transition-all hover:-translate-y-0.5 hover:bg-tide-dark hover:text-white! hover:shadow-md active:translate-y-0 active:scale-[.98]" to={`/app/buyer/kemitraan/${item.id}/serah-terima`}>{item.status === 'completed' ? 'Lihat Hasil Serah Terima' : item.handover.can_confirm ? 'Konfirmasi Timbang & Serah Terima' : `Menunggu Panen ${formatDate(item.supply.harvest_date)}`}</Link>}
    </div>
  </div>
}

function Detail({ icon: Icon, label, value }: { icon: typeof Scale; label: string; value: string }) { return <article className="rounded-2xl border border-line bg-white p-5"><Icon className="text-tide" size={20} /><span className="mt-4 block text-xs text-ink-soft">{label}</span><strong className="mt-1 block text-ink">{value}</strong></article> }
