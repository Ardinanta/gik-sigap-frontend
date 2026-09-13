import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { useCurrentUser, useLogout } from '../../auth/hooks/useAuth'
import '../../buyer/buyer.css'
import { getFarmerPageTitle } from '../navigation'
import { FarmerAppBar } from './FarmerAppBar'
import { FarmerSidebar } from './FarmerSidebar'

export function FarmerLayout() {
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

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
      <FarmerSidebar
        user={user}
        open={sidebarOpen}
        isLoggingOut={logout.isPending}
        logoutError={logout.isError}
        onClose={closeSidebar}
        onLogout={() => {
          setSidebarOpen(false)
          setLogoutOpen(true)
        }}
      />
      <button
        className={`buyer-sidebar-backdrop${sidebarOpen ? ' is-visible' : ''}`}
        type="button"
        onClick={closeSidebar}
        aria-label="Tutup menu navigasi"
        tabIndex={sidebarOpen ? 0 : -1}
      />
      <div className="buyer-workspace">
        <FarmerAppBar pageTitle={getFarmerPageTitle(location.pathname)} onOpenMenu={() => setSidebarOpen(true)} />
        <main className="buyer-content">
          <Outlet />
        </main>
      </div>
      <ConfirmDialog
        open={logoutOpen}
        title="Keluar dari SIGAP?"
        description="Sesi akun Anda pada perangkat ini akan diakhiri. Anda perlu masuk kembali untuk mengakses layanan SIGAP."
        confirmLabel="Ya, Keluar"
        variant="danger"
        pending={logout.isPending}
        error={logout.isError ? 'Tidak dapat keluar. Periksa koneksi lalu coba lagi.' : undefined}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => logout.mutate(undefined, { onSuccess: () => setLogoutOpen(false) })}
      />
    </div>
  )
}
