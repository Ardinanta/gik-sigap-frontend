import type { LucideIcon } from 'lucide-react'

interface BuyerEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

export function BuyerEmptyState({ icon: Icon, title, description }: BuyerEmptyStateProps) {
  return (
    <section className="buyer-empty-state">
      <div className="buyer-empty-icon" aria-hidden="true"><Icon size={23} /></div>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  )
}
