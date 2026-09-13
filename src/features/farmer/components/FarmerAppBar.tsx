import { Menu } from 'lucide-react'
import { NotificationPopover } from '../../notifications/components/NotificationPopover'

interface FarmerAppBarProps {
  pageTitle: string
  onOpenMenu: () => void
}

export function FarmerAppBar({ pageTitle, onOpenMenu }: FarmerAppBarProps) {
  return (
    <header className="buyer-app-bar">
      <div className="buyer-app-bar-heading">
        <button className="buyer-menu-button" type="button" onClick={onOpenMenu} aria-label="Buka menu navigasi">
          <Menu size={21} />
        </button>
        <nav className="buyer-breadcrumb" aria-label="Breadcrumb">
          <span>SIGAP Gresik</span>
          <span aria-hidden="true">/</span>
          <strong>{pageTitle}</strong>
        </nav>
      </div>

      <div className="buyer-app-actions">
        <NotificationPopover />
        <span className="buyer-active-status"><i aria-hidden="true" />Aktif</span>
      </div>
    </header>
  )
}
