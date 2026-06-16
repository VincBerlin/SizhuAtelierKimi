import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  backgroundOptions,
  frameOptions,
  posterSizes,
  type ProductOption,
  type ShopProduct,
} from '../lib/shop'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  qty: number
  char: string
  meta: string
}

interface ProductSelection {
  product: ShopProduct
  size: ProductOption
  frame: ProductOption
  background: ProductOption
  personName?: string
  birthDate?: string
  birthTime?: string
  birthPlace?: string
  note?: string
}

interface ShopContextValue {
  cart: CartItem[]
  cartCount: number
  subtotal: number
  cartOpen: boolean
  selectedProduct: ShopProduct | null
  openCart: () => void
  closeCart: () => void
  configureProduct: (product: ShopProduct) => void
  closeConfigurator: () => void
  addConfiguredProduct: (selection: ProductSelection) => void
  addItem: (item: CartItem) => void
  updateQty: (id: string, delta: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

const ShopContext = createContext<ShopContextValue | null>(null)

function makeCartItem(selection: ProductSelection): CartItem {
  const framePrice = selection.frame.price ?? 0
  const price = (selection.size.price ?? selection.product.priceFrom) + framePrice
  const metaParts = [
    selection.size.label,
    selection.frame.label,
    selection.background.label,
    selection.personName,
    selection.birthDate,
  ].filter(Boolean)

  return {
    id: `${selection.product.id}:${metaParts.join(':')}`,
    productId: selection.product.id,
    name: selection.product.title,
    price,
    qty: 1,
    char: selection.product.symbol,
    meta: metaParts.join(' · '),
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('sizhu_cart')
      if (stored) setCart(JSON.parse(stored))
    } catch {
      setCart([])
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('sizhu_cart', JSON.stringify(cart))
    } catch {
      // localStorage can be unavailable in private contexts.
    }
  }, [cart])

  useEffect(() => {
    document.body.style.overflow = cartOpen || selectedProduct ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, selectedProduct])

  const value = useMemo<ShopContextValue>(() => {
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

    const addItem = (item: CartItem) => {
      setCart((current) => {
        const existing = current.find((cartItem) => cartItem.id === item.id)
        if (existing) {
          return current.map((cartItem) =>
            cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + item.qty } : cartItem,
          )
        }
        return [...current, item]
      })
      setSelectedProduct(null)
      setCartOpen(true)
    }

    return {
      cart,
      cartCount,
      subtotal,
      cartOpen,
      selectedProduct,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      configureProduct: (product) => setSelectedProduct(product),
      closeConfigurator: () => setSelectedProduct(null),
      addConfiguredProduct: (selection) => addItem(makeCartItem(selection)),
      addItem,
      updateQty: (id, delta) => {
        setCart((current) =>
          current
            .map((item) => item.id === id ? { ...item, qty: item.qty + delta } : item)
            .filter((item) => item.qty > 0),
        )
      },
      removeItem: (id) => setCart((current) => current.filter((item) => item.id !== id)),
      clearCart: () => setCart([]),
    }
  }, [cart, cartOpen, selectedProduct])

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) throw new Error('useShop must be used inside ShopProvider')
  return context
}

export const defaultSelection = {
  size: posterSizes[1],
  frame: frameOptions[0],
  background: backgroundOptions[0],
}
