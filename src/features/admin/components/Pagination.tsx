import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buttonSecondary } from '../adminUi'
import type { AdminMeta } from '../types/admin.types'

export function Pagination({ meta, onPageChange }: { meta: AdminMeta; onPageChange: (page: number) => void }) {
  if (meta.last_page <= 1) return null

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3" aria-label="Paginasi data">
      <p className="text-xs text-ink-soft">Halaman {meta.current_page} dari {meta.last_page} · {meta.total} data</p>
      <div className="flex gap-2">
        <button type="button" className={buttonSecondary} disabled={meta.current_page <= 1} onClick={() => onPageChange(meta.current_page - 1)}><ChevronLeft size={16} /> Sebelumnya</button>
        <button type="button" className={buttonSecondary} disabled={meta.current_page >= meta.last_page} onClick={() => onPageChange(meta.current_page + 1)}>Berikutnya <ChevronRight size={16} /></button>
      </div>
    </nav>
  )
}
