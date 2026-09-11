import { z } from 'zod'

const phonePattern = /^\+?[0-9][0-9\s-]{7,28}[0-9]$/

export const registerSchema = z
  .object({
    role: z.enum(['farmer', 'buyer'], { message: 'Pilih jenis akun.' }),
    name: z.string().trim().min(1, 'Nama lengkap wajib diisi.').max(150),
    email: z.email('Masukkan alamat email yang valid.'),
    phone: z.string().trim().regex(phonePattern, 'Format nomor WhatsApp tidak valid.'),
    location_id: z.coerce.number<number>().int().positive('Pilih kecamatan.'),
    password: z.string().min(8, 'Kata sandi minimal 8 karakter.'),
    password_confirmation: z.string().min(1, 'Konfirmasi kata sandi wajib diisi.'),
  })
  .refine((value) => value.password === value.password_confirmation, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['password_confirmation'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
