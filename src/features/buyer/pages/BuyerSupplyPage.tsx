import { CalendarDays, ChevronLeft, ChevronRight, Fish, LoaderCircle, MapPin, MessageCircle, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import pondPlaceholder from '../../../assets/images/pond-placeholder.svg'
import { useBuyerLocations, useFishSizes } from '../hooks/useBuyerDemands'
import { useCatalog, useCatalogDetail } from '../hooks/useCatalog'
import type { CatalogFilters, CatalogSupply } from '../types/catalog.types'

const perPage = 9

function numberParam(value: string | null) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

function filtersFromParams(params: URLSearchParams): CatalogFilters {
  return {
    location_id: numberParam(params.get('location_id')),
    fish_size_id: numberParam(params.get('fish_size_id')),
    start_date: params.get('start_date') || undefined,
    end_date: params.get('end_date') || undefined,
    page: numberParam(params.get('page')) ?? 1,
    per_page: perPage,
  }
}

function formatVolume(value: string) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Number(value))
}

function formatPrice(value: string | null) {
  if (!value) return 'Hubungi untuk harga'
  return `${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value))}/kg`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function WhatsAppLink({ supply, className }: { supply: CatalogSupply; className: string }) {
  if (!supply.whatsapp_url) {
    return <span className={`${className} cursor-not-allowed opacity-50`} aria-disabled="true"><MessageCircle size={17} /> Kontak tidak tersedia</span>
  }

  return <a className={className} href={supply.whatsapp_url} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> Hubungi WhatsApp</a>
}

function SupplyDetailDialog({ id, onClose }: { id: number; onClose: () => void }) {
  const detail = useCatalogDetail(id)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/45 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="supply-detail-title">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-tide">Detail Pasokan</p><h2 id="supply-detail-title" className="mt-1 text-xl font-bold text-ink">Informasi Rencana Panen</h2></div>
          <button ref={closeButton} className="grid size-10 place-items-center rounded-lg text-ink-soft hover:bg-panel-alt hover:text-ink" type="button" onClick={onClose} aria-label="Tutup detail"><X size={20} /></button>
        </div>
        {detail.isLoading && <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-ink-soft"><LoaderCircle className="animate-spin" size={20} /> Memuat detail...</div>}
        {detail.isError && <div className="grid min-h-72 place-items-center p-8 text-center text-sm text-danger"><div><p>Detail pasokan gagal dimuat.</p><button className="mt-3 font-bold text-tide underline" type="button" onClick={() => detail.refetch()}>Coba lagi</button></div></div>}
        {detail.data && (
          <div className="grid gap-6 p-5 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
              <img className="h-40 w-full rounded-xl object-cover sm:h-full" src={pondPlaceholder} alt="Ilustrasi tambak bandeng" />
              <div><h3 className="text-lg font-bold text-ink">{detail.data.pond_name}</h3><p className="mt-1 text-sm text-ink-soft">Petambak {detail.data.farmer_name}</p><div className="mt-4 grid gap-2 text-sm text-ink"><p className="flex items-center gap-2"><MapPin size={16} className="text-tide" /> Kec. {detail.data.location.name}</p><p className="flex items-center gap-2"><CalendarDays size={16} className="text-tide" /> {formatDate(detail.data.harvest_date)}</p><p className="flex items-center gap-2"><Fish size={16} className="text-tide" /> Bandeng {detail.data.fish_size.name}</p></div></div>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[['Estimasi', detail.data.estimated_volume_kg], ['Dialokasikan', detail.data.allocated_volume_kg], ['Direservasi', detail.data.reserved_volume_kg], ['Tersedia', detail.data.available_volume_kg]].map(([label, value]) => <div className="rounded-xl bg-panel-alt p-3" key={label}><dt className="text-xs text-ink-soft">{label}</dt><dd className="mt-1 font-bold text-ink">{formatVolume(value)} kg</dd></div>)}
            </dl>
            <div className="flex flex-col gap-1 rounded-xl border border-line p-4"><span className="text-xs text-ink-soft">Perkiraan harga</span><strong className="text-lg text-tide">{formatPrice(detail.data.asking_price_per_kg)}</strong></div>
            {detail.data.notes && <div><h4 className="text-sm font-bold text-ink">Catatan Petambak</h4><p className="mt-1 text-sm leading-6 text-ink-soft">{detail.data.notes}</p></div>}
            <WhatsAppLink supply={detail.data} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-tide px-5 py-2.5 text-sm font-bold !text-white no-underline hover:bg-tide-dark hover:!text-white hover:no-underline" />
          </div>
        )}
      </section>
    </div>
  )
}

