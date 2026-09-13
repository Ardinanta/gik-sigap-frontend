export interface AppNotification {
  id: string
  category: string
  title: string
  message: string
  route: string | null
  resource_id: number | null
  read_at: string | null
  created_at: string
}

export interface NotificationResponse {
  success: boolean
  message: string
  data: AppNotification[]
  unread_count: number
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
