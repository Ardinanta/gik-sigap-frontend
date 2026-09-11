import { LoaderCircle, LogOut, MapPin, ShieldCheck } from 'lucide-react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from '../features/auth'
import { AuthLayout } from '../features/auth/components/AuthLayout'
import { useCurrentUser, useLogout } from '../features/auth/hooks/useAuth'

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

function HomeRedirect() {
  const user = useCurrentUser()
  if (user.isLoading) return <LoadingScreen />
  return <Navigate to={user.data ? '/app' : '/login'} replace />
}

function AppHome() {
  const user = useCurrentUser()
  const logout = useLogout()
  const accountRole = user.data?.roles.includes('farmer') ? 'Petambak' : user.data?.roles.includes('buyer') ? 'Pembeli' : 'Pengguna'

  const handleLogout = async () => {
    await logout.mutateAsync()
  }

  return (
    <AuthLayout icon={ShieldCheck} title={`Halo, ${user.data?.name ?? ''}`} description="Akun Anda berhasil terhubung dengan SIGAP">
      <div className="welcome-panel">
        <div className="account-summary">
          <span className="role-badge">{accountRole}</span>
          <strong>{user.data?.email}</strong>
          {user.data?.location && <span><MapPin size={15} /> Kecamatan {user.data.location.name}</span>}
        </div>
        <p>Dashboard khusus peran sedang disiapkan. Sesi autentikasi Anda sudah aktif dan aman.</p>
        {logout.isError && <p className="field-error">Tidak dapat keluar. Silakan coba lagi.</p>}
        <button className="button-secondary" type="button" onClick={handleLogout} disabled={logout.isPending}>
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
        <Route path="/app" element={<AppHome />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
