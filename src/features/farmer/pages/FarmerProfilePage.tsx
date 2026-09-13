import { CalendarDays, CheckCircle2, LoaderCircle, Mail, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { useCurrentUser } from '../../auth/hooks/useAuth'
import { formatIndonesianPhoneNumber } from '../../auth/utils/phoneFormat'

const joinedAt = (value?: string) => value
  ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
  : 'Tidak tersedia'

const initials = (name?: string) => name
  ?.split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'PT'

export function FarmerProfilePage() {
  const user = useCurrentUser()

  if (user.isLoading) {
    return <div className="flex min-h-48 items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm text-ink-soft"><LoaderCircle className="animate-spin" size={19} /> Memuat profil...</div>
  }

  if (user.isError || !user.data) {
    return <div role="alert" className="rounded-xl border border-danger/20 bg-danger-soft p-6 text-center text-sm text-danger"><p>Profil tidak dapat dimuat.</p><button type="button" className="mt-3 rounded-lg border border-danger/20 bg-white px-4 py-2 font-semibold hover:bg-danger-soft" onClick={() => user.refetch()}>Coba Lagi</button></div>
  }

  const account = user.data
  const active = account.status === 'active'

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-10 text-ink">
      <header>
        <span className="text-xs font-semibold uppercase tracking-wider text-tide">Akun Petambak</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">Profil Saya</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">Informasi akun yang digunakan untuk mengelola pasokan dan kemitraan di SIGAP.</p>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="bg-[linear-gradient(120deg,var(--tide),#138078)] px-5 py-7 md:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl border border-white/30 bg-white/15 text-xl font-bold text-white shadow-sm" aria-hidden="true">{initials(account.name)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-bold text-white md:text-2xl">{account.name}</h2>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-white text-success' : 'bg-danger-soft text-danger'}`}>{active ? <CheckCircle2 size={13} /> : <ShieldCheck size={13} />}{active ? 'Akun Aktif' : account.status}</span>
              </div>
              <p className="mt-1 text-sm text-white/80">Petambak Bandeng · Kabupaten Gresik</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_280px] md:p-7">
          <div>
            <div className="flex items-center gap-2"><UserRound className="text-tide" size={19} /><h3 className="font-bold">Informasi Akun</h3></div>
            <dl className="mt-4 divide-y divide-line rounded-xl border border-line">
              <ProfileRow icon={Mail} label="Email" value={account.email} />
              <ProfileRow icon={Phone} label="Nomor WhatsApp" value={formatIndonesianPhoneNumber(account.phone) ?? 'Belum diisi'} />
              <ProfileRow icon={MapPin} label="Kecamatan" value={account.location?.name ? `Kecamatan ${account.location.name}` : 'Belum dipilih'} />
              <ProfileRow icon={CalendarDays} label="Bergabung sejak" value={joinedAt(account.created_at)} />
            </dl>
          </div>

          <aside className="rounded-xl border border-line bg-canvas p-5">
            <span className="grid size-10 place-items-center rounded-lg bg-success-soft text-tide"><Phone size={18} /></span>
            <h3 className="mt-4 text-sm font-bold">Kontak Kemitraan</h3>
            <p className="mt-2 text-xs leading-5 text-ink-soft">Nomor WhatsApp akun digunakan agar pembeli yang memiliki akses ke kemitraan dapat menghubungi Anda melalui tautan aman.</p>
            <div className="mt-4 rounded-lg bg-white p-3 text-xs text-ink-soft"><strong className="block text-ink">Privasi tetap terlindungi</strong><span className="mt-1 block leading-5">SIGAP tidak menampilkan nomor mentah pada katalog dan response kemitraan publik.</span></div>
          </aside>
        </div>
      </section>
    </div>
  )
}

function ProfileRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return <div className="grid gap-2 px-4 py-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center"><dt className="flex items-center gap-2 text-xs font-medium text-ink-soft"><Icon size={16} /> {label}</dt><dd className="m-0 break-words text-sm font-semibold">{value}</dd></div>
}
