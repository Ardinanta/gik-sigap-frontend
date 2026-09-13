import { Building2, LoaderCircle, MessageCircle, SearchX, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFarmerHarvestPlans } from '../hooks/useFarmerHarvestPlans'
import { useFarmerMatches } from '../hooks/useFarmerMatches'
import { formatDate, formatVolume } from '../../buyer/utils/catalogFormatters'

function numericId(value: string | null) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

export function FarmerRecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const selectedPlanId = numericId(searchParams.get('rencana'))
  const plans = useFarmerHarvestPlans()
  const matches = useFarmerMatches(selectedPlanId, page)
  const selectedPlan = plans.data?.data.find((plan) => plan.id === selectedPlanId)

  const selectPlan = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('rencana', value)
    else next.delete('rencana')
    setPage(1)
    setSearchParams(next)
  }

  return <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-10 text-ink">
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><span className="inline-flex items-center gap-2 text-xs font-semibold text-tide"><Sparkles size={14} /> Pencocokan Pasar</span><h1 className="mt-1 text-2xl font-bold md:text-3xl">Rekomendasi Pembeli</h1><p className="mt-1 text-sm text-ink-soft">Pembeli dengan kebutuhan aktif yang cocok dengan rencana panen Anda.</p></div>
      <label className="grid gap-1 text-xs font-semibold">Rencana panen<select className="min-h-10 min-w-60 rounded-lg border border-line bg-white px-3 text-sm font-medium" value={selectedPlanId ?? ''} disabled={plans.isLoading || plans.isError} onChange={(event) => selectPlan(event.target.value)}><option value="">Semua rencana aktif</option>{plans.data?.data.map((plan) => <option key={plan.id} value={plan.id}>{plan.pond_name} · {formatDate(plan.harvest_date)}</option>)}</select></label>
    </header>

    {selectedPlan && <section className="rounded-xl border border-line bg-white p-4 text-sm"><strong>{selectedPlan.pond_name}</strong><span className="ml-2 text-ink-soft">{formatVolume(selectedPlan.estimated_volume_kg)} kg Bandeng {selectedPlan.fish_size.name} · panen {formatDate(selectedPlan.harvest_date)}</span></section>}

    {matches.isLoading && <div className="flex min-h-40 items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm text-ink-soft"><LoaderCircle className="animate-spin" size={18} /> Memuat rekomendasi...</div>}
    {matches.isError && <div className="rounded-xl border border-danger/20 bg-danger-soft p-5 text-sm text-danger" role="alert">Rekomendasi pembeli tidak dapat dimuat. <button className="font-bold underline" type="button" onClick={() => matches.refetch()}>Coba lagi</button></div>}
    {matches.data?.data.length === 0 && <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-line bg-white p-8 text-center"><div><SearchX className="mx-auto text-tide" size={30} /><h2 className="mt-3 font-bold">Belum ada pembeli yang cocok</h2><p className="mt-1 text-sm text-ink-soft">Rekomendasi akan muncul setelah kebutuhan pembeli dicocokkan dengan rencana panen Anda.</p></div></div>}

    {matches.data && matches.data.data.length > 0 && <section className="grid gap-3" aria-label="Daftar rekomendasi pembeli">{matches.data.data.map((match) => <article key={match.id} className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4 shadow-sm md:flex-row md:items-center">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-success-soft text-tide"><Building2 size={20} /></span>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{match.buyer.name ?? 'Pembeli SIGAP'}</h2><span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-bold text-success">{Math.round(Number(match.match_score))}% Cocok</span></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft"><span><strong className="text-ink">{formatVolume(match.demand.required_volume_kg)} kg</strong> Bandeng {match.demand.fish_size.name}</span><span>{formatDate(match.demand.need_start_date)}–{formatDate(match.demand.need_end_date)}</span><span>Untuk pasokan {match.harvest_plan.pond_name}</span></div></div>
      {match.buyer.whatsapp_url ? <a className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-success-soft px-4 text-sm font-semibold text-success hover:bg-[#cfe8d8]" href={match.buyer.whatsapp_url} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Hubungi WhatsApp</a> : <span className="text-xs text-ink-soft">Nomor WhatsApp belum tersedia</span>}
    </article>)}</section>}

    {matches.data && matches.data.meta.last_page > 1 && <div className="flex items-center justify-end gap-3"><button className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40" disabled={page <= 1 || matches.isFetching} onClick={() => setPage((value) => value - 1)}>Sebelumnya</button><span className="text-sm text-ink-soft">Halaman {page} dari {matches.data.meta.last_page}</span><button className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40" disabled={page >= matches.data.meta.last_page || matches.isFetching} onClick={() => setPage((value) => value + 1)}>Berikutnya</button></div>}
  </div>
}
