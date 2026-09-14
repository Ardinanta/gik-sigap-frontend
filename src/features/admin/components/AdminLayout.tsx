import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { useCurrentUser, useLogout } from '../../auth/hooks/useAuth'
import '../../buyer/buyer.css'
import { getAdminPageTitle } from '../navigation'
import { AdminAppBar } from './AdminAppBar'
import { AdminSidebar } from './AdminSidebar'

export function AdminLayout() {
  const { data: user } = useCurrentUser(); const logout = useLogout(); const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false); const [logoutOpen, setLogoutOpen] = useState(false)
  useEffect(() => { if (!sidebarOpen) return; const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setSidebarOpen(false) }; document.body.classList.add('buyer-drawer-open'); window.addEventListener('keydown', key); return () => { document.body.classList.remove('buyer-drawer-open'); window.removeEventListener('keydown', key) } }, [sidebarOpen])
  if (!user) return null
  return <div className="buyer-shell"><AdminSidebar user={user} open={sidebarOpen} isLoggingOut={logout.isPending} logoutError={logout.isError} onClose={() => setSidebarOpen(false)} onLogout={() => { setSidebarOpen(false); setLogoutOpen(true) }} /><button className={`buyer-sidebar-backdrop${sidebarOpen ? ' is-visible' : ''}`} type="button" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu navigasi" tabIndex={sidebarOpen ? 0 : -1} /><div className="buyer-workspace"><AdminAppBar pageTitle={getAdminPageTitle(location.pathname)} onOpenMenu={() => setSidebarOpen(true)} /><main className="buyer-content"><Outlet /></main></div><ConfirmDialog open={logoutOpen} title="Keluar dari SIGAP?" description="Sesi Admin Portal pada perangkat ini akan diakhiri." confirmLabel="Ya, Keluar" variant="danger" pending={logout.isPending} error={logout.isError ? 'Tidak dapat keluar. Periksa koneksi lalu coba lagi.' : undefined} onCancel={() => setLogoutOpen(false)} onConfirm={() => logout.mutate(undefined, { onSuccess: () => setLogoutOpen(false) })} /></div>
}
