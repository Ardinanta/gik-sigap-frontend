import { z } from 'zod'

export const farmerHarvestPlanSchema = z.object({
  pond_name: z.string().trim().min(1, 'Nama tambak wajib diisi.').max(150),
  location_id: z.coerce.number<number>().int().positive('Pilih kecamatan tambak.'),
  fish_size_id: z.coerce.number<number>().int().positive('Pilih ukuran Bandeng.'),
  estimated_volume_kg: z.coerce.number<number>().positive('Volume harus lebih dari 0 kg.').max(9_999_999_999.99),
  harvest_date: z.string().min(1, 'Tanggal panen wajib diisi.'),
  asking_price_per_kg: z.union([z.literal(''), z.coerce.number<number>().positive('Harga harus lebih dari Rp0.')]),
  pond_address: z.string().trim().max(1000),
  notes: z.string().trim().max(1000),
  photo: z.instanceof(File).nullable(),
})

export type FarmerHarvestPlanForm = z.infer<typeof farmerHarvestPlanSchema>
