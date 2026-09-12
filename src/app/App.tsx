import { LoaderCircle, LogOut, MapPin, ShieldCheck } from 'lucide-react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from '../features/auth'
import { AuthLayout } from '../features/auth/components/AuthLayout'
import { useCurrentUser, useLogout } from '../features/auth/hooks/useAuth'
import {
  BuyerDashboardPage,
  BuyerDemandsPage,
  BuyerLayout,
  BuyerPartnershipsPage,
  BuyerProfilePage,
  BuyerRecommendationsPage,
  BuyerSupplyPage,
} from '../features/buyer'

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

function HomeRedirect() {
  const user = useCurrentUser()
  if (user.isLoading) return <LoadingScreen />
  return <Navigate to={user.data ? '/app' : '/login'} replace />
}

function AppLanding() {
  const user = useCurrentUser()
  const logout = useLogout()

  if (user.data?.roles.includes('buyer')) {
    return <Navigate to="/app/buyer/dashboard" replace />
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
        <button className="button-secondary" type="button" onClick={() => logout.mutate()} disabled={logout.isPending}>
          {logout.isPending ? <LoaderCircle className="spinner" size={17} /> : <LogOut size={17} />}
          Keluar
        </button>
      </div>
    </AuthLayout>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedOnly />}>
        <Route path="/app" element={<AppLanding />} />
        <Route element={<BuyerOnly />}>
          <Route path="/app/buyer" element={<BuyerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<BuyerDashboardPage />} />
            <Route path="kebutuhan" element={<BuyerDemandsPage />} />
            <Route path="pasokan" element={<BuyerSupplyPage />} />
            <Route path="rekomendasi" element={<BuyerRecommendationsPage />} />
            <Route path="kemitraan" element={<BuyerPartnershipsPage />} />
            <Route path="profil" element={<BuyerProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
