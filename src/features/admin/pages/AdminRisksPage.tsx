import { CheckCircle2, Gauge, ShieldAlert, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { MetricCard, PageHeader, QueryState } from '../components/AdminUi'
import { buttonPrimary, buttonSecondary, formatDate, formatNumber, inputClass } from '../adminUi'
import { useAdminRisk, useAdminRisks, useCoordinateRisk } from '../hooks/useAdmin'
import type { AdminRiskRegion, RiskLevel } from '../types/admin.types'

const riskCopy: Record<RiskLevel, { label: string; badge: string; bar: string }> = {
  safe: { label: 'Aman', badge: 'bg-success-soft text-success', bar: 'bg-success' },
  warning: { label: 'Waspada', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  high: { label: 'Risiko Tinggi', badge: 'bg-danger-soft text-danger', bar: 'bg-danger' },
}

export function AdminRisksPage() {
  const [params, setParams] = useSearchParams()
  const week = params.get('minggu') || undefined
  const status = params.get('status') || 'all'
  const risks = useAdminRisks(week)
  const [selected, setSelected] = useState<number | null>(null)
  const [confirm, setConfirm] = useState(false)
  const detail = useAdminRisk(selected)
  const coordinate = useCoordinateRisk()
  const data = risks.data

  useEffect(() => {
    if (selected === null) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && !confirm) setSelected(null) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [confirm, selected])

  if (!data) return <QueryState loading={risks.isLoading} error={risks.isError} onRetry={() => risks.refetch()} />

  const regions = data.regions.filter((region) => status === 'all' || status === region.risk_level || status === region.coordination_status)
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value && value !== 'all') next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-10">
      <PageHeader eyebrow="Koordinasi Wilayah" title="Risiko Panen Serentak" description="Pantau konsentrasi panen mingguan dan catat wilayah yang telah ditindaklanjuti.">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1 text-xs font-semibold">Pilih minggu<input className={inputClass} type="date" value={data.period.start} onChange={(event) => updateParam('minggu', event.target.value)} /></label>
          <label className="grid gap-1 text-xs font-semibold">Filter status<select className={inputClass} value={status} onChange={(event) => updateParam('status', event.target.value)}><option value="all">Semua status</option><option value="safe">Aman</option><option value="warning">Waspada</option><option value="high">Risiko tinggi</option><option value="uncoordinated">Belum dikoordinasikan</option><option value="coordinated">Sudah dikoordinasikan</option></select></label>
        </div>
      </PageHeader>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CheckCircle2} label="Wilayah Aman" value={`${data.summary.safe_count}`} hint="Di bawah batas waspada" />
        <MetricCard icon={Gauge} label="Wilayah Waspada" value={`${data.summary.warning_count}`} hint="Mendekati threshold" />
        <MetricCard icon={ShieldAlert} label="Risiko Tinggi" value={`${data.summary.high_count}`} hint="Melebihi threshold" />
        <MetricCard icon={Users} label="Belum Dikoordinasikan" value={`${data.summary.uncoordinated_count}`} hint="Waspada dan tinggi" />
      </section>
      <section className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="border-b border-line p-4"><h2 className="font-bold">Risiko per Kecamatan</h2><p className="mt-1 text-xs text-ink-soft">Periode {formatDate(data.period.start)}–{formatDate(data.period.end)}</p></div>
        {regions.length ? <div className="overflow-x-auto"><table className="w-full min-w-195 text-left text-xs"><thead className="bg-panel-alt text-ink-soft"><tr><th className="p-4">Kecamatan</th><th className="p-4">Volume / Threshold</th><th className="p-4">Pemakaian</th><th className="p-4">Status</th><th className="p-4">Koordinasi</th><th className="p-4">Aksi</th></tr></thead><tbody>{regions.map((region) => <RiskRow key={region.id} region={region} onOpen={() => setSelected(region.id)} />)}</tbody></table></div> : <p className="p-6 text-sm text-ink-soft">Tidak ada wilayah sesuai filter status.</p>}
      </section>

      {selected !== null && <div className="fixed inset-0 z-50 grid place-items-center bg-tide-dark/55 p-4" onMouseDown={(event) => { if (event.currentTarget === event.target && !confirm) setSelected(null) }}><section role="dialog" aria-modal="true" aria-labelledby="risk-detail-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 id="risk-detail-title" className="text-lg font-bold">Detail Koordinasi Risiko</h2><p className="text-xs text-ink-soft">Snapshot kontributor pada saat perhitungan.</p></div><button className={buttonSecondary} onClick={() => setSelected(null)}>Tutup</button></div><QueryState loading={detail.isLoading} error={detail.isError} onRetry={() => detail.refetch()} />{detail.data && <><div className="mt-5 grid gap-3 rounded-lg bg-panel-alt p-4 sm:grid-cols-3"><p className="text-xs text-ink-soft">Kecamatan<strong className="mt-1 block text-sm text-ink">{detail.data.location.name}</strong></p><p className="text-xs text-ink-soft">Volume<strong className="mt-1 block text-sm text-ink">{formatNumber(detail.data.total_volume_kg)} kg</strong></p><p className="text-xs text-ink-soft">Status<strong className="mt-1 block text-sm text-ink">{riskCopy[detail.data.risk_level].label}</strong></p></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-140 text-left text-xs"><thead><tr className="text-ink-soft"><th className="pb-2">Petambak</th><th>Tambak</th><th>Tanggal</th><th>Volume</th></tr></thead><tbody>{detail.data.contributors.map((item) => <tr key={item.harvest_plan_id} className="border-t border-line"><td className="py-3 font-semibold">{item.farmer_name}</td><td>{item.pond_name}</td><td>{formatDate(item.harvest_date)}</td><td>{formatNumber(item.volume_kg)} kg</td></tr>)}</tbody></table></div>{detail.data.suggestions.length > 0 && <section className="mt-5"><h3 className="text-sm font-bold">Saran Jadwal Tersedia</h3><div className="mt-2 grid gap-2">{detail.data.suggestions.map((suggestion) => <article key={suggestion.id} className="rounded-lg border border-line p-3 text-xs"><p className="font-semibold">{formatDate(suggestion.suggested_start_date)}–{formatDate(suggestion.suggested_end_date)}</p><p className="mt-1 text-ink-soft">{suggestion.reason}</p><span className="mt-2 inline-block rounded-full bg-panel-alt px-2 py-1 font-semibold">{suggestion.status}</span></article>)}</div><p className="mt-2 text-xs text-ink-soft">Saran bersifat informatif. Perubahan jadwal tetap menjadi keputusan Petambak.</p></section>}{detail.data.coordination_status === 'uncoordinated' && detail.data.risk_level !== 'safe' && <button className={`${buttonPrimary} mt-5`} onClick={() => setConfirm(true)}>Tandai Dikoordinasikan</button>}</>}</section></div>}
      <ConfirmDialog open={confirm} title="Tandai sudah dikoordinasikan?" description="Nama Admin dan waktu koordinasi akan dicatat. Status ini tidak mengubah tanggal panen Petambak." confirmLabel="Ya, Tandai" pending={coordinate.isPending} error={coordinate.isError ? 'Koordinasi gagal disimpan.' : undefined} onCancel={() => setConfirm(false)} onConfirm={() => selected && coordinate.mutate(selected, { onSuccess: () => { setConfirm(false); void detail.refetch(); void risks.refetch() } })} />
    </div>
  )
}

function RiskRow({ region, onOpen }: { region: AdminRiskRegion; onOpen: () => void }) {
  return <tr className="border-t border-line hover:bg-canvas"><td className="p-4 font-semibold">{region.location.name}<span className="mt-1 block font-normal text-ink-soft">{region.contributor_count} kontributor</span></td><td className="p-4">{formatNumber(region.total_volume_kg)} / {formatNumber(region.threshold_volume_kg)} kg</td><td className="p-4"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-line"><div className={`h-full ${riskCopy[region.risk_level].bar}`} style={{ width: `${Math.min(region.utilization_percentage, 100)}%` }} /></div><span className="mt-1 block">{region.utilization_percentage}%</span></td><td className="p-4"><span className={`rounded-full px-2.5 py-1 font-semibold ${riskCopy[region.risk_level].badge}`}>{riskCopy[region.risk_level].label}</span></td><td className="p-4">{region.coordination_status === 'coordinated' ? <span className="font-semibold text-success">✓ Dikoordinasikan</span> : <span className="text-ink-soft">Belum</span>}</td><td className="p-4"><button className={buttonSecondary} onClick={onOpen}>Detail</button></td></tr>
}
