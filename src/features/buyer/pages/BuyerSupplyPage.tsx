import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import pondPlaceholder from '../../../assets/images/pond-placeholder.svg'
import { WhatsAppLink } from '../components/WhatsAppLink'
import { useBuyerLocations, useFishSizes } from '../hooks/useBuyerDemands'
import { useCatalog } from '../hooks/useCatalog'
import type { CatalogFilters } from '../types/catalog.types'
import { formatDate, formatPrice, formatVolume } from '../utils/catalogFormatters'

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

export function BuyerSupplyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = filtersFromParams(searchParams)
  const [draft, setDraft] = useState(() => ({
    location_id: searchParams.get('location_id') ?? '',
    fish_size_id: searchParams.get('fish_size_id') ?? '',
    start_date: searchParams.get('start_date') ?? '',
    end_date: searchParams.get('end_date') ?? '',
  }))
  const location = useLocation()
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
        <div><span className="buyer-typography-eyebrow"><Search size={15} /> Katalog Pembeli</span><h1 className="buyer-typography-page-title mt-2">Cari Pasokan Bandeng</h1><p className="buyer-typography-page-description mt-2">Temukan rencana panen petambak Gresik berdasarkan lokasi, ukuran, dan waktu yang Anda butuhkan.</p></div>
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

      {catalog.isLoading && <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Memuat pasokan">{Array.from({ length: 6 }, (_, index) => <div className="h-102.5 animate-pulse rounded-2xl border border-line bg-white" key={index} />)}</div>}
      {catalog.isError && <div className="grid min-h-64 place-items-center rounded-2xl border border-danger/20 bg-danger-soft p-8 text-center"><div><p className="font-bold text-danger">Pasokan belum dapat dimuat.</p><p className="mt-1 text-sm text-danger">Periksa koneksi lalu coba kembali.</p><button className="mt-4 rounded-lg bg-tide px-5 py-2.5 text-sm font-bold text-white" type="button" onClick={() => catalog.refetch()}>Coba lagi</button></div></div>}
      {catalog.data?.data.length === 0 && <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-line bg-white p-8 text-center"><div><Search className="mx-auto text-tide" size={34} /><h2 className="mt-3 font-bold">Pasokan tidak ditemukan</h2><p className="mt-1 text-sm text-ink-soft">Coba perluas lokasi, ukuran, atau rentang tanggal pencarian.</p><button className="mt-4 text-sm font-bold text-tide underline" type="button" onClick={resetFilters}>Hapus semua filter</button></div></div>}

      {catalog.data && catalog.data.data.length > 0 && (
        <div className={`grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 ${catalog.isFetching ? 'opacity-60' : ''}`} aria-busy={catalog.isFetching}>
          {catalog.data.data.map((supply) => (
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" key={supply.id}>
              <div className="relative"><img className="h-44 w-full object-cover" src={supply.photo_url || pondPlaceholder} alt={supply.photo_url ? `Kondisi ${supply.pond_name}` : 'Ilustrasi tambak bandeng'} /><span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-success shadow-sm"><i className="size-2 rounded-full bg-success" /> Tersedia</span></div>
              <div className="flex flex-1 flex-col gap-4 p-5"><div><p className="text-xs font-semibold text-tide">Bandeng {supply.fish_size.name}</p><h2 className="mt-1 text-lg font-bold">{supply.pond_name}</h2><p className="mt-1 text-sm text-ink-soft">Petambak {supply.farmer_name}</p></div><div className="grid grid-cols-2 gap-3 text-sm"><p className="flex items-center gap-2 text-ink-soft"><MapPin size={15} className="text-tide" /> Kec. {supply.location.name}</p><p className="flex items-center gap-2 text-ink-soft"><CalendarDays size={15} className="text-tide" /> {formatDate(supply.harvest_date)}</p></div><div className="flex items-end justify-between gap-4 border-y border-line py-3"><div><span className="block text-xs text-ink-soft">Volume tersedia</span><strong className="text-lg text-ink">{formatVolume(supply.available_volume_kg)} kg</strong></div><div className="text-right"><span className="block text-xs text-ink-soft">Perkiraan harga</span><strong className="text-sm text-tide">{formatPrice(supply.asking_price_per_kg)}</strong></div></div><div className="mt-auto grid grid-cols-2 gap-2"><Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line px-3 text-sm font-bold text-ink! no-underline hover:bg-panel-alt hover:no-underline" to={`/app/buyer/pasokan/${supply.id}`} state={{ from: `${location.pathname}${location.search}` }}>Lihat Detail</Link><WhatsAppLink supply={supply} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-tide px-3 text-center text-sm font-bold text-white! no-underline hover:bg-tide-dark hover:text-white! hover:no-underline" /></div></div>
            </article>
          ))}
        </div>
      )}

      {catalog.data && catalog.data.meta.last_page > 1 && <nav className="flex items-center justify-center gap-3" aria-label="Halaman katalog"><button className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-line bg-white px-3 text-sm font-semibold disabled:opacity-40" type="button" disabled={filters.page <= 1 || catalog.isFetching} onClick={() => updatePage(filters.page - 1)}><ChevronLeft size={16} /> Sebelumnya</button><span className="text-sm text-ink-soft">Halaman <strong className="text-ink">{filters.page}</strong> dari {catalog.data.meta.last_page}</span><button className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-line bg-white px-3 text-sm font-semibold disabled:opacity-40" type="button" disabled={filters.page >= catalog.data.meta.last_page || catalog.isFetching} onClick={() => updatePage(filters.page + 1)}>Berikutnya <ChevronRight size={16} /></button></nav>}
    </div>
  )
}
