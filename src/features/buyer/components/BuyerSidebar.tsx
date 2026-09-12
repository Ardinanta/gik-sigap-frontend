import { LoaderCircle, LogOut, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import sigapLogo from '../../../assets/images/Logo 1 NoBG.svg'
import type { AuthUser } from '../../auth/types/auth.types'
import { buyerNavigation } from '../navigation'

interface BuyerSidebarProps {
  user: AuthUser
  open: boolean
  isLoggingOut: boolean
  logoutError: boolean
  onClose: () => void
  onLogout: () => void
}

export function BuyerSidebar({ user, open, isLoggingOut, logoutError, onClose, onLogout }: BuyerSidebarProps) {
  return (
    <aside className={`buyer-sidebar${open ? ' is-open' : ''}`} aria-label="Navigasi Pembeli">
      <div className="buyer-sidebar-header">
        <NavLink className="buyer-brand" to="/app/buyer/dashboard" onClick={onClose}>
          <img src={sigapLogo} alt="" />
          <span>
            <strong>SIGAP</strong>
            <small>KAB. GRESIK</small>
          </span>
        </NavLink>
        <button className="buyer-sidebar-close" type="button" onClick={onClose} aria-label="Tutup menu navigasi">
          <X size={20} />
        </button>
      </div>

      <nav className="buyer-navigation" aria-label="Menu utama Pembeli">
        {buyerNavigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            className={({ isActive }) => `buyer-nav-link${isActive ? ' active' : ''}`}
            to={path}
            onClick={onClose}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="buyer-account-area">
        {logoutError && <p className="buyer-logout-error" role="alert">Tidak dapat keluar. Coba lagi.</p>}
        <div className="buyer-account-card">
          <div className="buyer-account-copy">
            <strong title={user.name}>{user.name}</strong>
            <span>Pembeli Bandeng</span>
          </div>
          <button
            className="buyer-logout-button"
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            aria-label="Keluar dari akun"
            title="Keluar"
          >
            {isLoggingOut ? <LoaderCircle className="spinner" size={18} /> : <LogOut size={18} />}
          </button>
        </div>
      </div>
    </aside>
  )
}
