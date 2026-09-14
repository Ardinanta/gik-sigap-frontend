import { LoaderCircle, LogOut, MapPin, ShieldCheck } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from '../features/auth'
import { AuthLayout } from '../features/auth/components/AuthLayout'
import { useCurrentUser, useLogout } from '../features/auth/hooks/useAuth'
import { BuyerLayout } from '../features/buyer/components/BuyerLayout'
import { FarmerLayout } from '../features/farmer/components/FarmerLayout'
import { AdminLayout } from '../features/admin/components/AdminLayout'

const BuyerDashboardPage = lazy(() => import('../features/buyer/pages/BuyerDashboardPage').then((module) => ({ default: module.BuyerDashboardPage })))
const PartnershipHandoverPage = lazy(() => import('../features/buyer/pages/PartnershipHandoverPage').then((module) => ({ default: module.PartnershipHandoverPage })))
const BuyerDemandsPage = lazy(() => import('../features/buyer/pages/BuyerDemandsPage').then((module) => ({ default: module.BuyerDemandsPage })))
const BuyerPartnershipDetailPage = lazy(() => import('../features/buyer/pages/BuyerPartnershipDetailPage').then((module) => ({ default: module.BuyerPartnershipDetailPage })))
const BuyerPartnershipsPage = lazy(() => import('../features/buyer/pages/BuyerPartnershipsPage').then((module) => ({ default: module.BuyerPartnershipsPage })))
const BuyerProfilePage = lazy(() => import('../features/buyer/pages/BuyerProfilePage').then((module) => ({ default: module.BuyerProfilePage })))
const BuyerRecommendationsPage = lazy(() => import('../features/buyer/pages/BuyerRecommendationsPage').then((module) => ({ default: module.BuyerRecommendationsPage })))
const BuyerSupplyDetailPage = lazy(() => import('../features/buyer/pages/BuyerSupplyDetailPage').then((module) => ({ default: module.BuyerSupplyDetailPage })))
const BuyerSupplyPage = lazy(() => import('../features/buyer/pages/BuyerSupplyPage').then((module) => ({ default: module.BuyerSupplyPage })))
const FarmerDashboardPage = lazy(() => import('../features/farmer/pages/FarmerDashboardPage').then((module) => ({ default: module.FarmerDashboardPage })))
const FarmerProfilePage = lazy(() => import('../features/farmer/pages/FarmerProfilePage').then((module) => ({ default: module.FarmerProfilePage })))
const FarmerHarvestPlansPage = lazy(() => import('../features/farmer/pages/FarmerHarvestPlansPage').then((module) => ({ default: module.FarmerHarvestPlansPage })))
const FarmerEditHarvestPlanPage = lazy(() => import('../features/farmer/pages/FarmerEditHarvestPlanPage').then((module) => ({ default: module.FarmerEditHarvestPlanPage })))
const FarmerRecommendationsPage = lazy(() => import('../features/farmer/pages/FarmerRecommendationsPage').then((module) => ({ default: module.FarmerRecommendationsPage })))
const FarmerRiskPage = lazy(() => import('../features/farmer/pages/FarmerRiskPage').then((module) => ({ default: module.FarmerRiskPage })))
const FarmerPartnershipsPage = lazy(() => import('../features/farmer/pages/FarmerPartnershipsPage').then((module) => ({ default: module.FarmerPartnershipsPage })))
const FarmerPartnershipDetailPage = lazy(() => import('../features/farmer/pages/FarmerPartnershipDetailPage').then((module) => ({ default: module.FarmerPartnershipDetailPage })))
const AdminDashboardPage = lazy(() => import('../features/admin/pages/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })))
const AdminHarvestPlansPage = lazy(() => import('../features/admin/pages/AdminHarvestPlansPage').then((module) => ({ default: module.AdminHarvestPlansPage })))
const AdminRisksPage = lazy(() => import('../features/admin/pages/AdminRisksPage').then((module) => ({ default: module.AdminRisksPage })))
const AdminTransactionsPage = lazy(() => import('../features/admin/pages/AdminTransactionsPage').then((module) => ({ default: module.AdminTransactionsPage })))
const AdminMasterDataPage = lazy(() => import('../features/admin/pages/AdminMasterDataPage').then((module) => ({ default: module.AdminMasterDataPage })))

function LoadingScreen() {
  return <div className="route-loading"><LoaderCircle className="spinner" size={28} /><span>Menyiapkan SIGAP...</span></div>
}

function PublicOnly() {
  const user = useCurrentUser()
  if (user.isLoading) return <LoadingScreen />
  if (user.data) return <Navigate to="/app" replace />
  return <Outlet />
}

function ProtectedOnly() {
  const user = useCurrentUser()
  if (user.isLoading) return <LoadingScreen />
  if (!user.data) return <Navigate to="/login" replace />
  return <Outlet />
}

function BuyerOnly() {
  const user = useCurrentUser()
  if (!user.data?.roles.includes('buyer')) return <Navigate to="/app" replace />
  return <Outlet />
}

function FarmerOnly() {
  const user = useCurrentUser()
  if (!user.data?.roles.includes('farmer')) return <Navigate to="/app" replace />
  return <Outlet />
}

function AdminOnly() {
  const user = useCurrentUser()
  if (!user.data?.roles.includes('admin')) return <Navigate to="/app" replace />
  return <Outlet />
}

const LandingPage = lazy(() => import('../features/landing/LandingPage').then(module => ({ default: module.LandingPage })))

function AppLanding() {
  const user = useCurrentUser()
  const logout = useLogout()
  const [logoutOpen, setLogoutOpen] = useState(false)

  if (user.data?.roles.includes('buyer')) {
    return <Navigate to="/app/buyer/dashboard" replace />
  }
  if (user.data?.roles.includes('farmer')) {
    return <Navigate to="/app/farmer/dashboard" replace />
  }
  if (user.data?.roles.includes('admin')) {
    return <Navigate to="/app/admin/dashboard" replace />
  }

  const accountRole = user.data?.roles.includes('farmer') ? 'Petambak' : user.data?.roles.includes('admin') ? 'Admin' : 'Pengguna'

  return (
    <AuthLayout icon={ShieldCheck} title={`Halo, ${user.data?.name ?? ''}`} description={`Area ${accountRole} sedang disiapkan`}>
      <div className="welcome-panel">
        <div className="account-summary">
          <span className="role-badge">{accountRole}</span>
          <strong>{user.data?.email}</strong>
          {user.data?.location && <span><MapPin size={15} /> Kecamatan {user.data.location.name}</span>}
        </div>
        <p>Dashboard khusus peran ini belum tersedia. Sesi autentikasi Anda tetap aktif dan aman.</p>
        {logout.isError && <p className="field-error">Tidak dapat keluar. Silakan coba lagi.</p>}
        <button className="button-secondary" type="button" onClick={() => setLogoutOpen(true)} disabled={logout.isPending}>
          {logout.isPending ? <LoaderCircle className="spinner" size={17} /> : <LogOut size={17} />}
          Keluar
        </button>
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
    </AuthLayout>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedOnly />}>
        <Route path="/app" element={<AppLanding />} />
        <Route path="/app/kemitraan/:partnershipId/serah-terima" element={<div className="min-h-screen bg-canvas p-4 md:p-8"><PartnershipHandoverPage /></div>} />
        <Route element={<AdminOnly />}>
          <Route path="/app/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="rencana-panen" element={<AdminHarvestPlansPage />} />
            <Route path="risiko" element={<AdminRisksPage />} />
            <Route path="transaksi" element={<AdminTransactionsPage />} />
            <Route path="master-data" element={<AdminMasterDataPage />} />
          </Route>
        </Route>
        <Route element={<BuyerOnly />}>
          <Route path="/app/buyer" element={<BuyerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<BuyerDashboardPage />} />
            <Route path="kebutuhan" element={<BuyerDemandsPage />} />
            <Route path="pasokan" element={<BuyerSupplyPage />} />
            <Route path="pasokan/:harvestPlanId" element={<BuyerSupplyDetailPage key="supply-detail" />} />
            <Route path="rekomendasi" element={<BuyerRecommendationsPage />} />
            <Route path="kemitraan" element={<BuyerPartnershipsPage />} />
            <Route path="kemitraan/:partnershipId" element={<BuyerPartnershipDetailPage />} />
            <Route path="kemitraan/:partnershipId/serah-terima" element={<PartnershipHandoverPage />} />
            <Route path="profil" element={<BuyerProfilePage />} />
          </Route>
        </Route>
        <Route element={<FarmerOnly />}>
          <Route path="/app/farmer" element={<FarmerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<FarmerDashboardPage />} />
            <Route path="rencana-panen" element={<FarmerHarvestPlansPage />} />
            <Route path="rencana-panen/:harvestPlanId/ubah" element={<FarmerEditHarvestPlanPage />} />
            <Route path="rekomendasi" element={<FarmerRecommendationsPage />} />
            <Route path="risiko" element={<FarmerRiskPage />} />
            <Route path="kemitraan" element={<FarmerPartnershipsPage />} />
            <Route path="kemitraan/:partnershipId" element={<FarmerPartnershipDetailPage />} />
            <Route path="kemitraan/:partnershipId/serah-terima" element={<PartnershipHandoverPage />} />
            <Route path="profil" element={<FarmerProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  )
}
