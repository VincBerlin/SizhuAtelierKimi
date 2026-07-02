// Auth + account API client (profile, addresses, orders). Talks to /api/auth/*
// and /api/account/* on the same origin; the session is an HttpOnly cookie set by
// the server.

export interface AuthUser {
  email: string
  name: string
  preferredLanguage: string
  // The Celestial-Credits machinery was decommissioned (REQ-010): the server no
  // longer returns points / lifetime / unlockedFeatures / achievements, so they
  // are no longer part of the auth contract. Do NOT re-add a credits surface.
  marketingConsent: boolean
  newsletterStatus: string
  hasPayment: boolean
  defaultShippingAddressId: number | null
  defaultBillingAddressId: number | null
  createdAt: string
}

export interface OrderRow {
  created_at: string
  amount_total: number
  currency: string
  status: string
  items: { description?: string; qty?: number; amount?: number }[]
}

export interface Address {
  id: number
  type: 'shipping' | 'billing'
  full_name: string
  line1: string
  line2: string
  postal_code: string
  city: string
  region: string
  country: string
  phone: string
  is_default: boolean
}

export type AddressInput = {
  type?: 'shipping' | 'billing'
  full_name?: string
  line1?: string
  line2?: string
  postal_code?: string
  city?: string
  region?: string
  country?: string
  phone?: string
  makeDefault?: boolean
}

export interface AuthResult {
  ok: boolean
  status: number
  error?: string
  id?: number
}

async function send(method: string, path: string, body?: unknown): Promise<AuthResult> {
  try {
    const res = await fetch(path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok && data.ok !== false, status: res.status, error: data.error, id: data.id }
  } catch {
    return { ok: false, status: 0, error: 'network_error' }
  }
}
const post = (path: string, body?: unknown) => send('POST', path, body)

export const apiSignup = (email: string, password: string, marketingConsent: boolean, name?: string) =>
  post('/api/auth/signup', { email, password, marketingConsent, name })
export const apiLogin = (email: string, password: string) => post('/api/auth/login', { email, password })
export const apiLogout = () => post('/api/auth/logout')
export const apiUpdatePrefs = (marketingConsent: boolean) => post('/api/auth/preferences', { marketingConsent })
export const apiResetRequest = (email: string) => post('/api/auth/reset/request', { email })
export const apiResetConfirm = (token: string, password: string) => post('/api/auth/reset/confirm', { token, password })

export const apiUpdateProfile = (name: string, preferredLanguage: string) =>
  send('PATCH', '/api/auth/profile', { name, preferredLanguage })
export const apiChangePassword = (currentPassword: string, newPassword: string) =>
  post('/api/auth/password', { currentPassword, newPassword })

export const apiCreateAddress = (body: AddressInput) => post('/api/account/addresses', body)
export const apiUpdateAddress = (id: number, body: AddressInput) => send('PATCH', `/api/account/addresses/${id}`, body)
export const apiDeleteAddress = (id: number) => send('DELETE', `/api/account/addresses/${id}`)
export const apiSetDefaultAddress = (id: number) => post(`/api/account/addresses/${id}/default`)

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

export async function apiAddresses(): Promise<Address[]> {
  try {
    const res = await fetch('/api/account/addresses', { credentials: 'same-origin' })
    const data = await res.json().catch(() => ({}))
    return Array.isArray(data.addresses) ? data.addresses : []
  } catch {
    return []
  }
}

export async function apiBillingPortal(): Promise<{ url?: string; error?: string }> {
  try {
    const res = await fetch('/api/account/billing-portal', { method: 'POST', credentials: 'same-origin' })
    const data = await res.json().catch(() => ({}))
    return { url: data.url, error: data.error }
  } catch {
    return { error: 'network_error' }
  }
}
