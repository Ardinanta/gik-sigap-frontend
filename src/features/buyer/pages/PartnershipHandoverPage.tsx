import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Scale,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { getApiError } from '../../../lib/utils'
import { useCurrentUser } from '../../auth/hooks/useAuth'
import { useConfirmHandover, useHandover } from '../hooks/usePartnerships'
import type { Partnership } from '../types/partnership.types'
import { formatDate, formatVolume } from '../utils/catalogFormatters'

const rupiah = (value: string) => `Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Number(value))}`
const formatPrice = (value: string | null) => value ? `${rupiah(value)}/kg` : 'Belum disepakati'
const timestamp = (value: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export function PartnershipHandoverPage() {
  const { partnershipId } = useParams()
  const id = Number(partnershipId)
  const detail = useHandover(Number.isInteger(id) && id > 0 ? id : null)
  const user = useCurrentUser()
  const back = Number.isInteger(id) && id > 0
    ? user.data?.roles.includes('farmer')
      ? `/app/farmer/kemitraan/${id}`
      : `/app/buyer/kemitraan/${id}`
    : '/app'

  if (detail.isLoading) {
    return <div className="grid min-h-48 place-items-center rounded-xl border border-line bg-white text-ink-soft"><span className="inline-flex items-center gap-2 text-sm"><LoaderCircle className="animate-spin" size={20} /> Memuat data penyerahan...</span></div>
  }

  if (!detail.data || detail.isError) {
    return <div className="rounded-xl border border-line bg-white p-6 text-center"><p role="alert" className="text-danger">Data penyerahan tidak dapat dimuat atau Anda tidak memiliki akses.</p><div className="mt-4 flex flex-wrap justify-center gap-2"><button type="button" className="min-h-10 rounded-lg bg-tide px-4 text-sm font-semibold text-white transition-colors enabled:hover:bg-tide-dark enabled:active:scale-[.98]" onClick={() => detail.refetch()}>Coba Lagi</button><Link className="inline-flex min-h-10 items-center rounded-lg border border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-tide hover:bg-success-soft hover:text-tide" to={back}>Kembali</Link></div></div>
  }

  return <HandoverContent key={detail.data.id} item={detail.data} buyer={detail.data.buyer?.id === user.data?.id} back={back} refresh={() => detail.refetch()} refreshing={detail.isFetching} />
}

function HandoverContent({ item, buyer, back, refresh, refreshing }: { item: Partnership; buyer: boolean; back: string; refresh: () => unknown; refreshing: boolean }) {
  const confirmation = useConfirmHandover(item.id)
  const [weight, setWeight] = useState<string | null>(null)
  const [review, setReview] = useState<{ volume_kg: string; version: number } | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const handover = item.handover
  const completed = item.status === 'completed'
  const canConfirm = handover.can_confirm
  const ownWeight = buyer ? handover.buyer_weight_kg : handover.seller_weight_kg
  const partnerWeight = buyer ? handover.seller_weight_kg : handover.buyer_weight_kg
  const value = weight ?? ownWeight ?? partnerWeight ?? ''
  const mismatch = handover.buyer_weight_kg !== null && handover.seller_weight_kg !== null && handover.buyer_weight_kg !== handover.seller_weight_kg

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) <= 0 || Number(value) > 9999999999.99) {
      setError('Masukkan berat lebih dari nol, maksimal dua angka desimal.')
      return
    }
    setReview({ volume_kg: value, version: handover.version })
  }

  const confirm = async () => {
    if (!review) return
    try {
      const result = await confirmation.mutateAsync(review)
      setReview(null)
      setWeight(null)
      setError('')
      setMessage(result.message)
    } catch (failure) {
      setError(getApiError(failure, 'Konfirmasi belum tersimpan. Silakan coba lagi.').message)
      setReview(null)
      refresh()
    }
  }

  const statusLabel = completed ? 'Penyerahan Selesai' : canConfirm ? 'Siap Timbang & Serah Terima' : 'Menunggu Jadwal Panen'

  return <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 pb-10 text-ink">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-tide transition-colors hover:bg-success-soft hover:text-tide-dark" to={back}><ArrowLeft size={16} /> Kembali ke Detail Kemitraan</Link>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={refreshing || confirmation.isPending} onClick={() => refresh()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold transition-all enabled:hover:border-tide enabled:hover:bg-success-soft enabled:hover:text-tide enabled:active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Perbarui Status</button>
        {(buyer ? item.supply.whatsapp_url : item.buyer?.whatsapp_url) && <a className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-tide no-underline transition-all hover:border-tide hover:bg-success-soft hover:text-tide-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide active:scale-[.98]" href={(buyer ? item.supply.whatsapp_url : item.buyer?.whatsapp_url) ?? undefined} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> {buyer ? 'Hubungi Petambak' : 'Hubungi Pembeli'} via WhatsApp</a>}
      </div>
    </div>

    <header className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3"><h1 className="buyer-typography-page-title">Detail Kemitraan #KMT-{String(item.id).padStart(4, '0')}</h1><span className={`rounded-full px-3 py-1 text-xs font-semibold ${completed || canConfirm ? 'bg-success-soft text-success' : 'bg-amber-100 text-amber-800'}`}>{completed ? '✓ ' : ''}{statusLabel}</span></div>
      <p className="mt-2 text-sm text-ink-soft">{item.supply.farmer_name ?? 'Petambak'} (Petambak) ↔ {item.buyer?.name ?? 'Pembeli'} (Pembeli)</p>
    </header>

    <section aria-label="Ringkasan kemitraan" className="grid grid-cols-1 overflow-hidden rounded-xl border border-line bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      <Metric label="Komoditas" value={`${item.supply.commodity.name} ${item.supply.fish_size.name}`} hint={item.supply.pond_name} />
      <Metric label="Volume Disepakati" value={item.agreed_volume_kg ? `${formatVolume(item.agreed_volume_kg)} kg` : 'Belum disepakati'} hint={`Panen ${formatDate(item.supply.harvest_date)}`} />
      <Metric label="Harga Satuan" value={formatPrice(item.agreed_price_per_kg)} hint="Sesuai kesepakatan" />
      <Metric label={completed ? 'Total Transaksi' : 'Estimasi Nilai'} value={item.transaction ? rupiah(item.transaction.total_value) : item.agreed_total ? rupiah(item.agreed_total) : 'Belum disepakati'} hint="Total akhir mengikuti berat yang disetujui" />
    </section>

    {message && <p role="status" className="rounded-lg bg-success-soft p-4 text-sm font-medium text-success">{message}</p>}
    {error && <p role="alert" className="rounded-lg bg-danger-soft p-4 text-sm text-danger">{error}</p>}
    {mismatch && !completed && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Berat kedua pihak berbeda. Hubungi mitra dan perbaiki berat sesuai hasil timbang bersama. Transaksi belum diselesaikan.</p>}
    {!completed && !canConfirm && <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><CalendarDays className="mt-0.5 shrink-0" size={17} /><span>{handover.unavailable_reason ?? 'Konfirmasi belum tersedia.'} Estimasi panen: <strong>{formatDate(item.supply.harvest_date)}</strong>.</span></p>}

    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4"><h2 className="buyer-typography-section-title">Status Penyerahan Dua Belah Pihak</h2><span className="inline-flex items-center gap-1.5 text-xs text-ink-soft"><Scale size={14} /> Berdasarkan konfirmasi masing-masing pihak</span></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {(['seller', 'buyer'] as const).map((side) => {
          const own = buyer ? side === 'buyer' : side === 'seller'
          const confirmedAt = handover[`${side}_confirmed_at`]
          const recordedWeight = handover[`${side}_weight_kg`]
          const partyLabel = side === 'seller' ? 'Pihak Penjual (Petambak)' : 'Pihak Pembeli'
          return <article key={side} className={`flex min-w-0 flex-col gap-4 rounded-lg border p-4 ${own ? 'border-success/20 bg-success-soft/60' : 'border-line bg-panel-alt'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{partyLabel}{own ? ' — Anda' : ''}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${confirmedAt ? 'bg-success-soft text-success' : 'bg-amber-100 text-amber-800'}`}>{confirmedAt ? '✓ Sudah Dikonfirmasi' : 'Menunggu Konfirmasi'}</span></div>
            <div><p className="text-sm font-bold">{side === 'seller' ? item.supply.farmer_name ?? 'Petambak' : item.buyer?.name ?? 'Pembeli'}</p>{recordedWeight && <p className="mt-2 text-sm">{side === 'seller' ? 'Berat hasil timbang' : 'Berat diterima'}: <strong>{formatVolume(recordedWeight)} kg</strong></p>}{confirmedAt && <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-soft"><Clock3 size={13} /> Dikonfirmasi {timestamp(confirmedAt)}</p>}</div>
            {own && canConfirm && <form className="mt-auto grid gap-3" onSubmit={submit}>
              <label className="grid gap-2" htmlFor="handover-weight">
                <span className="text-sm font-semibold text-ink">{buyer ? 'Konfirmasi Berat Diterima' : 'Berat Hasil Timbang'}</span>
                <span className="relative flex min-h-14 items-center overflow-hidden rounded-lg border border-line bg-white shadow-sm transition-all focus-within:border-tide focus-within:ring-4 focus-within:ring-tide/10">
                  <Scale className="pointer-events-none absolute left-4 z-10 text-tide" size={19} aria-hidden="true" />
                  <input id="handover-weight" type="number" inputMode="decimal" min="0.01" max="9999999999.99" step="0.01" required placeholder="Contoh: 100" value={value} onChange={(event) => setWeight(event.target.value)} disabled={confirmation.isPending} className="h-14 w-full min-w-0 bg-transparent pr-3 pl-12 text-lg font-semibold text-ink outline-none placeholder:text-sm placeholder:font-normal placeholder:text-ink-soft disabled:cursor-not-allowed disabled:bg-panel-alt" style={{ border: 'none', borderRadius: 0, boxShadow: 'none', outline: 'none' }} />
                  <span className="flex h-14 shrink-0 items-center border-l border-line bg-panel-alt px-4 text-sm font-semibold text-ink-soft">kg</span>
                </span>
              </label>
              <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-tide bg-tide px-5 py-3 text-sm font-semibold shadow-sm transition-all enabled:hover:border-tide-dark enabled:hover:bg-tide-dark enabled:hover:shadow-md enabled:focus-visible:outline-2 enabled:focus-visible:outline-offset-2 enabled:focus-visible:outline-tide enabled:active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50" style={{ color: '#fff' }} type="submit" disabled={confirmation.isPending || refreshing}>{confirmation.isPending ? <LoaderCircle size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}{confirmedAt ? 'Perbarui Konfirmasi Berat' : 'Konfirmasi Penyerahan Selesai'}</button>
              <p className="text-center text-xs leading-5 text-ink-soft">Ada selisih timbangan? Hubungi {buyer ? 'Petambak' : 'Pembeli'}</p>
            </form>}
            {!own && !confirmedAt && <p className="mt-auto text-sm text-ink-soft">Menunggu mitra mencatat dan mengonfirmasi hasil timbang.</p>}
          </article>
        })}
      </div>
      {completed && <p role="status" className="mt-4 rounded-lg bg-success-soft p-4 text-sm font-semibold text-success">Transaksi sudah tercatat dan tidak dapat diubah.{item.transaction && ` Berat akhir ${formatVolume(item.transaction.volume_kg)} kg, total ${rupiah(item.transaction.total_value)}.`}</p>}
    </section>

    <ConfirmDialog open={review !== null} title="Konfirmasi hasil timbang?" description={review ? `Anda menyetujui berat ${formatVolume(review.volume_kg)} kg dengan harga ${formatPrice(item.agreed_price_per_kg)}. Jika mitra menyetujui berat yang sama, transaksi akan diselesaikan dan dikunci.` : ''} confirmLabel="Ya, Konfirmasi" pending={confirmation.isPending} onCancel={() => setReview(null)} onConfirm={confirm} />
  </div>
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return <div className="min-w-0 border-b border-line p-5 last:border-b-0 sm:border-r sm:nth-[2]:border-r-0 lg:border-b-0 lg:nth-[2]:border-r"><p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{label}</p><p className="mt-2 wrap-break-word text-sm font-bold">{value}</p>{hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}</div>
}
