import { ArrowRight, ListChecks, Search, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../auth/hooks/useAuth'

const shortcuts = [
  {
    title: 'Catat kebutuhan',
    description: 'Siapkan kebutuhan bandeng agar dapat dicocokkan dengan rencana panen.',
    path: '/app/buyer/kebutuhan',
    icon: ListChecks,
  },
  {
    title: 'Cari pasokan',
    description: 'Telusuri rencana panen berdasarkan lokasi, ukuran, dan periode.',
    path: '/app/buyer/pasokan',
    icon: Search,
  },
  {
    title: 'Lihat rekomendasi',
    description: 'Temukan pasokan yang paling sesuai dengan kebutuhan Anda.',
    path: '/app/buyer/rekomendasi',
    icon: Sparkles,
  },
]

export function BuyerDashboardPage() {
  const { data: user } = useCurrentUser()

  return (
    <div className="buyer-page">
      <section className="buyer-page-heading">
        <span className="buyer-page-eyebrow">Dashboard Pembeli</span>
        <h1>Selamat datang, {user?.name ?? 'Pembeli'}</h1>
        <p>Kelola kebutuhan bandeng dan temukan rencana panen yang sesuai dari satu tempat.</p>
      </section>

      <section className="buyer-start-panel" aria-labelledby="buyer-start-title">
        <div>
          <h2 id="buyer-start-title">Mulai dari kebutuhan Anda</h2>
          <p>Fitur data Pembeli akan tersedia setelah API kebutuhan dan pasokan diaktifkan. Anda tetap dapat menjelajahi susunan halaman melalui menu.</p>
        </div>
      </section>

      <section className="buyer-shortcut-grid" aria-label="Akses cepat">
        {shortcuts.map(({ title, description, path, icon: Icon }) => (
          <Link className="buyer-shortcut-card" to={path} key={path}>
            <span className="buyer-shortcut-icon" aria-hidden="true"><Icon size={20} /></span>
            <span className="buyer-shortcut-copy">
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </section>
    </div>
  )
}
