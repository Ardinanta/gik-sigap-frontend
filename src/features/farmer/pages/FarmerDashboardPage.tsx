import {
  ArrowRight,
  CalendarDays,
  Handshake,
  LoaderCircle,
  Scale,
  Sparkles,
  Sprout,
  TriangleAlert,
  WalletCards,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../auth/hooks/useAuth'
import { formatDate, formatVolume } from '../../buyer/utils/catalogFormatters'
import { useFarmerHarvestPlans } from '../hooks/useFarmerHarvestPlans'
import {
  useFarmerPartnerships,
  useFarmerReservations,
  useFarmerTransactions,
} from '../hooks/useFarmerPartnerships'

const shortcuts = [
  {
    title: 'Kelola Rencana Panen',
    description: 'Catat dan perbarui informasi pasokan bandeng dari tambak Anda.',
    path: '/app/farmer/rencana-panen',
    icon: Sprout,
  },
  {
    title: 'Cari Pembeli',
    description: 'Lihat pembeli yang paling sesuai dengan rencana panen aktif.',
    path: '/app/farmer/rekomendasi',
    icon: Sparkles,
  },
  {
    title: 'Kelola Kemitraan',
    description: 'Tinjau permintaan baru dan pantau kesepakatan yang berjalan.',
    path: '/app/farmer/kemitraan',
    icon: Handshake,
  },
  {
    title: 'Pantau Risiko Panen',
    description: 'Antisipasi konsentrasi pasokan di wilayah dan periode panen Anda.',
    path: '/app/farmer/risiko',
    icon: TriangleAlert,
  },
]

export function FarmerDashboardPage() {
  const user = useCurrentUser()
  const plans = useFarmerHarvestPlans()
  const partnerships = useFarmerPartnerships('active', 1)
  const reservations = useFarmerReservations(1)
  const transactions = useFarmerTransactions(1)

  const summary = partnerships.data?.summary
  const pendingPartnerships = partnerships.data?.data.filter((item) => item.status === 'interested').length ?? 0
  const pendingRequests = pendingPartnerships + (reservations.data?.meta.total ?? 0)
  const nextPlan = plans.data?.data
    .slice()
    .sort((left, right) => left.harvest_date.localeCompare(right.harvest_date))[0]
  const latestTransaction = transactions.data?.data[0]
  const loading = plans.isLoading || partnerships.isLoading || reservations.isLoading || transactions.isLoading
  const hasError = plans.isError || partnerships.isError || reservations.isError || transactions.isError

  const retry = () => {
    if (plans.isError) void plans.refetch()
    if (partnerships.isError) void partnerships.refetch()
    if (reservations.isError) void reservations.refetch()
    if (transactions.isError) void transactions.refetch()
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-10 text-ink">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-tide">Dashboard Petambak</span>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">Selamat datang, {user.data?.name ?? 'Petambak'}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
            Pantau kesiapan panen, permintaan pembeli, dan hasil kemitraan tambak Anda dari satu tempat.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg border border-tide bg-tide px-4 text-sm font-semibold no-underline shadow-sm transition-all hover:bg-tide-dark hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide"
          style={{ color: '#fff' }}
          to="/app/farmer/rencana-panen"
        >
          <Sprout size={17} /> Tambah Rencana Panen
        </Link>
      </header>

      {loading && (
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-4 text-sm text-ink-soft">
          <LoaderCircle className="animate-spin" size={18} /> Memperbarui ringkasan dashboard...
        </div>
      )}
      {hasError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger">
          <span>Sebagian data dashboard belum dapat dimuat. Informasi lain yang tersedia tetap ditampilkan.</span>
          <button type="button" onClick={retry} className="rounded-lg border border-danger/20 bg-white px-3 py-2 font-semibold hover:bg-danger-soft">Coba Lagi</button>
        </div>
      )}

      <section aria-label="Ringkasan operasional" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={Sprout} label="Rencana Panen Aktif" value={plans.isError ? '—' : String(plans.data?.meta.total ?? 0)} hint="Pasokan tercatat" />
        <Metric icon={Handshake} label="Kemitraan Berjalan" value={partnerships.isError ? '—' : String(summary?.active_count ?? 0)} hint="Kesepakatan aktif" />
        <Metric icon={CalendarDays} label="Perlu Tindakan" value={partnerships.isError || reservations.isError ? '—' : String(pendingRequests)} hint="Permintaan menunggu" accent={pendingRequests > 0} />
        <Metric icon={Scale} label="Pasokan Terikat" value={partnerships.isError ? '—' : `${formatVolume(summary?.agreed_volume_kg ?? 0)} kg`} hint="Sudah disepakati" />
        <Metric icon={WalletCards} label="Transaksi Selesai" value={transactions.isError ? '—' : String(transactions.data?.meta.total ?? 0)} hint={latestTransaction ? `Terakhir ${formatDate(latestTransaction.transaction_date)}` : 'Belum ada transaksi'} />
      </section>

      <section className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,.7fr)]">
        <article className="rounded-xl border border-line bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-tide">Prioritas Hari Ini</span>
              <h2 className="mt-1 text-lg font-bold">Tindakan yang perlu diperhatikan</h2>
            </div>
            {pendingRequests > 0 && <span className="rounded-full bg-[#fff1cc] px-3 py-1 text-xs font-semibold text-[#8a6100]">{pendingRequests} permintaan baru</span>}
          </div>
          <div className="mt-5 grid gap-3">
            {pendingRequests > 0 ? (
              <Priority
                icon={Handshake}
                title="Tinjau permintaan pembeli"
                description={`${pendingRequests} pengajuan menunggu keputusan Anda. Pasokan baru terikat setelah Anda menyetujuinya.`}
                label="Buka Kemitraan"
                path="/app/farmer/kemitraan"
              />
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-canvas p-5 text-sm text-ink-soft">
                Tidak ada permintaan pembeli yang menunggu konfirmasi.
              </div>
            )}
            {nextPlan ? (
              <Priority
                icon={CalendarDays}
                title={`Panen terdekat: ${nextPlan.pond_name}`}
                description={`${formatDate(nextPlan.harvest_date)} · ${formatVolume(nextPlan.estimated_volume_kg)} kg · Kecamatan ${nextPlan.location.name}`}
                label="Lihat Rencana"
                path="/app/farmer/rencana-panen"
              />
            ) : !plans.isError && (
              <Priority
                icon={Sprout}
                title="Belum ada rencana panen aktif"
                description="Tambahkan estimasi panen agar pasokan Anda dapat ditemukan dan dicocokkan dengan pembeli."
                label="Buat Rencana"
                path="/app/farmer/rencana-panen"
              />
            )}
          </div>
        </article>

        <article className="flex flex-col rounded-xl border border-line bg-white p-5 shadow-sm md:p-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-tide">Transaksi Terakhir</span>
          {latestTransaction ? (
            <>
              <h2 className="mt-2 text-lg font-bold">{latestTransaction.buyer_name ?? 'Pembeli SIGAP'}</h2>
              <dl className="mt-5 grid gap-3 text-sm">
                <Info label="Volume akhir" value={`${formatVolume(latestTransaction.volume_kg)} kg`} />
                <Info label="Nilai transaksi" value={`Rp${new Intl.NumberFormat('id-ID').format(Number(latestTransaction.total_value))}`} />
                <Info label="Tanggal" value={formatDate(latestTransaction.transaction_date)} />
              </dl>
              <Link className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold text-tide transition-colors hover:border-tide hover:bg-success-soft" to="/app/farmer/kemitraan?tab=history">
                Lihat Riwayat <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <div className="grid flex-1 place-items-center py-8 text-center">
              <div><WalletCards className="mx-auto text-tide" size={26} /><p className="mt-3 text-sm text-ink-soft">Belum ada transaksi yang selesai.</p></div>
            </div>
          )}
        </article>
      </section>

      <section>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-tide">Akses Cepat</span>
          <h2 className="mt-1 text-lg font-bold">Kelola aktivitas tambak</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map(({ title, description, path, icon: Icon }) => (
            <Link key={path} to={path} className="group flex min-w-0 flex-col rounded-xl border border-line bg-white p-5 text-ink no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-tide hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide">
              <span className="grid size-10 place-items-center rounded-lg bg-success-soft text-tide"><Icon size={19} /></span>
              <strong className="mt-4 text-sm">{title}</strong>
              <small className="mt-2 flex-1 text-xs leading-5 text-ink-soft">{description}</small>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-tide">Buka halaman <ArrowRight className="transition-transform group-hover:translate-x-1" size={14} /></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function Metric({ icon: Icon, label, value, hint, accent = false }: { icon: typeof Sprout; label: string; value: string; hint: string; accent?: boolean }) {
  return <article className={`rounded-xl border bg-white p-5 shadow-sm ${accent ? 'border-warning/30' : 'border-line'}`}><span className={`grid size-10 place-items-center rounded-lg ${accent ? 'bg-[#fff1cc] text-[#8a6100]' : 'bg-success-soft text-tide'}`}><Icon size={19} /></span><span className="mt-4 block text-xs text-ink-soft">{label}</span><strong className="mt-1 block text-xl">{value}</strong><small className="mt-1 block text-xs text-ink-soft">{hint}</small></article>
}

function Priority({ icon: Icon, title, description, label, path }: { icon: typeof Sprout; title: string; description: string; label: string; path: string }) {
  return <div className="flex flex-col gap-4 rounded-lg border border-line bg-canvas p-4 sm:flex-row sm:items-center"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-tide"><Icon size={18} /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-5 text-ink-soft">{description}</p></div><Link className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-tide transition-colors hover:border-tide hover:bg-success-soft" to={path}>{label} <ArrowRight size={13} /></Link></div>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-0"><dt className="text-ink-soft">{label}</dt><dd className="m-0 text-right font-semibold">{value}</dd></div>
}
