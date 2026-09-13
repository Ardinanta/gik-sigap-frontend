import { ArrowRight, CheckCircle2, Clock3, Handshake, LoaderCircle, MessageCircle, Scale } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { getApiError } from '../../../lib/utils'
import { formatDate, formatPrice, formatVolume } from '../../buyer/utils/catalogFormatters'
import type { Partnership, Reservation, Transaction } from '../../buyer/types/partnership.types'
import { useConfirmFarmerPartnership, useConfirmFarmerReservation, useFarmerPartnerships, useFarmerReservations, useFarmerTransactions } from '../hooks/useFarmerPartnerships'

type Target = { type: 'partnership'; item: Partnership } | { type: 'reservation'; item: Reservation }

export function FarmerPartnershipsPage() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'history' ? 'history' : 'active'
  const [page, setPage] = useState(1)
  const [target, setTarget] = useState<Target | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const partnerships = useFarmerPartnerships(tab, page, tab === 'active')
  const reservations = useFarmerReservations(page, tab === 'active')
  const transactions = useFarmerTransactions(tab === 'history' ? page : 1)
  const confirmPartnership = useConfirmFarmerPartnership()
  const confirmReservation = useConfirmFarmerReservation()
  const pending = partnerships.data?.data.filter((item) => item.status === 'interested') ?? []
  const active = partnerships.data?.data.filter((item) => item.status !== 'interested') ?? []

  const confirm = async () => {
    if (!target) return
    try {
      const response = target.type === 'partnership' ? await confirmPartnership.mutateAsync(target.item.id) : await confirmReservation.mutateAsync(target.item.id)
      setNotice(response.message); setTarget(null); setError('')
    } catch (exception) { setError(getApiError(exception, 'Pengajuan belum dapat dikonfirmasi.').message) }
  }

  const changeTab = (next: 'active' | 'history') => { setPage(1); setParams(next === 'history' ? { tab: 'history' } : {}) }
  const summary = partnerships.data?.summary

  return <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10 text-ink">
    <header className="flex flex-col gap-2"><span className="text-xs font-semibold uppercase tracking-wider text-tide">Manajemen Kemitraan & Penjualan</span><h1 className="text-2xl font-bold md:text-3xl">Kemitraan Saya</h1><p className="text-sm text-ink-soft">Pantau kesepakatan pra-panen dan konfirmasi pengajuan yang masuk dari pembeli.</p></header>
    <div className="inline-flex w-fit rounded-xl border border-line bg-white p-1"><button className={`min-h-11 rounded-lg px-5 text-sm font-semibold ${tab === 'active' ? 'bg-tide text-white' : 'text-ink-soft'}`} onClick={() => changeTab('active')}>Kemitraan Aktif</button><button className={`min-h-11 rounded-lg px-5 text-sm font-semibold ${tab === 'history' ? 'bg-tide text-white' : 'text-ink-soft'}`} onClick={() => changeTab('history')}>Riwayat Transaksi</button></div>
    {notice && <div className="rounded-xl bg-success-soft p-4 text-sm font-semibold text-success" role="status">{notice}</div>}
    {tab === 'active' ? <>
      <section className="grid gap-4 sm:grid-cols-3"><Metric icon={Handshake} label="Kemitraan Berjalan" value={String(summary?.active_count ?? 0)} /><Metric icon={Scale} label="Pasokan Terikat" value={`${formatVolume(summary?.agreed_volume_kg ?? 0)} kg`} /><Metric icon={Clock3} label="Perlu Tindakan" value={String((summary?.pending_request_count ?? 0) + (reservations.data?.meta.total ?? 0))} /></section>
      <Section title="Kemitraan Berjalan" count={active.length}>{partnerships.isLoading ? <Loading /> : active.length ? active.map((item) => <PartnershipCard key={item.id} item={item} />) : <Empty text="Belum ada kemitraan berjalan." />}</Section>
      <Section title="Permintaan Baru" count={pending.length + (reservations.data?.meta.total ?? 0)}>
        {(partnerships.isLoading || reservations.isLoading) ? <Loading /> : <>{pending.map((item) => <RequestCard key={`p-${item.id}`} name={item.buyer?.name ?? 'Pembeli SIGAP'} volume={item.proposed_volume_kg ?? '0'} date={item.supply.harvest_date} price={item.supply.asking_price_per_kg} whatsapp={item.buyer?.whatsapp_url} onConfirm={() => { setError(''); setTarget({ type: 'partnership', item }) }} />)}{reservations.data?.data.map((item) => <RequestCard key={`r-${item.id}`} name={item.buyer?.name ?? 'Pembeli SIGAP'} volume={item.reserved_volume_kg} date={item.harvest_plan.harvest_date} price={item.harvest_plan.asking_price_per_kg} whatsapp={item.buyer?.whatsapp_url} onConfirm={() => { setError(''); setTarget({ type: 'reservation', item }) }} />)}{!pending.length && !reservations.data?.data.length && <Empty text="Tidak ada pengajuan pembeli yang menunggu konfirmasi." />}</>}
      </Section>
      <Section title="Riwayat Transaksi Terakhir" count={transactions.data?.meta.total}><Transactions items={transactions.data?.data.slice(0, 3) ?? []} loading={transactions.isLoading} /></Section>
    </> : <Section title="Riwayat Transaksi" count={transactions.data?.meta.total}><Transactions items={transactions.data?.data ?? []} loading={transactions.isLoading} /></Section>}
    <Pager page={page} lastPage={tab === 'history' ? transactions.data?.meta.last_page ?? 1 : partnerships.data?.meta.last_page ?? 1} onChange={setPage} />
    <ConfirmDialog open={target !== null} title="Konfirmasi pengajuan pembeli?" description="Volume ini akan dikunci sebagai komitmen pasokan. Pastikan data panen dan harga acuan sudah benar." confirmLabel="Ya, Konfirmasi" pending={confirmPartnership.isPending || confirmReservation.isPending} error={error || undefined} onCancel={() => { setTarget(null); setError('') }} onConfirm={confirm} />
  </div>
}

