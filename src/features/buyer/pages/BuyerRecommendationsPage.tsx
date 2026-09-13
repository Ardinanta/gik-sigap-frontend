import { CheckCircle2, Filter, Handshake, LoaderCircle, MapPin, RefreshCw, Scale, Search, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { getApiError } from '../../../lib/utils'
import { WhatsAppLink } from '../components/WhatsAppLink'
import { useBuyerDemands } from '../hooks/useBuyerDemands'
import { useCreatePartnership } from '../hooks/usePartnerships'
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

function RecommendationCard({ recommendation, returnTo, onPartnership }: { recommendation: Recommendation; returnTo: string; onPartnership: (recommendation: Recommendation) => void }) {
  const { supply } = recommendation
  const locationMatched = recommendation.score_breakdown.location > 0

  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="buyer-typography-card-title truncate">{supply.pond_name}</h2>
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

      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-[0.8fr_1fr_1.3fr]">
        <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold text-ink! no-underline transition-all hover:border-tide hover:bg-success-soft hover:text-tide! hover:no-underline" to={`/app/buyer/pasokan/${supply.id}`} state={{ from: returnTo }}><Search size={16} /> Detail</Link>
        <WhatsAppLink supply={supply} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold text-ink! no-underline transition-all hover:border-tide hover:bg-success-soft hover:text-tide! hover:no-underline" />
        <button className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-tide px-4 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-tide-dark hover:shadow-md active:translate-y-0 active:scale-[.98]" type="button" onClick={() => onPartnership(recommendation)}><Handshake className="shrink-0" size={16} /> Ajukan Kemitraan</button>
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
  const demandId = requestedDemandId ?? activeDemands[0]?.id ?? null
  const recommendations = useRecommendations(demandId)
  const selectedDemand = recommendations.data?.demand ?? activeDemands.find((demand) => demand.id === demandId)
  const generate = useGenerateRecommendations(demandId ?? 0)
  const createPartnership = useCreatePartnership(demandId)
  const [partnershipTarget, setPartnershipTarget] = useState<Recommendation | null>(null)
  const [partnershipError, setPartnershipError] = useState('')
  const [partnershipMessage, setPartnershipMessage] = useState('')

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

  const confirmPartnership = async () => {
    if (!partnershipTarget) return
    try {
      const response = await createPartnership.mutateAsync(partnershipTarget.id)
      setPartnershipTarget(null)
      setPartnershipError('')
      setPartnershipMessage(response.message)
    } catch (error) {
      setPartnershipError(getApiError(error, 'Pengajuan kemitraan belum dapat dibuat. Silakan coba lagi.').message)
    }
  }

  return (
    <div className="buyer-page grid gap-5 text-ink">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <span className="buyer-typography-eyebrow"><Sparkles size={14} /> Pencocokan Otomatis AI</span>
          <h1 className="buyer-typography-page-title mt-2">Rekomendasi Tambak Cocok</h1>
          <p className="buyer-typography-page-description mt-1">Daftar tambak Bandeng yang paling sesuai dengan kebutuhan volume, ukuran, lokasi, dan jadwal Anda.</p>
        </div>
        {demandId && <button className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-line bg-white px-4 text-xs font-semibold text-ink hover:bg-panel-alt" type="button" disabled={generate.isPending} onClick={() => generate.mutate()}>{generate.isPending ? <LoaderCircle className="spinner" size={15} /> : <RefreshCw size={15} />} Sinkronisasi</button>}
      </section>

      {partnershipMessage && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-success-soft p-4 text-sm font-medium text-success" role="status"><span>{partnershipMessage}</span><Link className="font-bold text-tide" to="/app/buyer/kemitraan">Buka Kemitraan →</Link></div>}

      {demands.isLoading && <div className="grid min-h-48 place-items-center rounded-xl border border-line bg-white"><LoaderCircle className="spinner text-tide" /></div>}
      {demands.isError && <div className="rounded-xl border border-danger/20 bg-danger-soft p-6 text-sm text-danger">Kebutuhan aktif belum dapat dimuat. <button className="ml-2 font-bold underline" type="button" onClick={() => demands.refetch()}>Coba lagi</button></div>}

      {recommendations.isError && !selectedDemand && <div role="alert" className="rounded-xl border border-danger/20 bg-danger-soft p-6 text-sm text-danger">Kebutuhan pada tautan ini tidak dapat dimuat. <Link to="/app/buyer/rekomendasi">Pilih kebutuhan aktif</Link></div>}

      {!demandId && !demands.isLoading && !demands.isError && activeDemands.length === 0 && (
        <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-line bg-white p-8 text-center"><div><Filter className="mx-auto text-tide" size={32} /><h2 className="mt-3 font-bold">Belum ada kebutuhan aktif</h2><p className="mt-1 text-sm text-ink-soft">Buat kebutuhan terlebih dahulu agar SIGAP dapat mencarikan tambak yang sesuai.</p><Link className="mt-4 inline-flex rounded-lg bg-tide px-5 py-2.5 text-sm font-semibold text-white! no-underline hover:text-white!" to="/app/buyer/kebutuhan">Buat Kebutuhan</Link></div></div>
      )}

      {selectedDemand && (
        <>
          <section className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="grid gap-1 text-xs font-semibold">Hasil Rekomendasi
              <select className="min-h-10 min-w-64 rounded-lg border border-line bg-white px-3 text-sm font-medium" value={selectedDemand.id} onChange={(event) => changeDemand(Number(event.target.value))}>
                {!activeDemands.some((demand) => demand.id === selectedDemand.id) && <option value={selectedDemand.id}>{formatVolume(selectedDemand.required_volume_kg)} kg · Bandeng {selectedDemand.fish_size.name}</option>}
                {activeDemands.map((demand) => <option value={demand.id} key={demand.id}>{formatVolume(demand.required_volume_kg)} kg · Bandeng {demand.fish_size.name}</option>)}
              </select>
            </label>
            <span className="text-xs text-ink-soft">Sinkronisasi terakhir: <strong className="text-ink">{synchronizedAt(latestMatch)}</strong></span>
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-success/15 bg-success-soft/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-tide"><Filter size={17} /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Kriteria Pencarian Anda</p><p className="mt-1 text-sm font-semibold">{formatVolume(selectedDemand.required_volume_kg)} kg Bandeng {selectedDemand.fish_size.name} · {selectedDemand.target_location ? `Kec. ${selectedDemand.target_location.name}` : 'Semua Kecamatan'} · {formatDate(selectedDemand.need_start_date)}–{formatDate(selectedDemand.need_end_date)}</p></div></div>
            <Link className="shrink-0 text-sm font-semibold text-tide" to="/app/buyer/kebutuhan">Ubah Kebutuhan →</Link>
          </section>

          {recommendations.isLoading && <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div className="h-72 animate-pulse rounded-xl border border-line bg-white" key={index} />)}</div>}
          {recommendations.isError && <div className="rounded-xl border border-danger/20 bg-danger-soft p-6 text-sm text-danger">Rekomendasi belum dapat dimuat. <button className="ml-2 font-bold underline" type="button" onClick={() => recommendations.refetch()}>Coba lagi</button></div>}
          {generate.isError && <div className="rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger">Sinkronisasi gagal. Silakan coba kembali.</div>}
          {recommendations.data?.data.length === 0 && <div className="grid min-h-52 place-items-center rounded-xl border border-dashed border-line bg-white p-8 text-center"><div><Sparkles className="mx-auto text-tide" size={30} /><h2 className="mt-3 font-bold">Belum ada tambak yang cukup cocok</h2><p className="mt-1 text-sm text-ink-soft">Sinkronkan rekomendasi atau ubah kriteria kebutuhan agar pilihan lebih luas.</p><button className="mt-4 rounded-lg bg-tide px-5 py-2.5 text-sm font-semibold text-white" type="button" disabled={generate.isPending} onClick={() => generate.mutate()}>Sinkronkan Sekarang</button></div></div>}

          {recommendations.data && recommendations.data.data.length > 0 && <section className="grid items-stretch gap-4 md:grid-cols-2">{recommendations.data.data.map((recommendation) => <RecommendationCard recommendation={recommendation} returnTo={returnTo} onPartnership={(target) => { setPartnershipError(''); setPartnershipTarget(target) }} key={recommendation.id} />)}</section>}
        </>
      )}

      <ConfirmDialog
        open={partnershipTarget !== null}
        title="Ajukan kemitraan?"
        description={partnershipTarget ? `Minat kemitraan dengan ${partnershipTarget.supply.pond_name} akan dikirim. Pengajuan ini belum mengalokasikan volume sampai kedua pihak mencapai kesepakatan.` : ''}
        confirmLabel="Ya, Ajukan"
        pending={createPartnership.isPending}
        error={partnershipError || undefined}
        onCancel={() => { setPartnershipTarget(null); setPartnershipError('') }}
        onConfirm={confirmPartnership}
      />
    </div>
  )
}
