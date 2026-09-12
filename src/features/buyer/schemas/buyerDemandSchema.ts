import { z } from 'zod'

export const buyerDemandSchema = z.object({
  fish_size_id: z.coerce.number().int().positive('Pilih ukuran bandeng.'),
  required_volume_kg: z.coerce.number().positive('Jumlah kebutuhan harus lebih dari 0 kg.'),
  target_location_id: z.coerce.number().int().min(0),
  need_start_date: z.string().min(1, 'Tanggal mulai wajib diisi.'),
  need_end_date: z.string().min(1, 'Tanggal akhir wajib diisi.'),
  notes: z.string().max(1000, 'Catatan maksimal 1.000 karakter.'),
}).refine((values) => !values.need_start_date || !values.need_end_date || values.need_end_date >= values.need_start_date, {
  path: ['need_end_date'],
  message: 'Tanggal akhir harus sama dengan atau setelah tanggal mulai.',
})

export type BuyerDemandFormValues = z.input<typeof buyerDemandSchema>
export type BuyerDemandFormOutput = z.output<typeof buyerDemandSchema>
