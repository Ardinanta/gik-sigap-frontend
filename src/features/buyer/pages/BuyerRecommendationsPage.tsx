import { CheckCircle2, Filter, LoaderCircle, MapPin, RefreshCw, Scale, Search, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { WhatsAppLink } from '../components/WhatsAppLink'
import { useBuyerDemands } from '../hooks/useBuyerDemands'
import { useGenerateRecommendations, useRecommendations } from '../hooks/useRecommendations'
import type { Recommendation } from '../types/recommendation.types'
import { formatDate, formatPrice, formatVolume } from '../utils/catalogFormatters'

function numericId(value: string | null) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function synchronizedAt(value: string | undefined) {
  if (!value) return 'Belum pernah disinkronkan'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function RecommendationCard({ recommendation, returnTo }: { recommendation: Recommendation; returnTo: string }) {
  const { supply } = recommendation
  const locationMatched = recommendation.score_breakdown.location > 0

  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-bold">{supply.pond_name}</h2>
            <CheckCircle2 className="shrink-0 text-tide" size={15} aria-label="Pasokan aktif" />
          </div>
          <p className="mt-1 text-xs text-ink-soft">Petambak {supply.farmer_name} · {supply.location.name}, Gresik</p>
        </div>
        <span className="shrink-0 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
          {Math.round(Number(recommendation.match_score))}% {recommendation.score_category}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line text-xs sm:grid-cols-4">
        <div className="bg-panel-alt p-3"><dt className="text-ink-soft">Volume Tersedia</dt><dd className="mt-1 font-bold text-ink">{formatVolume(supply.available_volume_kg)} kg</dd></div>
        <div className="bg-panel-alt p-3"><dt className="text-ink-soft">Ukuran</dt><dd className="mt-1 font-bold text-ink">{supply.fish_size.name}</dd></div>
        <div className="bg-panel-alt p-3"><dt className="text-ink-soft">Tgl Panen</dt><dd className="mt-1 font-bold text-ink">{formatDate(supply.harvest_date)}</dd></div>
        <div className="bg-panel-alt p-3"><dt className="text-ink-soft">Penawaran</dt><dd className="mt-1 font-bold text-tide">{formatPrice(supply.asking_price_per_kg)}</dd></div>
      </dl>

      <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-tide" /> {locationMatched ? 'Wilayah sesuai kebutuhan' : `Tersedia di Kec. ${supply.location.name}`}</span>
        <span className="inline-flex items-center gap-1.5"><Scale size={14} className="text-tide" /> Skor volume {recommendation.score_breakdown.volume.toFixed(1)}/15</span>
      </div>

      <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-5">
        <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-tide px-4 text-sm font-semibold text-white! no-underline hover:bg-tide-dark hover:text-white! hover:no-underline" to={`/app/buyer/pasokan/${supply.id}`} state={{ from: returnTo }}><Search size={15} /> Lihat Detail</Link>
        <WhatsAppLink supply={supply} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-ink! no-underline hover:bg-panel-alt hover:no-underline" />
      </div>
    </article>
  )
}

export function BuyerRecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const demands = useBuyerDemands(1, 100)
  const requestedDemandId = numericId(searchParams.get('demand'))
  const activeDemands = demands.data?.data ?? []
  const selectedDemand = activeDemands.find((demand) => demand.id === requestedDemandId) ?? activeDemands[0]
  const demandId = selectedDemand?.id ?? null
  const recommendations = useRecommendations(demandId)
  const generate = useGenerateRecommendations(demandId ?? 0)

  useEffect(() => {
    if (!selectedDemand || requestedDemandId === selectedDemand.id) return
    const next = new URLSearchParams(searchParams)
    next.set('demand', String(selectedDemand.id))
    setSearchParams(next, { replace: true })
  }, [requestedDemandId, searchParams, selectedDemand, setSearchParams])

  const changeDemand = (id: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('demand', String(id))
    setSearchParams(next)
  }

  const latestMatch = recommendations.data?.data[0]?.matched_at
  const returnTo = `${location.pathname}${location.search}`

  return (
    <div className="buyer-page grid gap-5 text-ink">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-tide"><Sparkles size={14} /> Pencocokan Otomatis AI</span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Rekomendasi Tambak Cocok</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">Daftar tambak Bandeng yang paling sesuai dengan kebutuhan volume, ukuran, lokasi, dan jadwal Anda.</p>
        </div>
        {demandId && <button className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-line bg-white px-4 text-xs font-semibold text-ink hover:bg-panel-alt" type="button" disabled={generate.isPending} onClick={() => generate.mutate()}>{generate.isPending ? <LoaderCircle className="spinner" size={15} /> : <RefreshCw size={15} />} Sinkronisasi</button>}
      </section>

      {demands.isLoading && <div className="grid min-h-48 place-items-center rounded-xl border border-line bg-white"><LoaderCircle className="spinner text-tide" /></div>}
      {demands.isError && <div className="rounded-xl border border-danger/20 bg-danger-soft p-6 text-sm text-danger">Kebutuhan aktif belum dapat dimuat. <button className="ml-2 font-bold underline" type="button" onClick={() => demands.refetch()}>Coba lagi</button></div>}

      {!demands.isLoading && !demands.isError && activeDemands.length === 0 && (
        <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-line bg-white p-8 text-center"><div><Filter className="mx-auto text-tide" size={32} /><h2 className="mt-3 font-bold">Belum ada kebutuhan aktif</h2><p className="mt-1 text-sm text-ink-soft">Buat kebutuhan terlebih dahulu agar SIGAP dapat mencarikan tambak yang sesuai.</p><Link className="mt-4 inline-flex rounded-lg bg-tide px-5 py-2.5 text-sm font-semibold text-white! no-underline hover:text-white!" to="/app/buyer/kebutuhan">Buat Kebutuhan</Link></div></div>
      )}

      {selectedDemand && (
        <>
          <section className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="grid gap-1 text-xs font-semibold">Hasil Rekomendasi
              <select className="min-h-10 min-w-64 rounded-lg border border-line bg-white px-3 text-sm font-medium" value={selectedDemand.id} onChange={(event) => changeDemand(Number(event.target.value))}>
                {activeDemands.map((demand) => <option value={demand.id} key={demand.id}>{formatVolume(demand.required_volume_kg)} kg · Bandeng {demand.fish_size.name}</option>)}
              </select>
            </label>
            <span className="text-xs text-ink-soft">Sinkronisasi terakhir: <strong className="text-ink">{synchronizedAt(latestMatch)}</strong></span>
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-success/15 bg-success-soft/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-tide"><Filter size={17} /></span><div><p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Kriteria Pencarian Anda</p><p className="mt-1 text-sm font-semibold">{formatVolume(selectedDemand.required_volume_kg)} kg Bandeng {selectedDemand.fish_size.name} · {selectedDemand.target_location ? `Kec. ${selectedDemand.target_location.name}` : 'Semua Kecamatan'} · {formatDate(selectedDemand.need_start_date)}–{formatDate(selectedDemand.need_end_date)}</p></div></div>
            <Link className="shrink-0 text-sm font-semibold text-tide" to="/app/buyer/kebutuhan">Ubah Kebutuhan →</Link>
          </section>

          {recommendations.isLoading && <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div className="h-72 animate-pulse rounded-xl border border-line bg-white" key={index} />)}</div>}
          {recommendations.isError && <div className="rounded-xl border border-danger/20 bg-danger-soft p-6 text-sm text-danger">Rekomendasi belum dapat dimuat. <button className="ml-2 font-bold underline" type="button" onClick={() => recommendations.refetch()}>Coba lagi</button></div>}
          {generate.isError && <div className="rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger">Sinkronisasi gagal. Silakan coba kembali.</div>}
          {recommendations.data?.data.length === 0 && <div className="grid min-h-52 place-items-center rounded-xl border border-dashed border-line bg-white p-8 text-center"><div><Sparkles className="mx-auto text-tide" size={30} /><h2 className="mt-3 font-bold">Belum ada tambak yang cukup cocok</h2><p className="mt-1 text-sm text-ink-soft">Sinkronkan rekomendasi atau ubah kriteria kebutuhan agar pilihan lebih luas.</p><button className="mt-4 rounded-lg bg-tide px-5 py-2.5 text-sm font-semibold text-white" type="button" disabled={generate.isPending} onClick={() => generate.mutate()}>Sinkronkan Sekarang</button></div></div>}

          {recommendations.data && recommendations.data.data.length > 0 && <section className="grid items-stretch gap-4 md:grid-cols-2">{recommendations.data.data.map((recommendation) => <RecommendationCard recommendation={recommendation} returnTo={returnTo} key={recommendation.id} />)}</section>}
        </>
      )}
    </div>
  )
}
