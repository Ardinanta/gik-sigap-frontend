import { LoaderCircle, Pencil, Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { getApiError } from '../../../lib/utils'
import { PageHeader, QueryState } from '../components/AdminUi'
import { buttonPrimary, buttonSecondary, formatDate, formatNumber, inputClass } from '../adminUi'
import { useAdminMasterData, useSaveMasterData } from '../hooks/useAdmin'
import type { AdminFishSize, AdminLocation, AdminThreshold } from '../types/admin.types'

type Tab = 'locations' | 'fish-sizes' | 'risk-thresholds'
type Editing = { id?: number; values: Record<string, string | boolean> }
type PendingToggle = { resource: Tab; id: number; name: string; active: boolean; payload: Record<string, unknown> }

export function AdminMasterDataPage() {
  const [tab, setTab] = useState<Tab>('locations')
  const [editing, setEditing] = useState<Editing | null>(null)
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null)
  const master = useAdminMasterData()
  const save = useSaveMasterData()
  const data = master.data

  useEffect(() => {
    if (!editing) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && !save.isPending) setEditing(null) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [editing, save.isPending])

  if (!data) return <QueryState loading={master.isLoading} error={master.isError} onRetry={() => master.refetch()} />

  const openNew = () => setEditing({
    values: tab === 'locations'
      ? { code: '', name: '', is_active: true }
      : tab === 'fish-sizes'
        ? { code: '', name: '', min_weight_gram: '', max_weight_gram: '', is_active: true }
        : { location_id: '', threshold_volume_kg: '', warning_ratio: '0.8', effective_from: new Date().toISOString().slice(0, 10), effective_until: '', source_note: '', is_active: true },
  })
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!editing) return
    const numeric = new Set(['location_id', 'threshold_volume_kg', 'warning_ratio', 'min_weight_gram', 'max_weight_gram'])
    const payload = Object.fromEntries(Object.entries(editing.values).map(([key, value]) => [key, value === '' ? null : numeric.has(key) ? Number(value) : value]))
    save.mutate({ resource: tab, id: editing.id, payload }, { onSuccess: () => setEditing(null) })
  }
  const requestToggle = (resource: Tab, item: { id: number; name: string; is_active: boolean }, payload: Record<string, unknown>) => {
    if (item.is_active) setPendingToggle({ resource, id: item.id, name: item.name, active: item.is_active, payload })
    else save.mutate({ resource, id: item.id, payload })
  }
  const saveError = getApiError(save.error, 'Data tidak dapat disimpan.')

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-10">
      <PageHeader eyebrow="Konfigurasi Sistem" title="Kelola Master Data" description="Jaga konsistensi kecamatan, ukuran Bandeng, dan threshold risiko. Data historis dinonaktifkan, bukan dihapus.">
        <button className={buttonPrimary} onClick={openNew}><Plus size={17} /> Tambah Data</button>
      </PageHeader>
      <div className="flex flex-wrap gap-2" role="tablist">
        {([['locations', 'Kecamatan'], ['fish-sizes', 'Ukuran Bandeng'], ['risk-thresholds', 'Threshold Risiko']] as const).map(([value, label]) => <button key={value} role="tab" aria-selected={tab === value} className={tab === value ? buttonPrimary : buttonSecondary} onClick={() => { setTab(value); setEditing(null) }}>{label}</button>)}
      </div>
      <section className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="overflow-x-auto">
          {tab === 'locations' && <LocationTable items={data.locations} edit={(item) => setEditing({ id: item.id, values: { code: item.code, name: item.name, is_active: item.is_active } })} toggle={(item) => requestToggle(tab, item, { code: item.code, name: item.name, is_active: !item.is_active })} />}
          {tab === 'fish-sizes' && <SizeTable items={data.fish_sizes} edit={(item) => setEditing({ id: item.id, values: { code: item.code, name: item.name, min_weight_gram: item.min_weight_gram ?? '', max_weight_gram: item.max_weight_gram ?? '', is_active: item.is_active } })} toggle={(item) => requestToggle(tab, item, { code: item.code, name: item.name, min_weight_gram: item.min_weight_gram, max_weight_gram: item.max_weight_gram, is_active: !item.is_active })} />}
          {tab === 'risk-thresholds' && <ThresholdTable items={data.risk_thresholds} edit={(item) => setEditing({ id: item.id, values: { location_id: String(item.location.id), threshold_volume_kg: item.threshold_volume_kg, warning_ratio: item.warning_ratio, effective_from: item.effective_from, effective_until: item.effective_until ?? '', source_note: item.source_note ?? '', is_active: item.is_active } })} toggle={(item) => requestToggle(tab, { ...item, name: `Threshold ${item.location.name}` }, { location_id: item.location.id, threshold_volume_kg: item.threshold_volume_kg, warning_ratio: item.warning_ratio, effective_from: item.effective_from, effective_until: item.effective_until, source_note: item.source_note, is_active: !item.is_active })} />}
        </div>
      </section>

      {editing && <div className="fixed inset-0 z-50 grid place-items-center bg-tide-dark/55 p-4" onMouseDown={(event) => { if (event.currentTarget === event.target && !save.isPending) setEditing(null) }}><form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="master-data-form-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl"><div className="flex justify-between gap-3"><div><h2 id="master-data-form-title" className="text-lg font-bold">{editing.id ? 'Ubah' : 'Tambah'} Data</h2><p className="text-xs text-ink-soft">Semua perubahan langsung memengaruhi pilihan dan perhitungan berikutnya.</p></div><button type="button" className={buttonSecondary} disabled={save.isPending} onClick={() => setEditing(null)}>Batal</button></div><div className="mt-5 grid gap-4">{Object.entries(editing.values).map(([key, value]) => key === 'is_active' ? <label key={key} className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={Boolean(value)} onChange={(event) => setEditing({ ...editing, values: { ...editing.values, [key]: event.target.checked } })} /> Aktif</label> : key === 'location_id' ? <label key={key} className="grid gap-1 text-xs font-semibold">Kecamatan<select required className={inputClass} value={String(value)} onChange={(event) => setEditing({ ...editing, values: { ...editing.values, [key]: event.target.value } })}><option value="">Pilih kecamatan</option>{data.locations.filter((item) => item.is_active || String(item.id) === String(value)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label> : <label key={key} className="grid gap-1 text-xs font-semibold">{labels[key] ?? key}<input className={inputClass} required={!['min_weight_gram', 'max_weight_gram', 'effective_until', 'source_note'].includes(key)} type={key.startsWith('effective') ? 'date' : ['threshold_volume_kg', 'warning_ratio', 'min_weight_gram', 'max_weight_gram'].includes(key) ? 'number' : 'text'} step={key === 'warning_ratio' ? '0.01' : '0.01'} value={String(value)} onChange={(event) => setEditing({ ...editing, values: { ...editing.values, [key]: event.target.value } })} /></label>)}</div>{save.isError && <div className="mt-4 rounded-lg bg-danger-soft p-3 text-sm text-danger" role="alert"><p>{saveError.message}</p>{Object.values(saveError.errors).flat().map((message, index) => <p key={`${message}-${index}`} className="mt-1">{message}</p>)}</div>}<button disabled={save.isPending} className={`${buttonPrimary} mt-5 w-full`} type="submit">{save.isPending && <LoaderCircle className="animate-spin" size={16} />} Simpan</button></form></div>}

      <ConfirmDialog open={pendingToggle !== null} title="Nonaktifkan data master?" description={pendingToggle ? `${pendingToggle.name} tidak akan muncul pada pilihan aktif berikutnya, tetapi tetap dipertahankan untuk histori.` : ''} confirmLabel="Ya, Nonaktifkan" variant="danger" pending={save.isPending} error={save.isError ? saveError.message : undefined} onCancel={() => setPendingToggle(null)} onConfirm={() => pendingToggle && save.mutate({ resource: pendingToggle.resource, id: pendingToggle.id, payload: pendingToggle.payload }, { onSuccess: () => setPendingToggle(null) })} />
    </div>
  )
}

