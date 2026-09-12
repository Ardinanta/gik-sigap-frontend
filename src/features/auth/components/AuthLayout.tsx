import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import sigapLogo from '../../../assets/images/Logo 1 NoBG.svg'

interface AuthLayoutProps {
  children: ReactNode
  icon: LucideIcon
  title: string
  description: string
  wide?: boolean
}

export function AuthLayout({ children, icon: Icon, title, description, wide = false }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="SIGAP Gresik - Beranda">
          <span className="brand-logo-frame">
            <img src={sigapLogo} alt="" className="brand-logo" />
          </span>
          <span className="brand-copy">
            <strong>SIGAP</strong>
            <span>Gresik</span>
          </span>
        </a>
      </header>

      <main className="auth-main">
        <section className={`auth-card${wide ? ' auth-card-wide' : ''}`}>
          <div className="auth-heading">
            <div className="auth-icon" aria-hidden="true"><Icon size={24} strokeWidth={1.8} /></div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
        </section>
      </main>

      <footer className="site-footer">
        <span>© 2026 SIGAP Kabupaten Gresik</span>
        <span>Butuh bantuan? <a href="mailto:bantuan@sigap.gresikkab.go.id">Hubungi admin</a></span>
      </footer>
    </div>
  )
}
