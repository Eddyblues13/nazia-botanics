import { Link } from 'react-router-dom'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'
import { pillars } from '@/data'

export default function OurStory() {
  return (
    <main className="page">
      <PageHero
        eyebrow="My Story"
        title="Rooted in care, grown from calm."
      />

      <section className="section story">
        <div className="container story__prose">
          <Reveal as="p">
            For years, my hair was a constant source of frustration — brittle,
            dry, and stuck at a single length. After endless cycles of 'miracle'
            products and quick fixes, I realized I needed to stop treating the
            symptoms and start tending to the roots.
          </Reveal>
          <Reveal as="p" delay={0.05}>
            I decided to create the formula myself. By stripping away harsh
            chemicals and embracing powerful, time-tested botanicals like
            Ashwagandha and Rosemary, I unlocked a 5,000-year-old tradition of
            holistic healing. What began as a personal mission to restore my own
            hair has grown into NAZIA — a brand dedicated to helping you reclaim
            your confidence.
          </Reveal>
          <Reveal as="p" delay={0.1}>
            We don't just sell hair oil; we provide thoughtful, handmade,
            plant-powered nourishment designed to make your hair thrive. At
            NAZIA, we believe that true confidence is the most natural thing you
            can wear.
          </Reveal>
        </div>
      </section>

      <section className="section why">
        <div className="container why__grid">
          <div className="why__intro">
            <Reveal as="p" className="eyebrow">What We Believe</Reveal>
            <Reveal as="h2" delay={0.05} className="why__title">
              Beyond the Bottle:
              <br />a Holistic Approach.
            </Reveal>
            <Reveal as="p" delay={0.1} className="why__lead">
              We believe hair growth starts with a calm nervous system. That's
              why we use adaptogens like Ashwagandha to treat the stress that
              causes shedding — at the source, not the surface.
            </Reveal>
            <Reveal delay={0.15}>
              <Link to="/journal" className="link-arrow">Read the science →</Link>
            </Reveal>
          </div>

          <div className="why__pillars">
            {pillars.map((p, i) => (
              <Reveal className="pillar" key={p.n} delay={i * 0.1}>
                <span className="pillar__n">{p.n}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section story__cta">
        <div className="container ritual-banner">
          <Reveal>
            <p className="eyebrow">Join Us</p>
            <h2>Begin your own ritual.</h2>
            <p className="ritual-banner__lead">
              Every bottle is blended in small batches and shipped with the
              5-minute ritual guide.
            </p>
            <div className="story__cta-row">
              <Link to="/shop" className="btn"><span>Shop the Ritual</span></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
