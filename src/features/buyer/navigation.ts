import {
  Handshake,
  LayoutDashboard,
  ListChecks,
  Search,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

export interface BuyerNavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

export const buyerNavigation: BuyerNavigationItem[] = [
  { label: 'Dashboard', path: '/app/buyer/dashboard', icon: LayoutDashboard },
  { label: 'Kebutuhan Saya', path: '/app/buyer/kebutuhan', icon: ListChecks },
  { label: 'Cari Pasokan', path: '/app/buyer/pasokan', icon: Search },
  { label: 'Rekomendasi', path: '/app/buyer/rekomendasi', icon: Sparkles },
  { label: 'Kemitraan', path: '/app/buyer/kemitraan', icon: Handshake },
  { label: 'Profil', path: '/app/buyer/profil', icon: UserRound },
]

export function getBuyerPageTitle(pathname: string) {
  return buyerNavigation.find((item) => pathname.startsWith(item.path))?.label ?? 'Dashboard'
}
