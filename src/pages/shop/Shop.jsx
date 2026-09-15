import { Link } from 'react-router-dom'
import PageHero from '@/components/common/PageHero'
import ProductSpotlight from '@/components/product/ProductSpotlight'
import Reveal from '@/components/common/Reveal'
import { useShop } from '@/context/shop-context'
import { ingredients as fallbackIngredients, ritualGuideLink } from '@/data'

export default function Shop() {
  const { product } = useShop()
  // The catalog carries its own ingredient list; the bundled one stands in
  // until it arrives.
  const ingredients = product.ingredients?.length ? product.ingredients : fallbackIngredients

  return (
    <main className="page">
      <PageHero
        eyebrow="The Shop"
        title="One oil. A whole ritual."
        lead="Small-batch, cold-infused botanicals — formulated to treat shedding at its source, not the surface."
      />

      <ProductSpotlight />

      <section className="section shop-ingredients" id="ingredients">
        <div className="container">
          <div className="section-head">
            <Reveal as="p" className="eyebrow">What's Inside</Reveal>
            <Reveal as="h2" delay={0.05}>Four botanicals, zero fillers.</Reveal>
          </div>
          <div className="ingredient-grid">
            {ingredients.map((ing, i) => (
              <Reveal className="ingredient-card" key={ing.name} delay={i * 0.08}>
                <p className="eyebrow">{ing.role}</p>
                <h3>{ing.name}</h3>
                <p>{ing.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section shop-ritual">
        <div className="container ritual-banner">
          <Reveal>
            <p className="eyebrow">New to oiling?</p>
            <h2>Learn the 5-minute Ayurvedic scalp massage.</h2>
            <p className="ritual-banner__lead">
              The ritual is half the formula. Master Siro Abhyanga and help every
              drop work deeper.
            </p>
            <Link to={ritualGuideLink} className="btn btn--ghost">
              <span>Read the Ritual Guide</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
