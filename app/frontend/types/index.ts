export interface User {
  id: number
  full_name: string
  email: string
  personal_id: string
  locale: string
  created_at: string
  updated_at: string
}

export interface Auth {
  user: User
}

export interface SharedData {
  auth: Auth
  locale: string
  flash?: {
    notice?: string
    alert?: string
  }
}
