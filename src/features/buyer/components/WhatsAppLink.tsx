import { MessageCircle } from 'lucide-react'
import type { CatalogSupply } from '../types/catalog.types'

export function WhatsAppLink({ supply, className, label = 'WhatsApp' }: { supply: CatalogSupply; className: string; label?: string }) {
  if (!supply.whatsapp_url) {
    return <span className={`${className} cursor-not-allowed opacity-50`} aria-disabled="true"><MessageCircle size={17} /> Kontak tidak tersedia</span>
  }

  return <a className={className} href={supply.whatsapp_url} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> {label}</a>
}
