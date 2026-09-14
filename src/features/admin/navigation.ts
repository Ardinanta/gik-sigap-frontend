import { Banknote, Database, LayoutDashboard, Sprout, TriangleAlert, type LucideIcon } from 'lucide-react'
export interface AdminNavigationItem { label: string; path: string; icon: LucideIcon }
export const adminNavigation: AdminNavigationItem[] = [
  { label: 'Dashboard', path: '/app/admin/dashboard', icon: LayoutDashboard },
  { label: 'Rencana Panen', path: '/app/admin/rencana-panen', icon: Sprout },
  { label: 'Risiko Panen Serentak', path: '/app/admin/risiko', icon: TriangleAlert },
  { label: 'Data Harga & Transaksi', path: '/app/admin/transaksi', icon: Banknote },
  { label: 'Kelola Master Data', path: '/app/admin/master-data', icon: Database },
]
export const getAdminPageTitle = (pathname: string) => adminNavigation.find((item) => pathname.startsWith(item.path))?.label ?? 'Admin Portal'
