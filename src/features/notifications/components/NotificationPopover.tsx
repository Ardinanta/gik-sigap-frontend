import { Bell, CheckCheck, Handshake, LoaderCircle, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from '../hooks/useNotifications'
import type { AppNotification } from '../types/notification.types'

export function NotificationPopover() {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const container = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const notifications = useNotifications()
  const markRead = useMarkNotificationAsRead()
  const markAll = useMarkAllNotificationsAsRead()
  const unreadCount = notifications.data?.unread_count ?? 0

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const openNotification = (item: AppNotification) => {
    const go = () => {
      setOpen(false)
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['partnerships'] }),
        queryClient.invalidateQueries({ queryKey: ['farmer-partnerships'] }),
      ])
      if (item.route?.startsWith('/app/')) navigate(item.route)
    }

    if (item.read_at) {
      go()
      return
    }

    markRead.mutate(item.id, { onSuccess: go })
  }

  return (
    <div className="relative" ref={container}>
      <button
        className="relative grid size-10 place-items-center rounded-lg border border-transparent bg-transparent text-ink-soft transition-colors hover:border-line hover:bg-canvas hover:text-tide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide"
        type="button"
        aria-label={unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Buka notifikasi'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-white bg-[#b9832a] px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section id={panelId} className="fixed inset-x-4 top-16 z-50 max-h-[calc(100vh-5rem)] overflow-hidden rounded-xl border border-line bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-95" aria-label="Daftar notifikasi">
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-ink">Notifikasi</h2>
              <p className="mt-0.5 text-xs text-ink-soft">{unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}</p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button type="button" disabled={markAll.isPending} onClick={() => markAll.mutate()} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-tide transition-colors hover:bg-success-soft focus-visible:outline-2 focus-visible:outline-tide disabled:opacity-50">
                  {markAll.isPending ? <LoaderCircle className="animate-spin" size={14} /> : <CheckCheck size={14} />} Semua dibaca
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-tide" aria-label="Tutup notifikasi"><X size={17} /></button>
            </div>
          </header>

          <div className="max-h-[min(520px,calc(100vh-9rem))] overflow-y-auto">
            {notifications.isLoading && <State icon={<LoaderCircle className="animate-spin" size={20} />} text="Memuat notifikasi..." />}
            {notifications.isError && (
              <div className="p-5 text-center text-sm text-danger">
                <p>Notifikasi tidak dapat dimuat.</p>
                <button type="button" onClick={() => notifications.refetch()} className="mt-3 rounded-lg border border-danger/20 px-3 py-2 text-xs font-semibold transition-colors hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-danger">Coba Lagi</button>
              </div>
            )}
            {!notifications.isLoading && !notifications.isError && notifications.data?.data.length === 0 && <State icon={<Bell size={21} />} text="Belum ada notifikasi aktivitas." />}
            {notifications.data?.data.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={markRead.isPending}
                onClick={() => openNotification(item)}
                className={`flex w-full gap-3 border-b border-line px-4 py-4 text-left transition-colors last:border-0 hover:bg-canvas focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tide disabled:cursor-wait ${item.read_at ? 'bg-white' : 'bg-success-soft/45'}`}
              >
                <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg ${item.read_at ? 'bg-canvas text-ink-soft' : 'bg-white text-tide'}`}><Handshake size={17} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start gap-2"><strong className="flex-1 text-sm text-ink">{item.title}</strong>{!item.read_at && <i className="mt-1.5 size-2 shrink-0 rounded-full bg-[#b9832a]" aria-label="Belum dibaca" />}</span>
                  <span className="mt-1 block text-xs leading-5 text-ink-soft">{item.message}</span>
                  <time className="mt-2 block text-[11px] font-medium text-tide" dateTime={item.created_at}>{formatNotificationTime(item.created_at)}</time>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function State({ icon, text }: { icon: ReactNode; text: string }) {
  return <div className="grid place-items-center gap-2 px-5 py-10 text-center text-sm text-ink-soft"><span className="text-tide">{icon}</span><p>{text}</p></div>
}

function formatNotificationTime(value: string) {
  const date = new Date(value)
  const elapsed = Date.now() - date.getTime()
  const minutes = Math.floor(elapsed / 60_000)
  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}
