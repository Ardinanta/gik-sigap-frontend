import { Banknote, CircleDollarSign, GitCompareArrows, ShieldAlert, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdminDashboard } from '../hooks/useAdmin'
import { MetricCard, PageHeader, QueryState } from '../components/AdminUi'
import { buttonSecondary, formatCurrency, formatDate, formatNumber } from '../adminUi'
import { PriceTrendChart } from '../components/PriceTrendChart'
import type { RiskLevel } from '../types/admin.types'

const riskCopy: Record<RiskLevel, { label: string; badge: string }> = {
  safe: { label: 'Aman', badge: 'bg-success-soft text-success' },
  warning: { label: 'Waspada', badge: 'bg-amber-100 text-amber-800' },
  high: { label: 'Risiko Tinggi', badge: 'bg-danger-soft text-danger' },
}

export function AdminDashboardPage() {
  const dashboard = useAdminDashboard()
  const data = dashboard.data

  if (!data) return <QueryState loading={dashboard.isLoading} error={dashboard.isError} onRetry={() => dashboard.refetch()} />

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-10">
      <PageHeader eyebrow="Ringkasan Operasional" title="Dashboard Admin" description="Pantau pasokan, kebutuhan pasar, matching, risiko wilayah, dan hasil transaksi SIGAP dari satu tempat." />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Sprout} label="Estimasi Pasokan" value={`${formatNumber(data.summary.planned_supply_kg)} kg`} hint={`${formatDate(data.period.start)}–${formatDate(data.period.end)}`} />
        <MetricCard icon={GitCompareArrows} label="Kebutuhan Aktif" value={`${formatNumber(data.summary.active_demand_kg)} kg`} hint={`${data.summary.active_match_count} matching aktif`} />
        <MetricCard icon={ShieldAlert} label="Prioritas Risiko" value={`${data.summary.warning_risk_count + data.summary.high_risk_count} wilayah`} hint={`${data.summary.uncoordinated_risk_count} belum dikoordinasikan`} />
        <MetricCard icon={Banknote} label="Volume Transaksi" value={`${formatNumber(data.summary.transaction_volume_kg)} kg`} hint={`${data.summary.transaction_count} transaksi periode ini`} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-xl border border-line bg-white p-5">
          <div className="mb-5">
            <h2 className="font-bold">Tren Harga Bandeng</h2>
            <p className="mt-1 text-xs text-ink-soft">Harga rata-rata tertimbang berdasarkan volume transaksi final.</p>
          </div>
          <PriceTrendChart points={data.price_trend} />
        </article>
        <div className="grid gap-5">
          <article className="rounded-xl border border-line bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">Prioritas Risiko</h2>
                <p className="mt-1 text-xs text-ink-soft">Minggu {formatDate(data.risk_period.start)}–{formatDate(data.risk_period.end)}</p>
              </div>
              <Link className={buttonSecondary} to="/app/admin/risiko">Lihat Semua</Link>
            </div>
            <div className="mt-4 grid gap-2">
              {data.risk_priorities.length ? data.risk_priorities.map((risk) => (
                <Link key={risk.id} to="/app/admin/risiko" className="flex items-center justify-between gap-3 rounded-lg border border-line p-3 transition-colors hover:border-[#a9bbb5] hover:bg-panel-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide">
                  <span className="min-w-0"><strong className="block truncate text-sm">{risk.location.name}</strong><span className="text-xs text-ink-soft">{risk.utilization_percentage}% kapasitas · {risk.contributor_count} kontributor</span></span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${riskCopy[risk.risk_level].badge}`}>{riskCopy[risk.risk_level].label}</span>
                </Link>
              )) : <p className="rounded-lg bg-success-soft p-4 text-sm text-success">Tidak ada wilayah berstatus waspada atau risiko tinggi.</p>}
            </div>
          </article>
          <article className="rounded-xl border border-line bg-white p-5">
            <h2 className="font-bold">Akses Cepat</h2>
            <div className="mt-4 grid gap-2">
              <Link className={buttonSecondary} to="/app/admin/rencana-panen">Pantau Rencana Panen</Link>
              <Link className={buttonSecondary} to="/app/admin/transaksi">Lihat Harga & Transaksi</Link>
              <Link className={buttonSecondary} to="/app/admin/master-data">Kelola Master Data</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <MetricCard icon={CircleDollarSign} label="Harga Rata-rata Tertimbang" value={formatCurrency(data.summary.weighted_average_price)} hint={`Nilai transaksi ${formatCurrency(data.summary.transaction_value)}`} />
        <MetricCard icon={ShieldAlert} label="Risiko Tinggi" value={`${data.summary.high_risk_count} wilayah`} hint={`${data.summary.warning_risk_count} wilayah waspada`} />
      </section>

      <section className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="border-b border-line p-4"><h2 className="font-bold">Transaksi Terbaru</h2></div>
        {data.latest_transactions.length ? <div className="overflow-x-auto"><table className="w-full min-w-170 text-left text-xs"><thead className="bg-panel-alt text-ink-soft"><tr><th className="p-4">Tanggal</th><th className="p-4">Petambak</th><th className="p-4">Pembeli</th><th className="p-4">Volume</th><th className="p-4">Harga/kg</th></tr></thead><tbody>{data.latest_transactions.map((item) => <tr key={item.id} className="border-t border-line"><td className="p-4">{formatDate(item.transaction_date)}</td><td className="p-4 font-semibold">{item.seller_name}</td><td className="p-4">{item.buyer_name}</td><td className="p-4">{formatNumber(item.volume_kg)} kg</td><td className="p-4">{formatCurrency(item.price_per_kg)}</td></tr>)}</tbody></table></div> : <p className="p-6 text-sm text-ink-soft">Belum ada transaksi final pada periode ini.</p>}
      </section>
    </div>
  )
}
