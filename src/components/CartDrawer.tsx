import { X, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { useShop, defaultSelection } from './ShopProvider'
import { getProduct, FREE_SHIPPING_THRESHOLD } from '../lib/shop'

const euro = (n: number) => '€ ' + n.toFixed(2).replace('.', ',')

export default function CartDrawer() {
  const { cart, cartOpen, closeCart, subtotal, updateQty, removeItem, addConfiguredProduct } = useShop()

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  // Cross-sell: products recommended by what's already in the cart, minus
  // anything already added. Quick-add the non-personalized ones in one click.
  const cartProductIds = new Set(cart.map((i) => i.productId))
  const recommended = [...new Set(cart.flatMap((i) => getProduct(i.productId)?.crossSell ?? []))]
    .filter((pid) => !cartProductIds.has(pid))
    .map(getProduct)
    .filter((p): p is NonNullable<typeof p> => Boolean(p) && p!.status !== 'coming-soon')
    .slice(0, 2)

  return (
    <>
      <div
        className={`shop-cart-overlay ${cartOpen ? 'open' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside className={`shop-cart-drawer ${cartOpen ? 'open' : ''}`} aria-label="Warenkorb">
        <div className="shop-cart-head">
          <h2>Warenkorb</h2>
          <button type="button" onClick={closeCart} aria-label="Warenkorb schließen">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Free-shipping progress (AOV nudge) */}
        {cart.length > 0 && (
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E0D7C8' }}>
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: '#2C2420', marginBottom: 8, lineHeight: 1.4 }}>
              {remaining > 0 ? (
                <>Dir fehlen nur noch <strong style={{ color: '#A0522D' }}>{euro(remaining)}</strong> bis zum <strong>kostenlosen Versand</strong>!</>
              ) : (
                <><strong style={{ color: '#6B7F5C' }}>Geschafft —</strong> dein Versand ist kostenlos. 🎉</>
              )}
            </p>
            <div className="ship-progress-track">
              <div className="ship-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="shop-cart-body">
          {cart.length === 0 ? (
            <div className="shop-cart-empty">
              <div>四柱</div>
              <p>Dein Warenkorb ist leer.</p>
              <Link to="/shop" onClick={closeCart}>Kollektion entdecken</Link>
            </div>
          ) : (
            cart.map((item) => (
              <div className="shop-cart-item" key={item.id}>
                <div className="shop-cart-thumb">{item.char}</div>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.meta}</p>
                  <div className="shop-cart-qty">
                    <button type="button" onClick={() => updateQty(item.id, -1)}>−</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                  <button type="button" className="shop-cart-remove" onClick={() => removeItem(item.id)}>
                    Entfernen
                  </button>
                </div>
                <strong>{euro(item.price * item.qty)}</strong>
              </div>
            ))
          )}

          {/* Cross-sell: "wird oft zusammen gekauft" */}
          {recommended.length > 0 && (
            <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #E0D7C8' }}>
              <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8A7E72', marginBottom: 12 }}>
                Wird oft zusammen gekauft
              </p>
              {recommended.map((p) => (
                <div key={p.id} className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                  <Link to={`/produkt/${p.id}`} onClick={closeCart} className="overflow-hidden rounded" style={{ width: 48, height: 60, flexShrink: 0, background: p.background }}>
                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500, color: '#2C2420', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12.5, color: '#8A7E72' }}>{p.priceLabel}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`${p.title} hinzufügen`}
                    onClick={() => addConfiguredProduct({ product: p, ...defaultSelection })}
                    className="flex items-center justify-center"
                    style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #A0522D', color: '#A0522D', background: 'transparent', flexShrink: 0, cursor: 'pointer' }}
                  >
                    <Plus size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shop-cart-foot">
          <div>
            <span>Zwischensumme</span>
            <strong>{euro(subtotal)}</strong>
          </div>
          {cart.length > 0 ? (
            <Link to="/checkout" onClick={closeCart}>Zur Kasse</Link>
          ) : (
            <Link to="/shop" onClick={closeCart}>Shop ansehen</Link>
          )}
          <p>Versandkosten werden im Checkout berechnet · kostenlos ab {euro(FREE_SHIPPING_THRESHOLD)}.</p>
        </div>
      </aside>
    </>
  )
}
