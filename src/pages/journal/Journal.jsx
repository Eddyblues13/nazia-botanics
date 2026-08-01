import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHero from '@/components/common/PageHero'
import { articles } from '@/data'

export default function Journal() {
  return (
    <main className="page">
      <PageHero
        eyebrow="The Journal"
        title="Wisdom, history & the science."
        lead="Everything we know about calm scalps and thriving strands — from 5,000-year-old rituals to landmark clinical studies."
      />

      <section className="section journal-index">
        <div className="container">
          <div className="journal-grid">
            {articles.map((a, i) => (
              <motion.article
                key={a.id}
                className={`j-card j-card--${a.tone}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: (i % 2) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={`/journal/${a.id}`} className="j-card__link" aria-label={a.title}>
                  <div className="j-card__image">
                    <span className="j-card__tag">{a.tag}</span>
                    <span className="j-card__leaf" aria-hidden="true">❀</span>
                  </div>
                  <div className="j-card__body">
                    <h3>{a.title}</h3>
                    <p>{a.excerpt}</p>
                    <div className="j-card__foot">
                      <span>{a.minutes} min read</span>
                      <span className="link-arrow">Read →</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
