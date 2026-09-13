import { AlertTriangle, CheckCircle2, Gauge, LoaderCircle, MapPin, SearchX, ShieldAlert } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useFarmerRisk } from '../hooks/useFarmerRisk'
import type { RiskLevel, RiskRegion } from '../types/farmerRisk.types'
import { formatDate, formatVolume } from '../../buyer/utils/catalogFormatters'

const riskCopy: Record<RiskLevel, { label: string; badge: string; bar: string }> = {
  safe: { label: 'Aman', badge: 'bg-success-soft text-success', bar: 'bg-success' },
  warning: { label: 'Waspada', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  high: { label: 'Risiko Tinggi', badge: 'bg-danger-soft text-danger', bar: 'bg-danger' },
}

export function FarmerRiskPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const week = searchParams.get('minggu') || undefined
  const risk = useFarmerRisk(week)

  if (risk.isLoading) return <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-ink-soft"><LoaderCircle className="animate-spin" size={18} /> Menghitung risiko panen...</div>
  if (risk.isError || !risk.data) return <div role="alert" className="rounded-xl border border-danger/20 bg-danger-soft p-5 text-sm text-danger">Risiko panen tidak dapat dimuat. <button className="font-bold underline" onClick={() => risk.refetch()}>Coba lagi</button></div>

  const data = risk.data
  const primary = data.my_regions.slice().sort((a, b) => b.utilization_percentage - a.utilization_percentage)[0]

  return <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-10 text-ink">
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><span className="text-xs font-semibold text-tide">Pemantauan Pasokan Wilayah</span><h1 className="mt-1 text-2xl font-bold md:text-3xl">Risiko Panen</h1><p className="mt-1 max-w-3xl text-sm text-ink-soft">Pantau konsentrasi rencana panen untuk mengantisipasi penumpukan pasokan dan menjaga kestabilan harga.</p></div><label className="grid gap-1 text-xs font-semibold">Pilih minggu<input className="min-h-10 rounded-lg border border-line bg-white px-3 text-sm" type="date" value={data.period.start} onChange={(event) => setSearchParams({ minggu: event.target.value })} /></label></header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatusCard icon={MapPin} label="Wilayah Tambak Anda" value={primary?.location.name ?? 'Belum ada'} hint={primary ? riskCopy[primary.risk_level].label : 'Tidak ada panen minggu ini'} />
      <StatusCard icon={CheckCircle2} label="Wilayah Aman" value={`${data.summary.safe_count} wilayah`} hint="Pasokan stabil" />
      <StatusCard icon={Gauge} label="Wilayah Waspada" value={`${data.summary.warning_count} wilayah`} hint="Mendekati kapasitas" />
      <StatusCard icon={ShieldAlert} label="Wilayah Risiko Tinggi" value={`${data.summary.high_count} wilayah`} hint="Potensi banjir pasokan" />
    </section>

    {primary && primary.risk_level !== 'safe' && <section className={`rounded-xl border p-5 ${primary.risk_level === 'high' ? 'border-danger/20 bg-danger-soft' : 'border-amber-200 bg-amber-50'}`}><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0" size={20} /><div><h2 className="font-bold">Peringatan Konsentrasi Panen di Kecamatan {primary.location.name}</h2><p className="mt-2 text-sm leading-6">Volume rencana panen wilayah mencapai <strong>{formatVolume(primary.total_volume_kg)} kg</strong> dari kapasitas <strong>{formatVolume(primary.threshold_volume_kg)} kg</strong>. Kontribusi rencana Anda sebesar <strong>{formatVolume(primary.my_volume_kg)} kg</strong>.</p><p className="mt-2 text-sm">Pertimbangkan mencari pembeli lebih awal atau meninjau kembali jadwal. SIGAP tidak mengubah tanggal panen secara otomatis.</p><div className="mt-4 flex flex-wrap gap-2"><Link className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-tide" to="/app/farmer/rekomendasi">Cari Pembeli yang Cocok</Link><Link className="rounded-lg bg-tide px-4 py-2 text-sm font-semibold text-white!" to="/app/farmer/rencana-panen">Tinjau Rencana Panen</Link></div></div></div></section>}

    {primary && <Capacity region={primary} />}
    {data.unconfigured_my_region_count > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Ada {data.unconfigured_my_region_count} wilayah rencana Anda yang belum memiliki threshold aktif. Status risikonya belum dapat dihitung.</div>}

    <section className="overflow-hidden rounded-xl border border-line bg-white"><div className="flex flex-col justify-between gap-3 border-b border-line p-4 md:flex-row md:items-center"><div><h2 className="font-bold">Ringkasan Wilayah Kabupaten Gresik</h2><p className="mt-1 text-xs text-ink-soft">Periode {formatDate(data.period.start)}–{formatDate(data.period.end)} · hanya wilayah dengan threshold aktif</p></div></div>
      {data.regions.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-panel-alt text-ink-soft"><tr><th className="p-4">Kecamatan</th><th className="p-4">Volume Rencana</th><th className="p-4">Kapasitas</th><th className="p-4">Rasio</th><th className="p-4">Status</th></tr></thead><tbody>{data.regions.map((region) => <tr key={region.location.id} className="border-t border-line"><td className="p-4 font-semibold">{region.location.name}{Number(region.my_volume_kg) > 0 && <span className="ml-2 rounded-full bg-success-soft px-2 py-1 text-[10px] text-success">Tambak Anda</span>}</td><td className="p-4">{formatVolume(region.total_volume_kg)} kg</td><td className="p-4">{formatVolume(region.threshold_volume_kg)} kg</td><td className="p-4"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-line"><div className={`h-full ${riskCopy[region.risk_level].bar}`} style={{ width: `${Math.min(region.utilization_percentage, 100)}%` }} /></div><span className="mt-1 block">{region.utilization_percentage}%</span></td><td className="p-4"><span className={`rounded-full px-2.5 py-1 font-semibold ${riskCopy[region.risk_level].badge}`}>{riskCopy[region.risk_level].label}</span></td></tr>)}</tbody></table></div> : <div className="grid min-h-44 place-items-center p-8 text-center"><div><SearchX className="mx-auto text-tide" /><h3 className="mt-3 font-bold">Threshold risiko belum tersedia</h3><p className="mt-1 text-sm text-ink-soft">Admin perlu mengatur kapasitas wilayah sebelum risiko dapat dihitung.</p></div></div>}
    </section>
  </div>
}

