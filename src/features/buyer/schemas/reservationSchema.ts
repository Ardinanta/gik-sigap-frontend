import { z } from 'zod'

export function reservationSchema(maximumVolume: number) {
  return z.object({
    volume_kg: z.coerce.number()
      .positive('Jumlah reservasi harus lebih dari 0 kg.')
      .max(maximumVolume, `Jumlah reservasi maksimal ${new Intl.NumberFormat('id-ID').format(maximumVolume)} kg.`),
    notes: z.string().max(1000, 'Catatan maksimal 1.000 karakter.'),
  })
}

export type ReservationFormValues = {
  volume_kg: number
  notes: string
}
