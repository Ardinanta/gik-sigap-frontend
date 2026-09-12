import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2, ClipboardList, Info, LoaderCircle, MapPin, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { UnsavedChangesDialog } from '../../../components/UnsavedChangesDialog'
import { getApiError } from '../../../lib/utils'
import { WhatsAppLink } from '../components/WhatsAppLink'
import { useCatalogDetail, useCreateReservation } from '../hooks/useCatalog'
import { reservationSchema, type ReservationFormOutput, type ReservationFormValues } from '../schemas/reservationSchema'
import { formatDate, formatPrice, formatVolume } from '../utils/catalogFormatters'

function fishSizeGuide(code: string) {
  if (code === 'small') return '6–8 ekor/kg'
  if (code === 'medium') return '3–4 ekor/kg'
  if (code === 'large') return '1–2 ekor/kg'
  return null
}

function expiryText(value: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function BuyerSupplyDetailPage() {
  const params = useParams()
  const routeLocation = useLocation()
  const id = Number(params.harvestPlanId)
  const validId = Number.isInteger(id) && id > 0
  const detail = useCatalogDetail(validId ? id : null)
  const createReservation = useCreateReservation(validId ? id : 0)
  const [successMessage, setSuccessMessage] = useState('')
  const [successExpiry, setSuccessExpiry] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [pendingReservation, setPendingReservation] = useState<ReservationFormOutput | null>(null)
  const returnTo = typeof routeLocation.state?.from === 'string' && routeLocation.state.from.startsWith('/app/buyer/pasokan') ? routeLocation.state.from : '/app/buyer/pasokan'
  const available = Number(detail.data?.available_volume_kg ?? 0)
  const schema = useMemo(() => reservationSchema(available), [available])
  const { register, handleSubmit, reset, setError, control, formState: { errors, isDirty } } = useForm<ReservationFormValues, unknown, ReservationFormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { volume_kg: 0, notes: '' },
  })
  const volume = Number(useWatch({ control, name: 'volume_kg' }) || 0)
  const estimatedTotal = detail.data?.asking_price_per_kg ? volume * Number(detail.data.asking_price_per_kg) : null


  const onSubmit = handleSubmit((values) => {
    setSuccessMessage('')
    setSuccessExpiry(null)
    setFormError('')
    setPendingReservation(values)
  })

  const confirmReservation = async () => {
    if (!pendingReservation) return

    try {
      const response = await createReservation.mutateAsync({
        volume_kg: pendingReservation.volume_kg,
        notes: pendingReservation.notes.trim() || null,
      })
      setPendingReservation(null)
      setSuccessMessage(response.message)
      setSuccessExpiry(response.data.expires_at)
      reset({ volume_kg: 0, notes: '' })
    } catch (error) {
      const apiError = getApiError(error, 'Pengajuan reservasi belum dapat dikirim.')
      if (apiError.errors.volume_kg?.[0]) setError('volume_kg', { message: apiError.errors.volume_kg[0] })
      if (apiError.errors.notes?.[0]) setError('notes', { message: apiError.errors.notes[0] })
      setFormError(apiError.message)
    }
  }

  if (!validId) return <div className="buyer-page grid min-h-64 place-items-center text-center"><div><h1 className="text-xl font-bold text-ink">Pasokan tidak valid</h1><Link className="mt-3 inline-block font-bold text-tide" to={returnTo}>Kembali ke katalog</Link></div></div>
  if (detail.isLoading) return <div className="buyer-page flex min-h-64 items-center justify-center gap-2 text-sm text-ink-soft"><LoaderCircle className="animate-spin" size={20} /> Memuat detail tambak...</div>
  if (detail.isError || !detail.data) return <div className="buyer-page grid min-h-64 place-items-center text-center"><div><h1 className="text-xl font-bold text-ink">Detail pasokan tidak ditemukan</h1><p className="mt-2 text-sm text-ink-soft">Pasokan mungkin sudah tidak tersedia.</p><div className="mt-4 flex justify-center gap-3"><Link className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink! no-underline" to={returnTo}>Kembali</Link><button className="rounded-lg bg-tide px-4 py-2 text-sm font-bold text-white" type="button" onClick={() => detail.refetch()}>Coba lagi</button></div></div></div>

  const supply = detail.data
  const sizeGuide = fishSizeGuide(supply.fish_size.code)

  return (
    <div className="buyer-page grid gap-5 text-ink">
      <header className="flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-3"><Link className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-bold text-ink! no-underline hover:bg-panel-alt hover:no-underline" to={returnTo}><ArrowLeft size={16} /> Kembali</Link><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-xl font-bold sm:text-2xl">Detail Tambak: {supply.pond_name}</h1><span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-bold text-success"><i className="size-2 rounded-full bg-success" /> Tersedia</span></div></div></div>
        <p className="flex shrink-0 items-center gap-1.5 text-sm text-ink-soft"><MapPin size={15} /> {supply.pond_address || `Kec. ${supply.location.name}`}</p>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6" aria-labelledby="supply-info-title">
          <h2 id="supply-info-title" className="flex items-center gap-2 border-b border-line pb-4 text-sm font-bold text-tide"><Info size={17} /> Informasi Tambak &amp; Pasokan</h2>
          <dl className="divide-y divide-line text-sm">
            <div className="grid grid-cols-[1fr_auto] gap-4 py-4"><dt className="text-ink-soft">Nama Petambak</dt><dd className="text-right font-bold">{supply.farmer_name} ({supply.location.name}, Gresik)</dd></div>
            <div className="grid grid-cols-[1fr_auto] gap-4 py-4"><dt className="text-ink-soft">Tanggal Panen</dt><dd className="text-right font-bold">{formatDate(supply.harvest_date)}</dd></div>
            <div className="grid grid-cols-[1fr_auto] gap-4 py-4"><dt className="text-ink-soft">Total Estimasi Pasokan</dt><dd className="text-right font-bold">{formatVolume(supply.estimated_volume_kg)} kg <span className="font-normal text-success">(Tersedia {formatVolume(supply.available_volume_kg)} kg)</span></dd></div>
            <div className="grid grid-cols-[1fr_auto] gap-4 py-4"><dt className="text-ink-soft">Ukuran Bandeng</dt><dd className="text-right font-bold">{supply.fish_size.name}{sizeGuide && ` (${sizeGuide})`}</dd></div>
            <div className="grid grid-cols-[1fr_auto] gap-4 py-4"><dt className="text-ink-soft">Harga Acuan</dt><dd className="text-right text-lg font-bold text-tide">{formatPrice(supply.asking_price_per_kg)}</dd></div>
          </dl>
          {supply.notes && <div className="rounded-lg bg-panel-alt p-4 text-sm leading-6"><strong>Catatan Singkat:</strong> {supply.notes}</div>}
        </section>

        <section className="rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6" aria-labelledby="reservation-form-title">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-4"><h2 id="reservation-form-title" className="flex items-center gap-2 text-sm font-bold text-tide"><ClipboardList size={17} /> Formulir Reservasi</h2><span className="rounded-md bg-panel-alt px-2 py-1 text-xs text-ink-soft">Tanpa DP Online</span></div>
          <form className="mt-5 grid gap-4" onSubmit={onSubmit} noValidate>
            {successMessage && <div className="flex gap-3 rounded-lg bg-success-soft p-4 text-sm text-success" role="status"><CheckCircle2 className="shrink-0" size={19} /><div><strong>{successMessage}</strong>{successExpiry && <p className="mt-1">Berlaku sampai {expiryText(successExpiry)}.</p>}</div></div>}
            {formError && <div className="rounded-lg bg-danger-soft p-4 text-sm text-danger" role="alert">{formError}</div>}
            <label className="grid gap-1.5 text-xs font-semibold" htmlFor="reservation-volume"><span className="flex justify-between gap-3"><span>Jumlah Reservasi (kg)</span><span className="font-normal text-ink-soft">Maks. {formatVolume(supply.available_volume_kg)} kg</span></span><div className="relative"><input id="reservation-volume" className="min-h-11 w-full rounded-lg border border-line px-3 pr-10 text-sm focus:border-tide focus:outline-none focus:ring-2 focus:ring-tide/15" type="number" min="0.01" max={available} step="0.01" placeholder="Contoh: 2.000" aria-invalid={Boolean(errors.volume_kg)} {...register('volume_kg')} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft">kg</span></div>{errors.volume_kg?.message && <span className="font-normal text-danger" role="alert">{errors.volume_kg.message}</span>}</label>
            <div className="rounded-lg border border-tide/15 bg-success-soft p-4"><div className="flex items-start justify-between gap-4"><span className="text-xs text-tide">Estimasi Total Nilai:</span>{detail.data.asking_price_per_kg && <span className="text-right text-xs text-ink-soft">{formatVolume(volume)} kg × {formatPrice(detail.data.asking_price_per_kg).replace('/kg', '')}</span>}</div><strong className="mt-1 block text-xl text-tide">{estimatedTotal === null ? 'Harga didiskusikan' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(estimatedTotal)}</strong></div>
            <label className="grid gap-1.5 text-xs font-semibold" htmlFor="reservation-notes">Catatan / Armada Pickup <span className="font-normal text-ink-soft">(Opsional)</span><textarea id="reservation-notes" className="min-h-24 resize-y rounded-lg border border-line p-3 text-sm font-normal leading-5 focus:border-tide focus:outline-none focus:ring-2 focus:ring-tide/15" placeholder="Contoh: Armada pickup L300 tiba pukul 06.00 WIB membawa 4 drum pendingin..." aria-invalid={Boolean(errors.notes)} {...register('notes')} />{errors.notes?.message && <span className="font-normal text-danger" role="alert">{errors.notes.message}</span>}</label>
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-tide px-5 text-sm font-bold text-white hover:bg-tide-dark disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={createReservation.isPending || available <= 0}>{createReservation.isPending ? <LoaderCircle className="animate-spin" size={17} /> : <Send size={17} />} Kirim Pengajuan Reservasi</button>
            <WhatsAppLink supply={supply} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 text-sm font-bold text-tide! no-underline hover:bg-panel-alt hover:text-tide! hover:no-underline" />
          </form>
        </section>
      </div>

      <ConfirmDialog
        open={pendingReservation !== null}
        title="Ajukan reservasi pasokan?"
        description={pendingReservation ? <><strong className="text-ink">{formatVolume(pendingReservation.volume_kg)} kg</strong> dari {supply.pond_name} akan ditahan sementara dengan status pending. Tidak ada pembayaran atau DP online melalui SIGAP.</> : ''}
        confirmLabel="Ya, Ajukan Reservasi"
        pending={createReservation.isPending}
        error={formError || undefined}
        onCancel={() => setPendingReservation(null)}
        onConfirm={confirmReservation}
      />
      <UnsavedChangesDialog when={isDirty && !createReservation.isPending && !successMessage} />
    </div>
  )
}
