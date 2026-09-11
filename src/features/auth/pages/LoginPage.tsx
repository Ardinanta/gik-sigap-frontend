import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole, LogIn, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { getApiError } from '../../../lib/utils'
import { AuthLayout } from '../components/AuthLayout'
import { FormAlert, PasswordField, SubmitButton, TextField } from '../components/FormControls'
import { useLogin } from '../hooks/useAuth'
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const [formError, setFormError] = useState('')
  const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError('')
    try {
      await login.mutateAsync(values)
      navigate('/app', { replace: true })
    } catch (error) {
      const apiError = getApiError(error, 'Tidak dapat masuk. Periksa kembali data Anda.')
      Object.entries(apiError.errors).forEach(([field, messages]) => {
        if (field === 'email' || field === 'password') setError(field, { message: messages[0] })
      })
      if (Object.keys(apiError.errors).length === 0) setFormError(apiError.message)
    }
  })

  return (
    <AuthLayout icon={LogIn} title="Selamat datang kembali" description="Masuk untuk melanjutkan ke layanan SIGAP">
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {formError && <FormAlert>{formError}</FormAlert>}
        <TextField label="Email" type="email" placeholder="nama@email.com" autoComplete="email" icon={<Mail size={17} />} error={errors.email?.message} {...register('email')} />
        <PasswordField label="Kata sandi" placeholder="Masukkan kata sandi" autoComplete="current-password" icon={<LockKeyhole size={17} />} error={errors.password?.message} {...register('password')} />
        <div className="form-options">
          <label className="check-label"><input type="checkbox" {...register('remember')} /> Ingat saya</label>
          <Link to="/forgot-password">Lupa kata sandi?</Link>
        </div>
        <SubmitButton loading={login.isPending}>Masuk</SubmitButton>
      </form>
      <p className="auth-switch">Belum memiliki akun? <Link to="/register">Daftar sekarang</Link></p>
    </AuthLayout>
  )
}
