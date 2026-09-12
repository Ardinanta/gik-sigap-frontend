import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { UnsavedChangesDialog } from '../../../components/UnsavedChangesDialog'
import { getApiError } from '../../../lib/utils'
import { authApi } from '../api/authApi'
import { AuthLayout } from '../components/AuthLayout'
import { FormAlert, PasswordField, SubmitButton, TextField } from '../components/FormControls'
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/passwordSchema'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''
  const validLink = Boolean(token && email)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState('')
  const { register, handleSubmit, setError, formState: { errors, isDirty } } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = handleSubmit(async (values) => {
    if (!validLink) return
    setLoading(true); setFormError('')
    try {
      await authApi.resetPassword({ ...values, token, email })
      setSuccess(true)
    } catch (error) {
      const apiError = getApiError(error, 'Kata sandi belum dapat diperbarui.')
      if (apiError.errors.password) setError('password', { message: apiError.errors.password[0] })
      else setFormError(apiError.errors.email?.[0] ?? apiError.message)
    } finally { setLoading(false) }
  })

  return (
    <AuthLayout icon={success ? CheckCircle2 : ShieldCheck} title={success ? 'Kata sandi diperbarui' : 'Buat kata sandi baru'} description={success ? 'Akun Anda kini dapat digunakan dengan kata sandi baru' : 'Gunakan kata sandi yang aman dan mudah Anda ingat'}>
      {success ? (
        <div className="success-panel">
          <FormAlert variant="success">Kata sandi berhasil diperbarui. Silakan masuk kembali.</FormAlert>
          <Link className="button-primary link-button" to="/login">Masuk ke SIGAP</Link>
        </div>
      ) : !validLink ? (
        <div className="success-panel">
          <FormAlert>Tautan reset tidak lengkap atau tidak valid. Minta tautan baru untuk melanjutkan.</FormAlert>
          <Link className="button-primary link-button" to="/forgot-password">Minta tautan baru</Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {formError && <FormAlert>{formError}</FormAlert>}
          <TextField label="Email" value={email} readOnly icon={<LockKeyhole size={17} />} />
          <PasswordField label="Kata sandi baru" placeholder="Minimal 8 karakter" autoComplete="new-password" icon={<LockKeyhole size={17} />} error={errors.password?.message} {...register('password')} />
          <PasswordField label="Konfirmasi kata sandi" placeholder="Ulangi kata sandi baru" autoComplete="new-password" icon={<LockKeyhole size={17} />} error={errors.password_confirmation?.message} {...register('password_confirmation')} />
          <SubmitButton loading={loading}>Simpan kata sandi baru</SubmitButton>
        </form>
      )}
      <UnsavedChangesDialog when={validLink && isDirty && !loading && !success} />
    </AuthLayout>
  )
}
