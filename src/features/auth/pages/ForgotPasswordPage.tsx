import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, KeyRound, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { getApiError } from '../../../lib/utils'
import { authApi } from '../api/authApi'
import { AuthLayout } from '../components/AuthLayout'
import { FormAlert, SubmitButton, TextField } from '../components/FormControls'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/passwordSchema'

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')
  const { register, handleSubmit, setError, formState: { errors } } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true); setFormError(''); setMessage('')
    try {
      const response = await authApi.forgotPassword(values)
      setMessage(response.message)
    } catch (error) {
      const apiError = getApiError(error, 'Tautan belum dapat dikirim. Silakan coba lagi.')
      if (apiError.errors.email) setError('email', { message: apiError.errors.email[0] })
      else setFormError(apiError.message)
    } finally { setLoading(false) }
  })

  return (
    <AuthLayout icon={KeyRound} title="Lupa kata sandi?" description="Kami akan mengirimkan tautan untuk membuat kata sandi baru">
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <FormAlert variant="info">Tautan reset hanya berlaku selama <strong>60 menit</strong> dan hanya dapat digunakan satu kali.</FormAlert>
        {message && <FormAlert variant="success">{message}</FormAlert>}
        {formError && <FormAlert>{formError}</FormAlert>}
        <TextField label="Email terdaftar" type="email" placeholder="nama@email.com" autoComplete="email" icon={<Mail size={17} />} error={errors.email?.message} {...register('email')} />
        <SubmitButton loading={loading}>{message ? 'Kirim ulang tautan' : 'Kirim tautan reset'}</SubmitButton>
      </form>
      <p className="auth-switch"><Link to="/login" className="back-link"><ArrowLeft size={15} /> Kembali ke halaman masuk</Link></p>
    </AuthLayout>
  )
}
