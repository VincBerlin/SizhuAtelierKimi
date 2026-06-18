// Auth API client (profile + Celestial Credits accounts). Talks to /api/auth/*
// on the same origin; the session is an HttpOnly cookie set by the server.

export interface AuthUser {
  email: string
  points: number
  lifetime: number
  marketingConsent: boolean
  newsletterStatus: string
  unlockedFeatures: string[]
  achievements: string[]
  createdAt: string
}

export interface OrderRow {
  created_at: string
  amount_total: number
  currency: string
  status: string
  items: { description?: string; qty?: number; amount?: number }[]
}

export interface AuthResult {
  ok: boolean
  status: number
  error?: string
}

async function post(path: string, body?: unknown): Promise<AuthResult> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok && data.ok !== false, status: res.status, error: data.error }
  } catch {
    return { ok: false, status: 0, error: 'network_error' }
  }
}

export const apiSignup = (email: string, password: string, marketingConsent: boolean) => post('/api/auth/signup', { email, password, marketingConsent })
export const apiLogin = (email: string, password: string) => post('/api/auth/login', { email, password })
export const apiLogout = () => post('/api/auth/logout')
export const apiUpdatePrefs = (marketingConsent: boolean) => post('/api/auth/preferences', { marketingConsent })
export const apiResetRequest = (email: string) => post('/api/auth/reset/request', { email })
export const apiResetConfirm = (token: string, password: string) => post('/api/auth/reset/confirm', { token, password })

export async function apiMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' })
    const data = await res.json().catch(() => ({}))
    return (data && data.user) || null
  } catch {
    return null
  }
}

export async function apiOrders(): Promise<OrderRow[]> {
  try {
    const res = await fetch('/api/auth/orders', { credentials: 'same-origin' })
    const data = await res.json().catch(() => ({}))
    return Array.isArray(data.orders) ? data.orders : []
  } catch {
    return []
  }
}
