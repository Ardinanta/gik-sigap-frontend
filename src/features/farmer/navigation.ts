import { Handshake, LayoutDashboard, Sprout, TriangleAlert, UserRound, WandSparkles, type LucideIcon } from 'lucide-react'

export interface FarmerNavigationItem { label: string; path: string; icon: LucideIcon; available: boolean }

export const farmerNavigation: FarmerNavigationItem[] = [
  { label: 'Dashboard', path: '/app/farmer/dashboard', icon: LayoutDashboard, available: true },
  { label: 'Rencana Panen', path: '/app/farmer/rencana-panen', icon: Sprout, available: true },
  { label: 'Rekomendasi Pembeli', path: '/app/farmer/rekomendasi', icon: WandSparkles, available: true },
  { label: 'Kemitraan', path: '/app/farmer/kemitraan', icon: Handshake, available: true },
  { label: 'Risiko Panen', path: '/app/farmer/risiko', icon: TriangleAlert, available: true },
  { label: 'Profil', path: '/app/farmer/profil', icon: UserRound, available: true },
]

export function getFarmerPageTitle(pathname: string) {
  return farmerNavigation.find((item) => pathname.startsWith(item.path))?.label ?? 'Rencana Panen'
}
