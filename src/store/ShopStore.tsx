import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { computeChart, defaultCfg, sizes, type CfgState, type PosterData } from '../lib/bazi'
import { getProduct, type Addon, type Bundle } from '../lib/catalog'
import { FREE_SHIP_THRESHOLD } from '../lib/tokens'

export interface CartLine {
  key: string
  title: string
  price: number
  qty: number
  poster: PosterData | null
  meta: string
  personalization?: Record<string, string>
}

const CART_KEY = 'sizhu_cart'

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

interface ShopValue {
  cart: CartLine[]
  cartOpen: boolean
  cfg: CfgState
  openFaqId: string
  newsletterDone: Record<string, boolean>
  newsletterEmail: Record<string, string>
  articleId: string | null
  toast: string
  // derived
  cartCount: number
  subtotal: number
  shipCost: number
  total: number
  tax: number
  remaining: number
  reached: boolean
  // actions
  openCart: () => void
  closeCart: () => void
  addCurrent: (productId: number) => void
  addBundle: (b: Bundle) => void
  addAddon: (a: Addon) => void
  addItem: (item: Omit<CartLine, 'key'>) => void
  setQty: (key: string, d: number) => void
  removeLine: (key: string) => void
  clearCart: () => void
  setCfg: (patch: Partial<CfgState>) => void
  showToast: (msg: string) => void
  setOpenFaqId: (id: string) => void
  submitNewsletter: (id: string) => void
  setNewsletterEmail: (id: string, v: string) => void
  openArticle: (id: string) => void
  closeArticle: () => void
}

const ShopContext = createContext<ShopValue | null>(null)

export function ShopStoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(loadCart)
  const [cartOpen, setCartOpen] = useState(false)
  const [cfg, setCfgState] = useState<CfgState>(defaultCfg)
  const [openFaqId, setOpenFaqId] = useState('details')
  const [newsletterDone, setNewsletterDone] = useState<Record<string, boolean>>({})
  const [newsletterEmail, setNewsletterEmail] = useState<Record<string, string>>({})
  const [articleId, setArticleId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyRef = useRef(0)

  // lock body scroll while an overlay is open
  useEffect(() => {
    document.body.style.overflow = cartOpen || articleId ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, articleId])

  // persist cart so it survives the Stripe redirect round-trip and reloads
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch { /* ignore */ }
  }, [cart])

  const value = useMemo<ShopValue>(() => {
    const cartCount = cart.reduce((a, i) => a + i.qty, 0)
    const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0)
    const reached = subtotal >= FREE_SHIP_THRESHOLD && cart.length > 0
    const shipCost = cart.length === 0 || reached ? 0 : 4.9
    const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal)
    const total = subtotal + shipCost
    const tax = total - total / 1.19

    const nextKey = () => `${Date.now()}-${keyRef.current++}`

    const addLine = (line: Omit<CartLine, 'key'>) => {
      setCart((s) => [...s, { ...line, key: nextKey() }])
      setCartOpen(true)
    }

    const showToast = (msg: string) => {
      setToast(msg)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(''), 2600)
    }

    return {
      cart, cartOpen, cfg, openFaqId, newsletterDone, newsletterEmail, articleId, toast,
      cartCount, subtotal, shipCost, total, tax, remaining, reached,

      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),

      addCurrent: (productId) => {
        const prod = getProduct(productId)
        if (!prod) return
        const size = sizes.find((z) => z.id === cfg.size) ?? sizes[1]
        const chart = computeChart(cfg.date, cfg.time)
        const poster: PosterData = { frame: cfg.frameHex, bg: cfg.bgHex, name: cfg.name || 'Dein Name', element: chart.element, animal: chart.animal, pillars: chart.pillars }
        const personalization = { date: cfg.date, time: cfg.time, place: cfg.place, name: cfg.name || '', frame: cfg.frameName, bg: cfg.bgName, size: size.label }
        addLine({ title: prod.title, price: prod.price + size.delta, qty: 1, poster, meta: `${cfg.frameName} · ${cfg.bgName} · ${size.label}`, personalization })
        showToast('Zum Warenkorb hinzugefügt')
      },
      addBundle: (b) => {
        addLine({ title: b.title, price: b.price, qty: 1, poster: b.p1, meta: '3-teiliges Set · Vorteilspreis' })
        showToast('Set zum Warenkorb hinzugefügt')
      },
      addAddon: (a) => addLine({ title: a.title, price: a.price, qty: 1, poster: null, meta: a.note }),
      addItem: (item) => addLine(item),
      setQty: (key, d) => setCart((s) => s.map((i) => (i.key === key ? { ...i, qty: Math.max(1, i.qty + d) } : i))),
      removeLine: (key) => setCart((s) => s.filter((i) => i.key !== key)),
      clearCart: () => setCart([]),
      setCfg: (patch) => setCfgState((s) => ({ ...s, ...patch })),
      showToast,
      setOpenFaqId,
      submitNewsletter: (id) => setNewsletterDone((s) => ({ ...s, [id]: true })),
      setNewsletterEmail: (id, v) => setNewsletterEmail((s) => ({ ...s, [id]: v })),
      openArticle: (id) => setArticleId(id),
      closeArticle: () => setArticleId(null),
    }
  }, [cart, cartOpen, cfg, openFaqId, newsletterDone, newsletterEmail, articleId, toast])

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShopStore(): ShopValue {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShopStore must be used inside ShopStoreProvider')
  return ctx
}
