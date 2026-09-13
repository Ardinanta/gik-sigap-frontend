import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Handshake,
  LoaderCircle,
  MapPin,
  MessageCircle,
  PackageCheck,
  Scale,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { getApiError } from '../../../lib/utils'
import {
  useCancelReservation,
  usePartnerships,
  usePendingReservations,
  useTransactions,
} from '../hooks/usePartnerships'
import type { PartnershipStatus, Reservation } from '../types/partnership.types'
import { formatDate, formatPrice, formatVolume } from '../utils/catalogFormatters'

const statusLabels: Record<PartnershipStatus, string> = {
  interested: 'Minat Diajukan',
  discussing: 'Dalam Diskusi',
  matched: 'Menunggu Panen',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

function Pager({ page, lastPage, onChange }: { page: number; lastPage: number; onChange: (page: number) => void }) {
  if (lastPage <= 1) return null
  return (
    <div className="flex items-center justify-end gap-2 pt-3">
      <button className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-all hover:border-tide hover:bg-success-soft hover:text-tide hover:shadow-sm active:scale-[.98] disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-white disabled:hover:text-ink disabled:hover:shadow-none" disabled={page <= 1} onClick={() => onChange(page - 1)}>Sebelumnya</button>
      <span className="text-sm text-ink-soft">Halaman {page} dari {lastPage}</span>
      <button className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-all hover:border-tide hover:bg-success-soft hover:text-tide hover:shadow-sm active:scale-[.98] disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-white disabled:hover:text-ink disabled:hover:shadow-none" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>Berikutnya</button>
    </div>
  )
}

export function BuyerPartnershipsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'history' ? 'history' : 'active'
  const [page, setPage] = useState(1)
  const [reservationPage, setReservationPage] = useState(1)
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null)
  const [cancelError, setCancelError] = useState('')
  const [message, setMessage] = useState('')
  const partnerships = usePartnerships(tab, page, tab === 'active')
  const reservations = usePendingReservations(reservationPage, tab === 'active')
  const transactions = useTransactions(tab === 'history' ? page : 1)
  const cancelReservation = useCancelReservation()

  const changeTab = (next: 'active' | 'history') => {
    setPage(1)
    setSearchParams(next === 'history' ? { tab: 'history' } : {})
  }

  const confirmCancellation = async () => {
    if (!cancelTarget) return
    try {
      const response = await cancelReservation.mutateAsync(cancelTarget.id)
      setCancelTarget(null)
      setMessage(response.message)
      setCancelError('')
    } catch (error) {
      setCancelError(getApiError(error, 'Reservasi belum dapat dibatalkan. Silakan coba lagi.').message)
    }
  }

  const summary = partnerships.data?.summary
  const harvestRange = summary?.harvest_start_date
    ? summary.harvest_end_date && summary.harvest_end_date !== summary.harvest_start_date
      ? `${formatDate(summary.harvest_start_date)} – ${formatDate(summary.harvest_end_date)}`
      : formatDate(summary.harvest_start_date)
    : 'Belum ada jadwal aktif'

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10">
      <header className="flex flex-col gap-2">
        <span className="buyer-typography-eyebrow">Manajemen Kemitraan & Transaksi</span>
        <h1 className="buyer-typography-page-title">Kemitraan Bandeng Anda</h1>
        <p className="buyer-typography-page-description">Pantau pengajuan, kesepakatan pasokan, reservasi, dan transaksi yang selesai dalam satu halaman.</p>
      </header>

      <div className="inline-flex w-fit rounded-xl border border-line bg-white p-1" role="tablist" aria-label="Tampilan kemitraan">
        <button className={`min-h-11 rounded-lg px-5 text-sm font-semibold ${tab === 'active' ? 'bg-tide text-white' : 'text-ink-soft hover:text-ink'}`} role="tab" aria-selected={tab === 'active'} onClick={() => changeTab('active')}>Kemitraan Aktif</button>
        <button className={`min-h-11 rounded-lg px-5 text-sm font-semibold ${tab === 'history' ? 'bg-tide text-white' : 'text-ink-soft hover:text-ink'}`} role="tab" aria-selected={tab === 'history'} onClick={() => changeTab('history')}>Riwayat Transaksi</button>
      </div>

      {message && <div className="rounded-xl bg-success-soft p-4 text-sm font-medium text-success" role="status">{message}</div>}

      {tab === 'active' ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard icon={Handshake} label="Kemitraan Aktif" value={String(summary?.active_count ?? 0)} />
            <SummaryCard icon={Scale} label="Pasokan Disepakati" value={`${formatVolume(summary?.agreed_volume_kg ?? 0)} kg`} />
            <SummaryCard icon={CalendarDays} label="Estimasi Panen" value={harvestRange} />
            <SummaryCard icon={Clock3} label="Reservasi Pending" value={String(summary?.pending_reservation_count ?? 0)} />
          </section>

          <section className="flex flex-col gap-4">
            <SectionTitle title="Kemitraan Berjalan" count={partnerships.data?.meta.total} />
            {partnerships.isLoading ? <Loading /> : partnerships.isError ? <ErrorState retry={() => partnerships.refetch()} /> : partnerships.data?.data.length ? (
              <div className="grid grid-cols-1 gap-4">
                {partnerships.data.data.map((item) => (
                  <article key={item.id} className="flex h-full flex-col gap-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div><h3 className="text-lg font-bold text-ink">{item.supply.pond_name}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft"><MapPin size={15} /> {item.supply.farmer_name ?? 'Petambak'} · {item.supply.location.name}</p></div>
                      <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">{statusLabels[item.status]}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-canvas p-4 text-sm md:grid-cols-4">
                      <Info label="Volume" value={item.agreed_volume_kg ? `${formatVolume(item.agreed_volume_kg)} kg` : 'Belum disepakati'} />
                      <Info label="Ukuran" value={item.supply.fish_size.name} />
                      <Info label="Harga" value={formatPrice(item.agreed_price_per_kg ?? item.supply.asking_price_per_kg)} />
                      <Info label="Estimasi Panen" value={formatDate(item.supply.harvest_date)} />
                    </div>
                    {item.agreed_total && <p className="text-sm text-ink-soft">Nilai kesepakatan <strong className="text-ink">Rp{new Intl.NumberFormat('id-ID').format(Number(item.agreed_total))}</strong></p>}
                    <div className="mt-auto flex flex-wrap gap-2">
                      <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-tide px-4 py-2 text-sm font-semibold text-white! shadow-sm transition-all hover:-translate-y-0.5 hover:bg-tide-dark hover:text-white! hover:shadow-md active:translate-y-0 active:scale-[.98]" to={`/app/buyer/kemitraan/${item.id}`}>Lihat Detail <ArrowRight size={16} /></Link>
                      {item.supply.whatsapp_url && <a className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-tide hover:bg-success-soft hover:text-tide hover:shadow-sm active:translate-y-0 active:scale-[.98]" href={item.supply.whatsapp_url} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp</a>}
                    </div>
                  </article>
                ))}
              </div>
            ) : <Empty text="Belum ada kemitraan aktif. Tindak lanjuti rekomendasi pasokan untuk memulai kemitraan." />}
            <Pager page={page} lastPage={partnerships.data?.meta.last_page ?? 1} onChange={setPage} />
          </section>

          <section className="flex flex-col gap-4">
            <SectionTitle title="Permintaan Reservasi Anda" count={reservations.data?.meta.total} />
            {reservations.isLoading ? <Loading /> : reservations.isError ? <ErrorState retry={() => reservations.refetch()} /> : reservations.data?.data.length ? (
              <div className="grid grid-cols-1 gap-4">
                {reservations.data.data.map((item) => <ReservationCard key={item.id} item={item} onCancel={() => { setCancelError(''); setCancelTarget(item) }} />)}
              </div>
            ) : <Empty text="Tidak ada reservasi yang sedang menunggu konfirmasi." />}
            <Pager page={reservationPage} lastPage={reservations.data?.meta.last_page ?? 1} onChange={setReservationPage} />
          </section>

          <section className="flex flex-col gap-4">
            <SectionTitle title="Riwayat Transaksi Terakhir" count={transactions.data?.meta.total} />
            <TransactionList loading={transactions.isLoading} error={transactions.isError} retry={() => transactions.refetch()} transactions={transactions.data?.data.slice(0, 3) ?? []} />
          </section>
        </>
      ) : (
        <section className="flex flex-col gap-4">
          <SectionTitle title="Riwayat Transaksi" count={transactions.data?.meta.total} />
          <TransactionList loading={transactions.isLoading} error={transactions.isError} retry={() => transactions.refetch()} transactions={transactions.data?.data ?? []} />
          <Pager page={page} lastPage={transactions.data?.meta.last_page ?? 1} onChange={setPage} />
        </section>
      )}

      <ConfirmDialog open={cancelTarget !== null} title="Batalkan reservasi?" description={cancelTarget ? `Reservasi ${formatVolume(cancelTarget.reserved_volume_kg)} kg dari ${cancelTarget.harvest_plan.pond_name} akan dibatalkan dan volume akan kembali tersedia.` : ''} confirmLabel="Ya, Batalkan" variant="danger" pending={cancelReservation.isPending} error={cancelError || undefined} onCancel={() => { setCancelTarget(null); setCancelError('') }} onConfirm={confirmCancellation} />
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof Handshake; label: string; value: string }) {
  return <article className="rounded-2xl border border-line bg-white p-5 shadow-sm"><span className="mb-4 grid size-10 place-items-center rounded-xl bg-success-soft text-tide"><Icon size={20} /></span><p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p><p className="mt-1 text-xl font-bold text-ink">{value}</p></article>
}

