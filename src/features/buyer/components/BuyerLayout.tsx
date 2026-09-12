import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useCurrentUser, useLogout } from '../../auth/hooks/useAuth'
import { getBuyerPageTitle } from '../navigation'
import '../buyer.css'
import { BuyerAppBar } from './BuyerAppBar'
import { BuyerSidebar } from './BuyerSidebar'

export function BuyerLayout() {
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sidebarOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }

    document.body.classList.add('buyer-drawer-open')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('buyer-drawer-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [sidebarOpen])

  if (!user) return null

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="buyer-shell">
      <BuyerSidebar
        user={user}
        open={sidebarOpen}
        isLoggingOut={logout.isPending}
        logoutError={logout.isError}
        onClose={closeSidebar}
        onLogout={() => logout.mutate()}
      />
      <button
        className={`buyer-sidebar-backdrop${sidebarOpen ? ' is-visible' : ''}`}
        type="button"
        onClick={closeSidebar}
        aria-label="Tutup menu navigasi"
        tabIndex={sidebarOpen ? 0 : -1}
      />
      <div className="buyer-workspace">
        <BuyerAppBar pageTitle={getBuyerPageTitle(location.pathname)} onOpenMenu={() => setSidebarOpen(true)} />
        <main className="buyer-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
