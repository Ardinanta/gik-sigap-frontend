import { LoaderCircle, LogOut, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import sigapLogo from '../../../assets/images/Logo 1 NoBG.svg'
import type { AuthUser } from '../../auth/types/auth.types'
import { farmerNavigation } from '../navigation'

interface FarmerSidebarProps {
  user: AuthUser
  open: boolean
  isLoggingOut: boolean
  logoutError: boolean
  onClose: () => void
  onLogout: () => void
}

export function FarmerSidebar({ user, open, isLoggingOut, logoutError, onClose, onLogout }: FarmerSidebarProps) {
  return (
    <aside className={`buyer-sidebar${open ? ' is-open' : ''}`} aria-label="Navigasi Petambak">
      <div className="buyer-sidebar-header">
        <NavLink className="buyer-brand" to="/app/farmer/dashboard" onClick={onClose}>
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

      <nav className="buyer-navigation" aria-label="Menu utama Petambak">
        {farmerNavigation.map(({ label, path, icon: Icon, available }) => available ? (
          <NavLink
            key={path}
            className={({ isActive }) => `buyer-nav-link${isActive ? ' active' : ''}`}
            to={path}
            onClick={onClose}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ) : (
          <span
            key={path}
            className="buyer-nav-link cursor-not-allowed opacity-45"
            aria-disabled="true"
            title="Fitur segera tersedia"
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
            <small className="ml-auto text-[8px] font-semibold uppercase tracking-wide">Segera</small>
          </span>
        ))}
      </nav>

      <div className="buyer-account-area">
        {logoutError && <p className="buyer-logout-error" role="alert">Tidak dapat keluar. Coba lagi.</p>}
        <div className="buyer-account-card">
          <div className="buyer-account-copy">
            <strong title={user.name}>{user.name}</strong>
            <span>Petambak Bandeng</span>
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
