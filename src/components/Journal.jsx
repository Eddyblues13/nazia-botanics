import { useRef } from 'react'
import { motion } from 'framer-motion'
import Reveal from './Reveal'
import { articles } from '../data'

export default function Journal() {
  const trackRef = useRef(null)

  const slide = (dir) => {
    const el = trackRef.current
    if (!el) return
    const amount = el.querySelector('.j-card')?.offsetWidth || 320
    el.scrollBy({ left: dir * (amount + 24), behavior: 'smooth' })
  }

  return (
    <section className="section journal" id="journal">
      <div className="container">
        <div className="journal__head">
          <div>
            <Reveal as="p" className="eyebrow">From the Journal</Reveal>
            <Reveal as="h2" delay={0.05} className="journal__title">
              Wisdom, history &amp; the science.
            </Reveal>
          </div>
          <div className="journal__nav">
            <button aria-label="Previous" onClick={() => slide(-1)} className="j-arrow">‹</button>
            <button aria-label="Next" onClick={() => slide(1)} className="j-arrow">›</button>
          </div>
        </div>

        <div className="journal__track" ref={trackRef}>
          {articles.map((a, i) => (
            <motion.article
              key={a.id}
              className={`j-card j-card--${a.tone}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="j-card__image">
                <span className="j-card__tag">{a.tag}</span>
                <span className="j-card__leaf" aria-hidden="true">❀</span>
              </div>
              <div className="j-card__body">
                <h3>{a.title}</h3>
                <p>{a.excerpt}</p>
                <div className="j-card__foot">
                  <span>{a.minutes} min read</span>
                  <a href={`#${a.id}`} className="link-arrow">Read →</a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <Reveal className="journal__more" delay={0.1}>
          <a href="#journal" className="btn btn--ghost"><span>Read More Wisdom</span></a>
        </Reveal>
      </div>
    </section>
  )
}