function StatusCard({ icon: Icon, label, value, hint }: { icon: typeof MapPin; label: string; value: string; hint: string }) { return <article className="rounded-xl border border-line bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs text-ink-soft">{label}</p><Icon className="text-tide" size={16} /></div><strong className="mt-3 block text-lg">{value}</strong><span className="mt-1 block text-xs text-ink-soft">{hint}</span></article> }
function Capacity({ region }: { region: RiskRegion }) { return <section className="rounded-xl border border-line bg-white p-5"><div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-bold">Kapasitas Wilayah: Kecamatan {region.location.name}</h2><p className="mt-1 text-xs text-ink-soft">Monitoring akumulasi volume panen aktif periode berjalan</p></div><strong>{formatVolume(region.total_volume_kg)} <span className="text-xs font-normal text-ink-soft">/ {formatVolume(region.threshold_volume_kg)} kg</span></strong></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-line"><div className={`h-full ${riskCopy[region.risk_level].bar}`} style={{ width: `${Math.min(region.utilization_percentage, 100)}%` }} /></div><div className="mt-4 grid gap-3 text-xs sm:grid-cols-3"><p><span className="block text-ink-soft">Kontribusi Tambak Anda</span><strong>{formatVolume(region.my_volume_kg)} kg</strong></p><p><span className="block text-ink-soft">Petambak Lain</span><strong>{formatVolume(region.other_volume_kg)} kg</strong></p><p><span className="block text-ink-soft">Sisa Kapasitas</span><strong>{formatVolume(region.remaining_volume_kg)} kg</strong></p></div>{region.source_note && <p className="mt-4 border-t border-line pt-3 text-xs text-ink-soft">Sumber threshold: {region.source_note}</p>}</section> }