function Metric({ icon: Icon, label, value }: { icon: typeof Handshake; label: string; value: string }) { return <article className="rounded-xl border border-line bg-white p-5 shadow-sm"><span className="grid size-10 place-items-center rounded-lg bg-success-soft text-tide"><Icon size={20} /></span><span className="mt-3 block text-xs text-ink-soft">{label}</span><strong className="text-lg">{value}</strong></article> }
function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) { return <section className="grid gap-3"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2>{count !== undefined && <span className="text-xs text-ink-soft">{count} data</span>}</div>{children}</section> }
function PartnershipCard({ item }: { item: Partnership }) { return <article className="grid gap-4 rounded-xl border border-line bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">{item.buyer?.name ?? 'Pembeli SIGAP'}</h3><p className="text-sm text-ink-soft">{item.supply.pond_name} · {item.supply.location.name}</p></div><span className="h-fit rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">{item.status === 'matched' ? 'Menunggu Panen' : 'Dalam Diskusi'}</span></div><div className="grid grid-cols-2 gap-3 rounded-lg bg-canvas p-4 md:grid-cols-4"><Info label="Volume" value={item.agreed_volume_kg ? `${formatVolume(item.agreed_volume_kg)} kg` : 'Belum disepakati'} /><Info label="Ukuran" value={item.supply.fish_size.name} /><Info label="Harga" value={formatPrice(item.agreed_price_per_kg ?? item.supply.asking_price_per_kg)} /><Info label="Panen" value={formatDate(item.supply.harvest_date)} /></div><div className="flex flex-wrap gap-2"><Link className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold hover:bg-success-soft" to={`/app/farmer/kemitraan/${item.id}`}>Lihat Detail <ArrowRight size={15} /></Link>{item.buyer?.whatsapp_url && <a className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-tide px-4 text-sm font-semibold text-white" href={item.buyer.whatsapp_url} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>}</div></article> }
function RequestCard({ name, volume, date, price, whatsapp, onConfirm }: { name: string; volume: string; date: string; price: string | null; whatsapp?: string | null; onConfirm: () => void }) { return <article className="grid gap-4 rounded-xl border border-warning/20 bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">{name}</h3><p className="text-sm text-ink-soft">Mengajukan pasokan Bandeng</p></div><span className="h-fit rounded-full bg-[#fff1cc] px-3 py-1 text-xs font-bold text-[#8a6100]">Perlu Konfirmasi</span></div><div className="grid grid-cols-3 gap-3 rounded-lg bg-canvas p-4"><Info label="Volume" value={`${formatVolume(volume)} kg`} /><Info label="Harga Acuan" value={formatPrice(price)} /><Info label="Perkiraan Panen" value={formatDate(date)} /></div><div className="flex flex-wrap gap-2">{whatsapp && <a className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>}<button className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-tide px-4 text-sm font-semibold text-white hover:bg-tide-dark" onClick={onConfirm}><CheckCircle2 size={16} /> Konfirmasi Kesepakatan</button></div></article> }
function Transactions({ items, loading }: { items: Transaction[]; loading: boolean }) { if (loading) return <Loading />; if (!items.length) return <Empty text="Belum ada transaksi yang selesai." />; return <div className="overflow-hidden rounded-xl border border-line bg-white">{items.map((item) => <Link key={item.id} className="flex justify-between gap-4 border-b border-line p-4 last:border-0 hover:bg-canvas" to={`/app/farmer/kemitraan/${item.partnership_id}`}><div><strong>{item.buyer_name ?? 'Pembeli SIGAP'}</strong><p className="text-xs text-ink-soft">{formatVolume(item.volume_kg)} kg · {item.fish_size.name}</p></div><div className="text-right"><strong>Rp{new Intl.NumberFormat('id-ID').format(Number(item.total_value))}</strong><p className="text-xs text-success">Lunas · {formatDate(item.transaction_date)}</p></div></Link>)}</div> }
function Info({ label, value }: { label: string; value: string }) { return <div><span className="block text-xs text-ink-soft">{label}</span><strong className="mt-1 block text-sm">{value}</strong></div> }
function Loading() { return <div className="flex min-h-28 items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm text-ink-soft"><LoaderCircle className="animate-spin" size={18} /> Memuat data...</div> }
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-line bg-white p-7 text-center text-sm text-ink-soft">{text}</div> }
function Pager({ page, lastPage, onChange }: { page: number; lastPage: number; onChange: (page: number) => void }) { if (lastPage <= 1) return null; return <div className="flex justify-end gap-2"><button disabled={page <= 1} onClick={() => onChange(page - 1)}>Sebelumnya</button><span>{page}/{lastPage}</span><button disabled={page >= lastPage} onClick={() => onChange(page + 1)}>Berikutnya</button></div> }
