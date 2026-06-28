import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { computeChart, defaultCfg, sizes, type CfgState, type PosterData } from '../lib/bazi'
import { birthTimeMeta } from '../lib/personalization'
import { getProduct, type Addon, type Bundle } from '../lib/catalog'
import { FREE_SHIP_THRESHOLD } from '../lib/tokens'
import { fetchRegion, type Region } from '../lib/region'
import { posterProductId, buildVariantId, bundleProductId, addonProductId } from '../lib/checkout'

export interface CartLine {
  key: string
  title: string
  price: number
  qty: number
  poster: PosterData | null
  meta: string
  personalization?: Record<string, string>
  /** Static product image for non-personalizable lines (TCM / Fire Horse). */
  image?: string
  /** Stable server-pricing identity (ADR-001): the server re-prices from these,
   *  ignoring the client price. Optional so legacy persisted carts still load. */
  productId?: string
  variantId?: string
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
  region: Region
  freeShipThreshold: number
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
  const [region, setRegion] = useState<Region>('eu')
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

  // detect the shipping region (server IP geolocation) once
  useEffect(() => { fetchRegion().then(setRegion) }, [])

  const value = useMemo<ShopValue>(() => {
    const cartCount = cart.reduce((a, i) => a + i.qty, 0)
    const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0)
    // US/UK ship free; EU (and other) get free shipping over the threshold (§13)
    const freeShipThreshold = region === 'us' || region === 'uk' ? 0 : FREE_SHIP_THRESHOLD
    const reached = cart.length > 0 && subtotal >= freeShipThreshold
    const shipCost = cart.length === 0 || reached ? 0 : 4.9
    const remaining = Math.max(0, freeShipThreshold - subtotal)
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
      cartCount, subtotal, shipCost, total, tax, remaining, reached, region, freeShipThreshold,

      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),

      addCurrent: (productId) => {
        const prod = getProduct(productId)
        if (!prod) return
        const size = sizes.find((z) => z.id === cfg.size) ?? sizes[1]
        // An empty time means the buyer did not provide a birth time → disclosed
        // noon fallback (REQ-018). Thread place + the unknown flag through to the
        // placeholder chart (accepted, not used to vary it) and the metadata.
        const birthTimeUnknown = !cfg.time
        const bt = birthTimeMeta(cfg.time, birthTimeUnknown)
        const chart = computeChart(cfg.date, bt.time, cfg.place, birthTimeUnknown)
        const poster: PosterData = { frame: cfg.frameHex, bg: cfg.bgHex, name: cfg.name || 'Dein Name', element: chart.element, animal: chart.animal, pillars: chart.pillars }
        // place/date/time + the canonical birthTimeUnknown flag are carried so the
        // planned calculation API can dock without data loss (REQ-004 AK-1).
        const personalization = {
          date: cfg.date, time: bt.time, timeDisplay: bt.timeDisplay, place: cfg.place, name: cfg.name || '',
          birthTimeUnknown: bt.birthTimeUnknown, unknownTime: bt.unknownTime,
          timeFallbackUsed: bt.timeFallbackUsed, fallbackReason: bt.fallbackReason,
          frame: cfg.frameName, bg: cfg.bgName, size: size.label,
        }
        addLine({
          title: prod.title, price: prod.price + size.delta, qty: 1, poster,
          meta: `${cfg.frameName} · ${cfg.bgName} · ${size.label}`, personalization,
          productId: posterProductId(prod.id),
          variantId: buildVariantId({ size: size.id, frame: cfg.frameHex }),
        })
        showToast('Zum Warenkorb hinzugefügt')
      },
      addBundle: (b) => {
        addLine({ title: b.title, price: b.price, qty: 1, poster: b.p1, meta: '3-teiliges Set · Vorteilspreis', productId: bundleProductId(b.id), variantId: '' })
        showToast('Set zum Warenkorb hinzugefügt')
      },
      addAddon: (a) => addLine({ title: a.title, price: a.price, qty: 1, poster: null, meta: a.note, productId: addonProductId(a.id), variantId: '' }),
      addItem: (item) => addLine(item),
      // Decrementing below 1 removes the line (so the − button empties the item).
      setQty: (key, d) => setCart((s) => s.flatMap((i) => {
        if (i.key !== key) return [i]
        const q = i.qty + d
        return q < 1 ? [] : [{ ...i, qty: q }]
      })),
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
  }, [cart, cartOpen, cfg, openFaqId, newsletterDone, newsletterEmail, articleId, toast, region])

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShopStore(): ShopValue {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShopStore must be used inside ShopStoreProvider')
  return ctx
}
