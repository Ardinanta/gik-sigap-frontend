import { ConfirmDialog } from './ConfirmDialog'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'

export function UnsavedChangesDialog({ when }: { when: boolean }) {
  const navigation = useUnsavedChanges(when)

  return (
    <ConfirmDialog
      open={navigation.blocked}
      title="Buang perubahan yang belum disimpan?"
      description="Input yang sudah Anda isi pada halaman ini akan hilang jika Anda melanjutkan."
      confirmLabel="Buang Perubahan"
      cancelLabel="Tetap di Halaman"
      variant="danger"
      onCancel={navigation.reset}
      onConfirm={navigation.proceed}
    />
  )
}