const labels: Record<string, string> = { code: 'Kode', name: 'Nama', min_weight_gram: 'Berat Minimum (gram)', max_weight_gram: 'Berat Maksimum (gram)', threshold_volume_kg: 'Threshold Volume (kg)', warning_ratio: 'Rasio Waspada', effective_from: 'Berlaku Mulai', effective_until: 'Berlaku Sampai', source_note: 'Catatan Sumber' }
const actions = (edit: () => void, toggle: () => void, active: boolean) => <div className="flex gap-2"><button type="button" className={buttonSecondary} onClick={edit} aria-label="Ubah data"><Pencil size={15} /></button><button type="button" className={buttonSecondary} onClick={toggle} aria-label={active ? 'Nonaktifkan data' : 'Aktifkan data'}>{active ? <ToggleRight className="text-success" size={18} /> : <ToggleLeft size={18} />}</button></div>
function LocationTable({ items, edit, toggle }: { items: AdminLocation[]; edit: (item: AdminLocation) => void; toggle: (item: AdminLocation) => void }) { return <table className="w-full min-w-120 text-left text-xs"><thead className="bg-panel-alt text-ink-soft"><tr><th className="p-4">Kode</th><th className="p-4">Kecamatan</th><th className="p-4">Status</th><th className="p-4">Aksi</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-line"><td className="p-4 font-semibold">{item.code}</td><td className="p-4">{item.name}</td><td className="p-4">{item.is_active ? 'Aktif' : 'Nonaktif'}</td><td className="p-4">{actions(() => edit(item), () => toggle(item), item.is_active)}</td></tr>)}</tbody></table> }
function SizeTable({ items, edit, toggle }: { items: AdminFishSize[]; edit: (item: AdminFishSize) => void; toggle: (item: AdminFishSize) => void }) { return <table className="w-full min-w-155 text-left text-xs"><thead className="bg-panel-alt text-ink-soft"><tr><th className="p-4">Kode</th><th className="p-4">Ukuran</th><th className="p-4">Rentang Berat</th><th className="p-4">Status</th><th className="p-4">Aksi</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-line"><td className="p-4 font-semibold">{item.code}</td><td className="p-4">{item.name}</td><td className="p-4">{item.min_weight_gram ? formatNumber(item.min_weight_gram) : '—'}–{item.max_weight_gram ? formatNumber(item.max_weight_gram) : '—'} gram</td><td className="p-4">{item.is_active ? 'Aktif' : 'Nonaktif'}</td><td className="p-4">{actions(() => edit(item), () => toggle(item), item.is_active)}</td></tr>)}</tbody></table> }
function ThresholdTable({ items, edit, toggle }: { items: AdminThreshold[]; edit: (item: AdminThreshold) => void; toggle: (item: AdminThreshold) => void }) { return <table className="w-full min-w-190 text-left text-xs"><thead className="bg-panel-alt text-ink-soft"><tr><th className="p-4">Kecamatan</th><th className="p-4">Threshold</th><th className="p-4">Batas Waspada</th><th className="p-4">Periode</th><th className="p-4">Status</th><th className="p-4">Aksi</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-line"><td className="p-4 font-semibold">{item.location.name}</td><td className="p-4">{formatNumber(item.threshold_volume_kg)} kg</td><td className="p-4">{formatNumber(Number(item.warning_ratio) * 100)}%</td><td className="p-4">{formatDate(item.effective_from)}–{item.effective_until ? formatDate(item.effective_until) : 'seterusnya'}</td><td className="p-4">{item.is_active ? 'Aktif' : 'Nonaktif'}</td><td className="p-4">{actions(() => edit(item), () => toggle(item), item.is_active)}</td></tr>)}</tbody></table> }
