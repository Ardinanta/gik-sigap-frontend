export function formatVolume(value: string | number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Number(value))
}

export function formatPrice(value: string | null) {
  if (!value) return 'Hubungi untuk harga'
  return `${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value))}/kg`
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}