function SectionTitle({ title, count }: { title: string; count?: number }) {
  return <div className="flex items-center justify-between gap-3"><h2 className="buyer-typography-section-title">{title}</h2>{count !== undefined && <span className="rounded-full bg-panel-alt px-3 py-1 text-xs font-bold text-ink-soft">{count} data</span>}</div>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><span className="block text-xs text-ink-soft">{label}</span><strong className="mt-1 block text-ink">{value}</strong></div>
}

function ReservationCard({ item, onCancel }: { item: Reservation; onCancel: () => void }) {
  return <article className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-ink">{item.harvest_plan.pond_name}</h3><p className="mt-1 text-sm text-ink-soft">{item.harvest_plan.farmer_name ?? 'Petambak'} · {item.harvest_plan.location.name}</p></div><span className="rounded-full bg-[#fff1cc] px-3 py-1 text-xs font-bold text-[#8a6100]">Menunggu Konfirmasi</span></div><div className="grid grid-cols-2 gap-3 rounded-xl bg-canvas p-4 text-sm md:grid-cols-4"><Info label="Volume" value={`${formatVolume(item.reserved_volume_kg)} kg`} /><Info label="Ukuran" value={item.harvest_plan.fish_size.name} /><Info label="Harga Acuan" value={formatPrice(item.harvest_plan.asking_price_per_kg)} /><Info label="Estimasi Panen" value={formatDate(item.harvest_plan.harvest_date)} /></div>{item.expires_at && <p className="text-xs text-ink-soft">Berlaku sampai {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.expires_at))}</p>}<div className="mt-auto flex flex-wrap gap-2"><Link className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-tide hover:bg-success-soft hover:text-tide hover:shadow-sm active:translate-y-0 active:scale-[.98]" to={`/app/buyer/pasokan/${item.harvest_plan.id}`}>Detail Pasokan</Link>{item.harvest_plan.whatsapp_url && <a className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-tide hover:bg-success-soft hover:text-tide hover:shadow-sm active:translate-y-0 active:scale-[.98]" href={item.harvest_plan.whatsapp_url} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp</a>}<button className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-danger/20 bg-danger-soft px-4 py-2 text-sm font-semibold text-danger transition-all hover:-translate-y-0.5 hover:border-danger/40 hover:bg-[#f2d4cd] hover:shadow-sm active:translate-y-0 active:scale-[.98]" type="button" onClick={onCancel}><XCircle size={16} /> Batalkan</button></div></article>
}

function TransactionList({ loading, error, retry, transactions }: { loading: boolean; error: boolean; retry: () => void; transactions: Array<{ id: number; partnership_id: number; seller_name: string | null; location: { name: string }; fish_size: { name: string }; volume_kg: string; total_value: string; transaction_date: string }> }) {
  if (loading) return <Loading />
  if (error) return <ErrorState retry={retry} />
  if (!transactions.length) return <Empty text="Belum ada transaksi kemitraan yang selesai." />
  return <div className="overflow-hidden rounded-2xl border border-line bg-white">{transactions.map((item) => <Link key={item.id} to={`/app/buyer/kemitraan/${item.partnership_id}`} className="flex flex-col gap-3 border-b border-line p-5 text-ink last:border-b-0 hover:bg-canvas md:flex-row md:items-center md:justify-between"><div><strong>{item.seller_name ?? 'Petambak'} · {item.location.name}</strong><p className="mt-1 text-sm text-ink-soft">Bandeng {item.fish_size.name} · {formatVolume(item.volume_kg)} kg</p></div><div className="flex items-center gap-3 md:text-right"><div><strong className="block">Rp{new Intl.NumberFormat('id-ID').format(Number(item.total_value))}</strong><span className="text-xs text-ink-soft">{formatDate(item.transaction_date)}</span></div><PackageCheck className="text-success" size={20} /></div></Link>)}</div>
}

function Loading() { return <div className="flex min-h-32 items-center justify-center gap-2 rounded-2xl border border-line bg-white text-sm text-ink-soft"><LoaderCircle className="animate-spin" size={20} /> Memuat data...</div> }
function ErrorState({ retry }: { retry: () => void }) { return <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-danger-bg bg-white p-5 text-center text-sm text-danger"><p>Data belum dapat dimuat.</p><button className="rounded-lg border border-line bg-white px-4 py-2 font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-tide hover:bg-success-soft hover:text-tide hover:shadow-sm active:translate-y-0 active:scale-[.98]" onClick={retry}>Coba Lagi</button></div> }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-ink-soft">{text}</div> }
