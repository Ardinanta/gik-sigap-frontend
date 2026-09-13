export function formatIndonesianPhoneNumber(value: string | null | undefined) {
  if (!value || !/^628\d{7,12}$/.test(value)) return value ?? null

  const subscriberNumber = value.slice(2)
  const groups = [subscriberNumber.slice(0, 3), subscriberNumber.slice(3, 7), subscriberNumber.slice(7)]

  return `+62 ${groups.filter(Boolean).join('-')}`
}
