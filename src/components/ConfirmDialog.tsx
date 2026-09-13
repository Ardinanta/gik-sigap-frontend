import { AlertTriangle, LoaderCircle, X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  pending?: boolean
  error?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'default',
  pending = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      cancelRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-tide-dark/55"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault()
        if (!pending) onCancel()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) onCancel()
      }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className={`grid size-11 shrink-0 place-items-center rounded-full ${variant === 'danger' ? 'bg-danger-soft text-danger' : 'bg-success-soft text-tide'}`}>
            <AlertTriangle size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-bold">{title}</h2>
            <div id={descriptionId} className="mt-2 text-sm leading-6 text-ink-soft">{description}</div>
          </div>
          <button className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft transition-all hover:bg-panel-alt hover:text-ink active:scale-95 disabled:hover:bg-transparent disabled:hover:text-ink-soft" type="button" aria-label="Tutup dialog" disabled={pending} onClick={onCancel}><X size={18} /></button>
        </div>

        {error && <p className="mt-4 rounded-lg bg-danger-soft p-3 text-sm text-danger" role="alert">{error}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button ref={cancelRef} className="min-h-11 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink transition-all hover:border-tide hover:bg-panel-alt hover:text-tide hover:shadow-sm active:scale-[.98]" type="button" disabled={pending} onClick={onCancel}>{cancelLabel}</button>
          <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white ${variant === 'danger' ? 'bg-danger hover:bg-[#8e3928]' : 'bg-tide hover:bg-tide-dark'}`} type="button" disabled={pending} onClick={onConfirm}>{pending && <LoaderCircle className="animate-spin" size={17} />}{confirmLabel}</button>
        </div>
      </div>
    </dialog>
  )
}
