import { MapPin, Mail, Phone, UserRound } from 'lucide-react'
import { useCurrentUser } from '../../auth/hooks/useAuth'

export function BuyerProfilePage() {
  const { data: user } = useCurrentUser()

  return (
    <div className="buyer-page">
      <section className="buyer-page-heading">
        <span className="buyer-page-eyebrow">Akun</span>
        <h1>Profil</h1>
        <p>Informasi akun yang terhubung dengan SIGAP.</p>
      </section>
      <section className="buyer-profile-card">
        <div className="buyer-profile-avatar" aria-hidden="true"><UserRound size={26} /></div>
        <div className="buyer-profile-name">
          <strong>{user?.name}</strong>
          <span>Pembeli Bandeng</span>
        </div>
        <dl>
          <div><dt><Mail size={16} /> Email</dt><dd>{user?.email}</dd></div>
          <div><dt><Phone size={16} /> Nomor WhatsApp</dt><dd>{user?.phone ?? 'Belum diisi'}</dd></div>
          <div><dt><MapPin size={16} /> Kecamatan</dt><dd>{user?.location?.name ?? 'Belum dipilih'}</dd></div>
        </dl>
      </section>
    </div>
  )
}
