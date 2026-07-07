import { motion } from 'framer-motion'
import Reveal from './Reveal'
import { reviews } from '../data'

function Stars({ rating }) {
  return (
    <span className="review-card__stars" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function Reviews() {
  const average = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <section className="section reviews" id="reviews">
      <div className="container">
        <div className="reviews__head">
          <Reveal as="p" className="eyebrow">Kind Words</Reveal>
          <Reveal as="h2" delay={0.05} className="reviews__title">
            Loved by the community.
          </Reveal>
          <Reveal as="p" delay={0.1} className="reviews__avg">
            ★ {average} average from {reviews.length} rituals
          </Reveal>
        </div>

        <div className="reviews__track">
          {reviews.map((r, i) => (
            <motion.blockquote
              key={r.name}
              className="review-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Stars rating={r.rating} />
              <p className="review-card__text">“{r.text}”</p>
              <footer className="review-card__who">
                {r.name} · {r.location}
                <span className="review-card__verified">✓ Verified purchase</span>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
