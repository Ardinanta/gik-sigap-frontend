import { Bell, Menu } from 'lucide-react'

interface BuyerAppBarProps {
  pageTitle: string
  onOpenMenu: () => void
}

export function BuyerAppBar({ pageTitle, onOpenMenu }: BuyerAppBarProps) {
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
        <button className="buyer-notification-button" type="button" aria-label="Notifikasi belum tersedia" title="Notifikasi belum tersedia" disabled>
          <Bell size={18} />
        </button>
        <span className="buyer-active-status"><i aria-hidden="true" />Aktif</span>
      </div>
    </header>
  )
}
