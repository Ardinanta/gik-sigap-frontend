import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, CalendarDays, CheckCircle2, Lightbulb, ListChecks, LoaderCircle, Search } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { getApiError } from '../../../lib/utils'
import { FormAlert, SelectField, SubmitButton, TextField } from '../../auth/components/FormControls'
import { useBuyerDemands, useBuyerLocations, useCreateBuyerDemand, useFishSizes } from '../hooks/useBuyerDemands'
import { buyerDemandSchema, type BuyerDemandFormOutput, type BuyerDemandFormValues } from '../schemas/buyerDemandSchema'
import type { FishSize } from '../types/buyerDemand.types'

function localDateValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function fishSizeHelper(size: FishSize) {
  if (!size.min_weight_gram || !size.max_weight_gram) return 'Panduan berat belum tersedia'

  const minimumFish = Math.max(1, Math.floor(1000 / Number(size.max_weight_gram)))
  const maximumFish = Math.max(minimumFish, Math.round(1000 / Number(size.min_weight_gram)))
  return `${minimumFish} - ${maximumFish} ekor/kg`
}

function formatVolume(value: string) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Number(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

export function BuyerDemandsPage() {
  const [page, setPage] = useState(1)
  const [formMessage, setFormMessage] = useState('')
  const [formError, setFormError] = useState('')
  const demands = useBuyerDemands(page)
  const fishSizes = useFishSizes()
  const locations = useBuyerLocations()
  const createDemand = useCreateBuyerDemand()
  const today = localDateValue()

  const { register, handleSubmit, control, reset, setError, formState: { errors } } = useForm<BuyerDemandFormValues, unknown, BuyerDemandFormOutput>({
    resolver: zodResolver(buyerDemandSchema),
    defaultValues: {
      fish_size_id: 0,
      required_volume_kg: 0,
      target_location_id: 0,
      need_start_date: today,
      need_end_date: today,
      notes: '',
    },
  })
  const selectedFishSize = useWatch({ control, name: 'fish_size_id' })

  const onSubmit = handleSubmit(async (values) => {
    setFormError('')
    setFormMessage('')

    try {
      const response = await createDemand.mutateAsync({
        ...values,
        target_location_id: values.target_location_id || null,
        notes: values.notes.trim() || null,
      })
      setPage(1)
      setFormMessage(response.message)
      reset({
        fish_size_id: values.fish_size_id,
        required_volume_kg: 0,
        target_location_id: values.target_location_id,
        need_start_date: today,
        need_end_date: today,
        notes: '',
      })
    } catch (error) {
      const apiError = getApiError(error, 'Kebutuhan belum dapat disimpan. Silakan coba lagi.')
      const fields = ['fish_size_id', 'required_volume_kg', 'target_location_id', 'need_start_date', 'need_end_date', 'notes'] as const
      Object.entries(apiError.errors).forEach(([field, messages]) => {
        if (fields.includes(field as typeof fields[number])) {
          setError(field as typeof fields[number], { message: messages[0] })
        }
      })
      if (Object.keys(apiError.errors).length === 0) setFormError(apiError.message)
    }
  })

  return (
    <div className="buyer-page buyer-demands-page">
      <section className="buyer-page-heading buyer-demands-heading">
        <span className="buyer-page-eyebrow"><ListChecks size={14} /> Alur Pembeli</span>
        <h1>Kebutuhan Saya</h1>
        <p>Catat kebutuhan bandeng yang ingin Anda beli agar sistem dapat mencarikan rencana panen yang sesuai.</p>
      </section>

      <div className="buyer-demands-layout">
        <section className="buyer-demand-form-card" aria-labelledby="add-demand-title">
          <div className="buyer-panel-title">
            <div><h2 id="add-demand-title">Tambah Kebutuhan Bandeng</h2><p>Isi rincian pasokan yang sedang Anda cari.</p></div>
            <span aria-hidden="true"><ListChecks size={18} /></span>
          </div>

          <form className="buyer-demand-form" onSubmit={onSubmit} noValidate>
            {formError && <FormAlert>{formError}</FormAlert>}
            {formMessage && <FormAlert variant="success">{formMessage}</FormAlert>}

            <fieldset className="buyer-size-fieldset">
              <legend>Ukuran Bandeng</legend>
              {fishSizes.isLoading && <div className="buyer-inline-loading"><LoaderCircle className="spinner" size={17} /> Memuat ukuran...</div>}
              {fishSizes.isError && <FormAlert variant="info">Ukuran bandeng gagal dimuat. <button className="text-button" type="button" onClick={() => fishSizes.refetch()}>Coba lagi</button></FormAlert>}
              <div className="buyer-size-grid">
                {fishSizes.data?.map((size) => {
                  const selected = Number(selectedFishSize) === size.id
                  return (
                    <label className={`buyer-size-option${selected ? ' selected' : ''}`} key={size.id}>
                      <input type="radio" value={size.id} {...register('fish_size_id')} />
                      <span><strong>{size.name}</strong><small>{fishSizeHelper(size)}</small></span>
                      {selected && <CheckCircle2 size={17} aria-hidden="true" />}
                    </label>
                  )
                })}
              </div>
              {errors.fish_size_id?.message && <p className="field-error" role="alert">{errors.fish_size_id.message}</p>}
            </fieldset>

            <div className="buyer-volume-field">
              <TextField label="Jumlah Kebutuhan (kg)" type="number" min="0.01" step="0.01" placeholder="Contoh: 5000" error={errors.required_volume_kg?.message} {...register('required_volume_kg')} />
              <span className="buyer-input-suffix" aria-hidden="true">kg</span>
            </div>

            <div className="buyer-demand-form-grid">
              <SelectField label="Target Kecamatan" error={errors.target_location_id?.message} disabled={locations.isLoading || locations.isError} {...register('target_location_id')}>
                <option value={0}>{locations.isLoading ? 'Memuat kecamatan...' : locations.isError ? 'Kecamatan gagal dimuat' : 'Semua kecamatan'}</option>
                {locations.data?.map((location) => <option value={location.id} key={location.id}>Kec. {location.name}</option>)}
              </SelectField>
              <TextField label="Tanggal Mulai Dibutuhkan" type="date" min={today} error={errors.need_start_date?.message} {...register('need_start_date')} />
              <TextField label="Tanggal Akhir Dibutuhkan" type="date" min={today} error={errors.need_end_date?.message} {...register('need_end_date')} />
            </div>

            <div className="buyer-textarea-field">
              <label htmlFor="notes">Catatan Tambahan <span>(opsional)</span></label>
              <textarea id="notes" placeholder="Misal: Diutamakan bandeng air payau, siap ditimbang di kolam" aria-invalid={Boolean(errors.notes)} aria-describedby={errors.notes ? 'notes-description' : undefined} {...register('notes')} />
              {errors.notes?.message && <p id="notes-description" className="field-error">{errors.notes.message}</p>}
            </div>

            <SubmitButton loading={createDemand.isPending}><Search size={17} /> Simpan &amp; Cari Petambak</SubmitButton>
          </form>
        </section>

        <aside className="buyer-demand-results" aria-labelledby="active-demands-title">
          <div className="buyer-demand-results-title">
            <h2 id="active-demands-title">Kebutuhan Aktif</h2>
            {demands.data && <span>{demands.data.meta.total} catatan</span>}
          </div>

          {demands.isLoading && <div className="buyer-demand-state"><LoaderCircle className="spinner" size={20} /> Memuat kebutuhan...</div>}
          {demands.isError && <div className="buyer-demand-state error">Data gagal dimuat. <button className="text-button" type="button" onClick={() => demands.refetch()}>Coba lagi</button></div>}
          {demands.data?.data.length === 0 && <div className="buyer-demand-state">Belum ada kebutuhan aktif. Isi form untuk membuat catatan pertama.</div>}

          <div className="buyer-demand-list">
            {demands.data?.data.map((demand) => (
              <article className="buyer-demand-card" key={demand.id}>
                <div className="buyer-demand-card-header">
                  <div><h3>Bandeng {demand.fish_size.name}</h3><span>{demand.fish_size.code === 'small' ? 'Ukuran kecil' : demand.fish_size.code === 'medium' ? 'Ukuran sedang' : 'Ukuran besar'}</span></div>
                  <span className="buyer-demand-status"><i aria-hidden="true" /> Aktif</span>
                </div>
                <dl>
                  <div><dt>Volume Kebutuhan</dt><dd>{formatVolume(demand.required_volume_kg)} kg</dd></div>
                  <div><dt>Wilayah Target</dt><dd>{demand.target_location ? `Kec. ${demand.target_location.name}` : 'Semua kecamatan'}</dd></div>
                  <div className="buyer-demand-period"><dt><CalendarDays size={14} /> Periode Dibutuhkan</dt><dd>{formatDate(demand.need_start_date)} – {formatDate(demand.need_end_date)}</dd></div>
                </dl>
                {demand.notes && <p className="buyer-demand-note">{demand.notes}</p>}
                <Link className="buyer-recommendation-link" to={`/app/buyer/rekomendasi?demand=${demand.id}`}>
                  <Search size={16} /> Lihat Rekomendasi <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>

          {demands.data && demands.data.meta.last_page > 1 && (
            <div className="buyer-pagination" aria-label="Halaman kebutuhan">
              <button type="button" disabled={page <= 1 || demands.isFetching} onClick={() => setPage((current) => current - 1)}>Sebelumnya</button>
              <span>{page} / {demands.data.meta.last_page}</span>
              <button type="button" disabled={page >= demands.data.meta.last_page || demands.isFetching} onClick={() => setPage((current) => current + 1)}>Berikutnya</button>
            </div>
          )}

          <div className="buyer-tip-box">
            <Lightbulb size={19} aria-hidden="true" />
            <div><strong>Tips Pembeli</strong><p>Catat perkiraan tanggal 7–10 hari sebelum waktu kirim agar petambak dapat menyiapkan panen dan sampling timbangan.</p></div>
          </div>
        </aside>
      </div>
    </div>
  )
}