export function BuyerSupplyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = filtersFromParams(searchParams)
  const [draft, setDraft] = useState(() => ({
    location_id: searchParams.get('location_id') ?? '',
    fish_size_id: searchParams.get('fish_size_id') ?? '',
    start_date: searchParams.get('start_date') ?? '',
    end_date: searchParams.get('end_date') ?? '',
  }))
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const catalog = useCatalog(filters)
  const locations = useBuyerLocations()
  const fishSizes = useFishSizes()

  const updatePage = (page: number) => {
    const next = new URLSearchParams(searchParams)
    if (page === 1) next.delete('page')
    else next.set('page', String(page))
    setSearchParams(next)
  }

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault()
    const next = new URLSearchParams()
    Object.entries(draft).forEach(([key, value]) => value && next.set(key, value))
    setSearchParams(next)
  }

  const resetFilters = () => {
    setDraft({ location_id: '', fish_size_id: '', start_date: '', end_date: '' })
    setSearchParams(new URLSearchParams())
  }

  return (
    <div className="buyer-page grid gap-6 text-ink">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-tide"><Search size={15} /> Katalog Pembeli</span><h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Cari Pasokan Bandeng</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">Temukan rencana panen petambak Gresik berdasarkan lokasi, ukuran, dan waktu yang Anda butuhkan.</p></div>
        {catalog.data && <p className="text-sm text-ink-soft"><strong className="text-ink">{catalog.data.meta.total}</strong> pasokan tersedia</p>}
      </section>

      <form className="rounded-2xl border border-line bg-panel p-4 shadow-sm sm:p-5" onSubmit={applyFilters}>
        <div className="mb-4 flex items-center gap-2"><SlidersHorizontal size={18} className="text-tide" /><h2 className="font-bold">Filter Pasokan</h2></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1.5 text-xs font-semibold">Kecamatan<select className="min-h-11 rounded-lg border border-line bg-white px-3 text-sm font-normal focus:border-tide focus:outline-none focus:ring-2 focus:ring-tide/15" value={draft.location_id} onChange={(event) => setDraft((current) => ({ ...current, location_id: event.target.value }))}><option value="">Semua kecamatan</option>{locations.data?.map((location) => <option key={location.id} value={location.id}>Kec. {location.name}</option>)}</select></label>
          <label className="grid gap-1.5 text-xs font-semibold">Ukuran Bandeng<select className="min-h-11 rounded-lg border border-line bg-white px-3 text-sm font-normal focus:border-tide focus:outline-none focus:ring-2 focus:ring-tide/15" value={draft.fish_size_id} onChange={(event) => setDraft((current) => ({ ...current, fish_size_id: event.target.value }))}><option value="">Semua ukuran</option>{fishSizes.data?.map((size) => <option key={size.id} value={size.id}>{size.name}</option>)}</select></label>
          <label className="grid gap-1.5 text-xs font-semibold">Panen Mulai<input className="min-h-11 rounded-lg border border-line px-3 text-sm font-normal focus:border-tide focus:outline-none focus:ring-2 focus:ring-tide/15" type="date" value={draft.start_date} onChange={(event) => setDraft((current) => ({ ...current, start_date: event.target.value }))} /></label>
          <label className="grid gap-1.5 text-xs font-semibold">Panen Sampai<input className="min-h-11 rounded-lg border border-line px-3 text-sm font-normal focus:border-tide focus:outline-none focus:ring-2 focus:ring-tide/15" type="date" min={draft.start_date || undefined} value={draft.end_date} onChange={(event) => setDraft((current) => ({ ...current, end_date: event.target.value }))} /></label>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2"><button className="min-h-10 rounded-lg border border-line px-4 text-sm font-semibold text-ink hover:bg-panel-alt" type="button" onClick={resetFilters}>Reset</button><button className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-tide px-5 text-sm font-bold text-white hover:bg-tide-dark" type="submit"><Search size={16} /> Terapkan Filter</button></div>
      </form>

      {catalog.isLoading && <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Memuat pasokan">{Array.from({ length: 6 }, (_, index) => <div className="h-[410px] animate-pulse rounded-2xl border border-line bg-white" key={index} />)}</div>}
      {catalog.isError && <div className="grid min-h-64 place-items-center rounded-2xl border border-danger/20 bg-danger-soft p-8 text-center"><div><p className="font-bold text-danger">Pasokan belum dapat dimuat.</p><p className="mt-1 text-sm text-danger">Periksa koneksi lalu coba kembali.</p><button className="mt-4 rounded-lg bg-tide px-5 py-2.5 text-sm font-bold text-white" type="button" onClick={() => catalog.refetch()}>Coba lagi</button></div></div>}
      {catalog.data?.data.length === 0 && <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-line bg-white p-8 text-center"><div><Search className="mx-auto text-tide" size={34} /><h2 className="mt-3 font-bold">Pasokan tidak ditemukan</h2><p className="mt-1 text-sm text-ink-soft">Coba perluas lokasi, ukuran, atau rentang tanggal pencarian.</p><button className="mt-4 text-sm font-bold text-tide underline" type="button" onClick={resetFilters}>Hapus semua filter</button></div></div>}

      {catalog.data && catalog.data.data.length > 0 && (
        <div className={`grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 ${catalog.isFetching ? 'opacity-60' : ''}`} aria-busy={catalog.isFetching}>
          {catalog.data.data.map((supply) => (
            <article className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" key={supply.id}>
              <div className="relative"><img className="h-44 w-full object-cover" src={pondPlaceholder} alt="Ilustrasi tambak bandeng" /><span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-success shadow-sm"><i className="size-2 rounded-full bg-success" /> Tersedia</span></div>
              <div className="grid gap-4 p-5"><div><p className="text-xs font-semibold text-tide">Bandeng {supply.fish_size.name}</p><h2 className="mt-1 text-lg font-bold">{supply.pond_name}</h2><p className="mt-1 text-sm text-ink-soft">Petambak {supply.farmer_name}</p></div><div className="grid grid-cols-2 gap-3 text-sm"><p className="flex items-center gap-2 text-ink-soft"><MapPin size={15} className="text-tide" /> Kec. {supply.location.name}</p><p className="flex items-center gap-2 text-ink-soft"><CalendarDays size={15} className="text-tide" /> {formatDate(supply.harvest_date)}</p></div><div className="flex items-end justify-between gap-4 border-y border-line py-3"><div><span className="block text-xs text-ink-soft">Volume tersedia</span><strong className="text-lg text-ink">{formatVolume(supply.available_volume_kg)} kg</strong></div><div className="text-right"><span className="block text-xs text-ink-soft">Perkiraan harga</span><strong className="text-sm text-tide">{formatPrice(supply.asking_price_per_kg)}</strong></div></div><div className="grid grid-cols-2 gap-2"><button className="min-h-11 rounded-lg border border-line px-3 text-sm font-bold text-ink hover:bg-panel-alt" type="button" onClick={() => setSelectedId(supply.id)}>Lihat Detail</button><WhatsAppLink supply={supply} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-tide px-3 text-center text-sm font-bold !text-white no-underline hover:bg-tide-dark hover:!text-white hover:no-underline" /></div></div>
            </article>
          ))}
        </div>
      )}

      {catalog.data && catalog.data.meta.last_page > 1 && <nav className="flex items-center justify-center gap-3" aria-label="Halaman katalog"><button className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-line bg-white px-3 text-sm font-semibold disabled:opacity-40" type="button" disabled={filters.page <= 1 || catalog.isFetching} onClick={() => updatePage(filters.page - 1)}><ChevronLeft size={16} /> Sebelumnya</button><span className="text-sm text-ink-soft">Halaman <strong className="text-ink">{filters.page}</strong> dari {catalog.data.meta.last_page}</span><button className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-line bg-white px-3 text-sm font-semibold disabled:opacity-40" type="button" disabled={filters.page >= catalog.data.meta.last_page || catalog.isFetching} onClick={() => updatePage(filters.page + 1)}>Berikutnya <ChevronRight size={16} /></button></nav>}

      {selectedId !== null && <SupplyDetailDialog id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
