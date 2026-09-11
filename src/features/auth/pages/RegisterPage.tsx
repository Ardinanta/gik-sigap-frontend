import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole, Mail, Phone, ShoppingBasket, User, UserPlus, Waves } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { getApiError } from '../../../lib/utils'
import { AuthLayout } from '../components/AuthLayout'
import { FormAlert, PasswordField, SelectField, SubmitButton, TextField } from '../components/FormControls'
import { useLocations, useRegister } from '../hooks/useAuth'
import { registerSchema, type RegisterFormValues } from '../schemas/registerSchema'

export function RegisterPage() {
  const navigate = useNavigate()
  const registerAccount = useRegister()
  const locations = useLocations()
  const [formError, setFormError] = useState('')
  const { register, handleSubmit, control, setValue, setError, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'farmer', name: '', email: '', phone: '', location_id: 0, password: '', password_confirmation: '' },
  })
  const selectedRole = useWatch({ control, name: 'role' })

  const onSubmit = handleSubmit(async (values) => {
    setFormError('')
    try {
      await registerAccount.mutateAsync(values)
      navigate('/app', { replace: true })
    } catch (error) {
      const apiError = getApiError(error, 'Akun belum dapat dibuat. Periksa kembali data Anda.')
      const fields = ['role', 'name', 'email', 'phone', 'location_id', 'password', 'password_confirmation'] as const
      Object.entries(apiError.errors).forEach(([field, messages]) => {
        if (fields.includes(field as typeof fields[number])) setError(field as typeof fields[number], { message: messages[0] })
      })
      if (Object.keys(apiError.errors).length === 0) setFormError(apiError.message)
    }
  })

  return (
    <AuthLayout wide icon={UserPlus} title="Buat akun SIGAP" description="Pilih peran dan lengkapi data untuk mulai menggunakan layanan">
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {formError && <FormAlert>{formError}</FormAlert>}
        <fieldset className="role-fieldset">
          <legend>Jenis akun</legend>
          <div className="role-grid">
            <button type="button" className={`role-card${selectedRole === 'farmer' ? ' selected' : ''}`} onClick={() => setValue('role', 'farmer', { shouldValidate: true })} aria-pressed={selectedRole === 'farmer'}>
              <span className="role-icon"><Waves size={21} /></span><span><strong>Petambak</strong><small>Kelola rencana dan hasil panen</small></span>
            </button>
            <button type="button" className={`role-card${selectedRole === 'buyer' ? ' selected' : ''}`} onClick={() => setValue('role', 'buyer', { shouldValidate: true })} aria-pressed={selectedRole === 'buyer'}>
              <span className="role-icon"><ShoppingBasket size={21} /></span><span><strong>Pembeli</strong><small>Temukan pasokan sesuai kebutuhan</small></span>
            </button>
          </div>
          {errors.role?.message && <p className="field-error">{errors.role.message}</p>}
        </fieldset>

        <div className="form-grid">
          <TextField label="Nama lengkap" placeholder="Nama Anda" autoComplete="name" icon={<User size={17} />} error={errors.name?.message} {...register('name')} />
          <TextField label="Email" type="email" placeholder="nama@email.com" autoComplete="email" icon={<Mail size={17} />} error={errors.email?.message} {...register('email')} />
          <TextField label="Nomor WhatsApp" type="tel" placeholder="08xxxxxxxxxx" autoComplete="tel" icon={<Phone size={17} />} error={errors.phone?.message} {...register('phone')} />
          <SelectField label="Kecamatan" error={errors.location_id?.message} disabled={locations.isLoading || locations.isError} {...register('location_id')}>
            <option value={0}>{locations.isLoading ? 'Memuat kecamatan...' : locations.isError ? 'Kecamatan gagal dimuat' : 'Pilih kecamatan'}</option>
            {locations.data?.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
          </SelectField>
        </div>
        {locations.isError && <FormAlert variant="info">Data kecamatan gagal dimuat. <button type="button" className="text-button" onClick={() => locations.refetch()}>Coba lagi</button></FormAlert>}
        {locations.data?.length === 0 && <FormAlert variant="info">Belum ada kecamatan aktif yang tersedia.</FormAlert>}

        <div className="form-grid">
          <PasswordField label="Kata sandi" placeholder="Minimal 8 karakter" autoComplete="new-password" icon={<LockKeyhole size={17} />} error={errors.password?.message} {...register('password')} />
          <PasswordField label="Konfirmasi kata sandi" placeholder="Ulangi kata sandi" autoComplete="new-password" icon={<LockKeyhole size={17} />} error={errors.password_confirmation?.message} {...register('password_confirmation')} />
        </div>
        <SubmitButton loading={registerAccount.isPending}>Daftar akun</SubmitButton>
      </form>
      <p className="auth-switch">Sudah memiliki akun? <Link to="/login">Masuk</Link></p>
    </AuthLayout>
  )
}
