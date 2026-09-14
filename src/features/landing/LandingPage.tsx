import { ArrowDown, ArrowRight, Check, Fish, Handshake, MapPin, Menu, Pause, Play, Sprout, Waves, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './landing.css'

const features = [
  { icon: Sprout, number: '01', title: 'Rencanakan lebih awal.', text: 'Catat estimasi panen, ukuran bandeng, dan volume tambak. Bantu pembeli menemukan pasokan sebelum hari panen.' },
  { icon: Handshake, number: '02', title: 'Temukan mitra yang tepat.', text: 'Hubungkan rencana panen dengan kebutuhan pembeli. Diskusikan dan bangun kesepakatan dalam satu alur.' },
  { icon: Waves, number: '03', title: 'Antisipasi panen serentak.', text: 'Pantau konsentrasi panen di wilayah Anda sebagai pertimbangan untuk mengambil keputusan yang lebih terarah.' },
]

export function LandingPage() {
  const root = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [motionPaused, setMotionPaused] = useState(false)
  const scene = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const page = root.current
    const visual = scene.current
    if (!page || !visual) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    let frame = 0
    const updateProgress = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        const distance = document.documentElement.scrollHeight - window.innerHeight
        page.style.setProperty('--lp-progress', String(distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0))
        frame = 0
      })
    }
    const resetTilt = () => { visual.style.setProperty('--tilt-x', '0deg'); visual.style.setProperty('--tilt-y', '0deg') }
    const move = (event: PointerEvent) => {
      if (media.matches || !pointer.matches || motionPaused) return
      const box = visual.getBoundingClientRect()
      visual.style.setProperty('--tilt-x', `${(0.5 - (event.clientY - box.top) / box.height) * 7}deg`)
      visual.style.setProperty('--tilt-y', `${((event.clientX - box.left) / box.width - 0.5) * 7}deg`)
    }
    let observer: IntersectionObserver | undefined
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => entries.forEach(entry => visual.classList.toggle('lp-offscreen', !entry.isIntersecting)))
      observer.observe(visual)
    }
    visual.addEventListener('pointermove', move)
    visual.addEventListener('pointerleave', resetTilt)
    media.addEventListener('change', resetTilt)
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    updateProgress()
    return () => {
      cancelAnimationFrame(frame); observer?.disconnect(); resetTilt()
      visual.removeEventListener('pointermove', move); visual.removeEventListener('pointerleave', resetTilt)
      media.removeEventListener('change', resetTilt)
      window.removeEventListener('scroll', updateProgress); window.removeEventListener('resize', updateProgress)
    }
  }, [motionPaused])
  useEffect(() => {
    const elements = root.current?.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!elements || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) }
      })
    }, { threshold: 0.12 })
    elements.forEach(element => { element.classList.add('will-reveal'); observer.observe(element) })
    return () => { observer.disconnect(); elements.forEach(element => element.classList.remove('will-reveal')) }
  }, [])

  return <div className={`sigap-landing${motionPaused ? ' lp-motion-paused' : ''}`} ref={root}>
    <div className="lp-scroll-progress" aria-hidden="true" />
    <a className="lp-skip" href="#konten">Langsung ke konten</a>
    <header className="lp-header"><div className="lp-container lp-nav">
      <Link to="/" className="lp-brand" aria-label="SIGAP beranda"><img src="/sigap-logo.svg" alt="" width="38" height="38" /><span>SIGAP<small>TERHUBUNG SEBELUM PANEN</small></span></Link>
      <nav className="lp-desktop-links" aria-label="Navigasi utama"><a href="#manfaat">Tentang SIGAP</a><a href="#cara-kerja">Cara kerja</a><a href="#bergabung">Untuk siapa?</a></nav>
      <div className="lp-nav-actions"><Link to="/login" className="lp-login">Masuk</Link><Link to="/register" className="lp-button lp-small">Mulai sekarang <ArrowRight size={16} /></Link><button className="lp-menu" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={menuOpen} aria-controls="lp-mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
    </div>{menuOpen && <nav id="lp-mobile-nav" className="lp-mobile-links" aria-label="Navigasi seluler" onKeyDown={event => { if (event.key === 'Escape') setMenuOpen(false) }}><a href="#manfaat" onClick={() => setMenuOpen(false)}>Tentang SIGAP</a><a href="#cara-kerja" onClick={() => setMenuOpen(false)}>Cara kerja</a><a href="#bergabung" onClick={() => setMenuOpen(false)}>Untuk siapa?</a><Link to="/register">Buat akun <ArrowRight size={16} /></Link></nav>}</header>
    <main id="konten">
      <section className="lp-container lp-hero">
        <div className="lp-hero-copy"><span className="lp-eyebrow"><span className="lp-dot" /> DARI TAMBAK GRESIK, UNTUK MASA DEPAN</span><h1>Panen terencana.<br />Pasar <em>terhubung.</em></h1><p>Langkah kecil hari ini, peluang lebih baik saat panen. SIGAP mempertemukan petambak bandeng dan pembeli sejak sebelum panen dimulai.</p><div className="lp-hero-actions"><Link className="lp-button" to="/register">Mulai bersama SIGAP <ArrowRight size={18} /></Link><a className="lp-text-link" href="#cara-kerja">Kenali cara kerjanya <ArrowDown size={16} /></a></div><div className="lp-hero-note"><MapPin size={15} /><span>Dibangun untuk ekosistem bandeng Gresik</span></div></div>
        <div className="lp-visual" ref={scene}>
          <div className="lp-orbit lp-orbit-one" aria-hidden="true" /><div className="lp-orbit lp-orbit-two" aria-hidden="true" />
          <div className="lp-visual-top"><span><span className="lp-dot" /> EKOSISTEM YANG TERHUBUNG</span><span>GRESIK, JAWA TIMUR ↗</span></div>
          <svg className="lp-pond" viewBox="0 0 560 450" fill="none" role="img" aria-label="Ilustrasi tambak bandeng yang terhubung dengan perencanaan dan pembeli">
            <ellipse cx="285" cy="368" rx="204" ry="34" fill="#082e2b" opacity=".08" />
            <path d="M50 239 285 102 515 235 280 376Z" fill="#a8bdae" /><path d="m50 239 230 137v20L50 259Z" fill="#779589" /><path d="m280 376 235-141v20L280 396Z" fill="#54776b" />
            <path d="m70 239 99-59 100 59-99 59Z" fill="#518f87" /><path d="m186 172 99-58 99 58-99 59Z" fill="#73a69c" /><path d="m185 305 99-58 101 58-105 60Z" fill="#246c64" /><path d="m300 239 99-59 96 55-97 62Z" fill="#40857d" />
            <g className="lp-water" stroke="#d6e9df" strokeWidth="2" strokeLinecap="round" opacity=".65"><path d="m112 237 36 21m-6-37 49 28m42-77 35 20m0-31 44 25m20 55 45 25m-15-44 38 22m-176 62 47 27m-15-45 39 22" /></g>
            <g stroke="#d9e4d4" strokeWidth="5"><path d="m170 180 230 132M71 246l215-128" opacity=".5" /></g>
            <path d="m366 121 38-23 42 25-39 23Z" fill="#c49755" /><path d="m366 121 41 25v39l-41-24Z" fill="#eff0de" /><path d="m407 146 39-23v39l-39 23Z" fill="#cad8c6" /><path d="m356 122 47-54 52 57-48 27Z" fill="#174e46" /><path d="m403 68 52 57-48 27Z" fill="#28695d" /><path d="m380 139 13 7v25l-13-7Z" fill="#779588" />
            <g fill="#3d735b"><ellipse cx="107" cy="172" rx="16" ry="24" /><ellipse cx="470" cy="278" rx="19" ry="28" /><ellipse cx="451" cy="301" rx="12" ry="20" /></g><g stroke="#688669" strokeWidth="4"><path d="M107 166v44m363 61v52m-19-25v32" /></g>
            <path className="lp-connection" d="M142 160q120-128 264 22" stroke="#b9832a" strokeWidth="2" strokeDasharray="6 7" />
            <circle cx="142" cy="160" r="7" fill="#b9832a" /><circle cx="406" cy="182" r="7" fill="#b9832a" />
            <g className="lp-ripple lp-ripple-one" stroke="#dceee4" strokeWidth="1.5"><ellipse cx="170" cy="244" rx="24" ry="12" /><ellipse cx="170" cy="244" rx="36" ry="18" opacity=".45" /></g>
            <g className="lp-ripple lp-ripple-two" stroke="#dceee4" strokeWidth="1.5"><ellipse cx="282" cy="308" rx="23" ry="11" /><ellipse cx="282" cy="308" rx="34" ry="17" opacity=".45" /></g>
            <circle className="lp-signal" cx="142" cy="160" r="15" stroke="#b9832a" strokeWidth="1.5" />
            <circle className="lp-signal lp-signal-end" cx="406" cy="182" r="15" stroke="#b9832a" strokeWidth="1.5" />
          </svg>
          <div className="lp-float lp-float-plan"><span className="lp-icon"><Sprout size={20} /></span><div><small>LANGKAH PERTAMA</small><strong>Rencana panen tercatat</strong></div><Check size={17} /></div>
          <div className="lp-float lp-float-match"><span className="lp-icon"><Handshake size={20} /></span><div><small>PELUANG BARU</small><strong>Terhubung dengan pembeli</strong></div></div>
          <div className="lp-visual-bottom"><Waves size={19} /><span>Panen terencana. Petambak sejahtera.</span><span>01 — 03</span></div>
          <button className="lp-motion-toggle" type="button" onClick={() => setMotionPaused(value => !value)} aria-label={motionPaused ? 'Putar animasi ilustrasi' : 'Jeda animasi ilustrasi'} aria-pressed={motionPaused}>{motionPaused ? <Play size={12} /> : <Pause size={12} />}<span>{motionPaused ? 'Putar' : 'Jeda'} animasi</span></button>
        </div>
      </section>
      <div className="lp-principles"><div className="lp-container"><span>Berawal dari rencana.<br /><strong>Bertumbuh bersama.</strong></span><p><Sprout /> Perencanaan panen</p><p><Handshake /> Koneksi pasar</p><p><Waves /> Antisipasi risiko</p></div></div>
      <section className="lp-container lp-section" id="manfaat"><div className="lp-section-heading" data-reveal><span className="lp-eyebrow">SATU EKOSISTEM, LEBIH BANYAK PELUANG</span><h2>Panen lebih siap.<br />Langkah lebih pasti.</h2><p>Informasi yang terhubung membantu petambak dan pembeli mempersiapkan hari panen bersama.</p></div><div className="lp-feature-grid">{features.map(({ icon: Icon, number, title, text }) => <article className="lp-feature" key={number} data-reveal><div className="lp-feature-top"><Icon size={25} strokeWidth={1.5} /><span>{number}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className="lp-process" id="cara-kerja"><div className="lp-container lp-process-inner"><div data-reveal><span className="lp-eyebrow">SEDERHANA DARI AWAL</span><h2>Dari rencana,<br />menjadi <em>kemitraan.</em></h2><p>Tiga langkah untuk mulai membangun hubungan yang lebih baik antara tambak dan pasar.</p><Link className="lp-text-link" to="/register">Ambil langkah pertama <ArrowRight size={18} /></Link></div><ol className="lp-steps">{[{ title: 'Ceritakan kebutuhan Anda', text: 'Daftar sebagai petambak atau pembeli, lalu catat rencana panen atau kebutuhan bandeng.' }, { title: 'Temukan kecocokan', text: 'Jelajahi rekomendasi berdasarkan ukuran ikan, lokasi, waktu, dan volume.' }, { title: 'Sepakati dan lanjutkan', text: 'Hubungi calon mitra, konfirmasi kesepakatan, lalu catat hasil serah terima.' }].map((step, index) => <li key={step.title} data-reveal><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></div></section>
      <section className="lp-container lp-section" id="bergabung"><div className="lp-section-heading" data-reveal><span className="lp-eyebrow">DUA PERAN, SATU TUJUAN</span><h2>Tumbuh bersama SIGAP.</h2></div><div className="lp-roles"><article data-reveal><Sprout size={30} strokeWidth={1.5} /><h3>Saya petambak.</h3><p>Siapkan panen, temukan pembeli, dan pantau kondisi panen di wilayah Anda.</p><Link to="/register">Mulai rencanakan panen <ArrowRight size={18} /></Link></article><article data-reveal><Fish size={30} strokeWidth={1.5} /><h3>Saya pembeli.</h3><p>Temukan pasokan bandeng yang sesuai dan bangun kemitraan langsung dengan petambak.</p><Link to="/register">Temukan peluang pasokan <ArrowRight size={18} /></Link></article></div></section>
      <section className="lp-container lp-cta" data-reveal><span className="lp-eyebrow">MASA DEPAN PANEN DIMULAI HARI INI</span><h2>Panen yang baik,<br />dimulai dari koneksi yang baik.</h2><Link to="/register" className="lp-button">Mari mulai bersama <ArrowRight size={18} /></Link><p>Sudah bergabung? <Link to="/login">Masuk ke akun Anda</Link></p></section>
    </main>
    <footer className="lp-container lp-footer"><Link className="lp-brand" to="/"><img src="/sigap-logo.svg" alt="" width="32" height="32" /><span>SIGAP<small>GRESIK ANTISIPASI PANEN</small></span></Link><p>Panen Terencana, Pasar Terserap, Petambak Sejahtera.</p><a href="#konten">Kembali ke atas ↑</a></footer>
  </div>
}
