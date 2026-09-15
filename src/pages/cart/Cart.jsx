import { Link } from 'react-router-dom'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'
import { useCart } from '@/context/cart-context'
import { useShop } from '@/context/shop-context'
import ProductVisual from '@/components/product/ProductVisual'
import { formatNaira } from '@/lib/format'

export default function Cart() {
  const { cart, subtotal, isEmpty, setQty, removeLine } = useCart()
  const { getProduct, product } = useShop()

  // Lines saved before a photo was uploaded — or before lines carried one at
  // all — still get a thumbnail by looking the product up in the live catalog.
  const imageFor = (line) =>
    line.image ?? getProduct(line.productId)?.image ?? (line.productId === product.id ? product.image : null)

  return (
    <main className="page">
      <PageHero
        eyebrow="Your Cart"
        title="Your ritual, ready when you are."
        lead="Delivery is arranged after checkout — we confirm every order personally."
      />

      <section className="section">
        <div className="container">
          {isEmpty ? (
            <Reveal className="cart-empty">
              <h3>Your cart is empty.</h3>
              <p>One oil, two sizes, a whole ritual waiting.</p>
              <Link to="/shop" className="btn"><span>Visit the shop</span></Link>
            </Reveal>
          ) : (
            <div className="cart-layout">
              <Reveal className="cart-lines">
                {cart.map((line) => (
                  <article className="cart-line" key={line.key}>
                    <div className="cart-line__thumb">
                      <ProductVisual
                        product={{ image: imageFor(line), name: line.name }}
                        sizes="96px"
                        width={192}
                        fallback="mark"
                      />
                    </div>

                    <div className="cart-line__info">
                      <h3>{line.name}</h3>
                      <p className="cart-line__size">{line.size}</p>
                      <p className="cart-line__unit">{formatNaira(line.price)} each</p>
                    </div>

                    <div className="cart-line__qty">
                      <button
                        aria-label={`Reduce ${line.size} quantity`}
                        onClick={() => setQty(line.key, line.qty - 1)}
                      >
                        −
                      </button>
                      <span aria-live="polite">{line.qty}</span>
                      <button
                        aria-label={`Increase ${line.size} quantity`}
                        onClick={() => setQty(line.key, line.qty + 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-line__total">
                      <strong>{formatNaira(line.price * line.qty)}</strong>
                      <button className="cart-line__remove" onClick={() => removeLine(line.key)}>
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </Reveal>

              <Reveal className="cart-summary" delay={0.1}>
                <h3>Summary</h3>
                <div className="cart-summary__row">
                  <span>Subtotal</span>
                  <strong>{formatNaira(subtotal)}</strong>
                </div>
                <p className="cart-summary__note">
                  Delivery is quoted when we confirm your order, so you always know
                  the total before anything ships.
                </p>
                <Link to="/checkout" className="btn btn--terracotta">
                  <span>Proceed to checkout</span>
                </Link>
                <Link to="/shop" className="link-arrow cart-summary__back">
                  Continue shopping →
                </Link>
              </Reveal>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
