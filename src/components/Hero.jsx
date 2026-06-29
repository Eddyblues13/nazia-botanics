import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'

// 3D canvas is heavy — load it lazily so first paint stays instant.
const BottleScene = lazy(() => import('../three/BottleScene'))

const fade = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__blob hero__blob--1" aria-hidden="true" />
      <div className="hero__blob hero__blob--2" aria-hidden="true" />

      <div className="hero__grid container">
        <div className="hero__copy">
          <motion.p className="eyebrow" variants={fade} initial="hidden" animate="show" custom={0}>
            100% Botanical · Ashwagandha Infused
          </motion.p>

          <motion.h1 className="hero__title" variants={fade} initial="hidden" animate="show" custom={1}>
            Nourish Your Roots,
            <span className="hero__script">Calm Your Mind.</span>
          </motion.h1>

          <motion.p className="hero__sub" variants={fade} initial="hidden" animate="show" custom={2}>
            Ancient Ayurvedic wisdom meets modern hair science — a 100% botanical
            growth oil infused with Ashwagandha to treat shedding at its source.
          </motion.p>

          <motion.div className="hero__cta" variants={fade} initial="hidden" animate="show" custom={3}>
            <a href="#shop" className="btn">
              <span>Shop the Ritual</span>
            </a>
            <a href="#story" className="link-arrow">
              Our Story →
            </a>
          </motion.div>

          <motion.ul className="hero__trust" variants={fade} initial="hidden" animate="show" custom={4}>
            <li>Cruelty-free</li>
            <li>Cold-infused</li>
            <li>Small batch</li>
          </motion.ul>
        </div>

        <div className="hero__stage">
          <Suspense fallback={<div className="hero__stage-fallback" aria-hidden="true" />}>
            <BottleScene />
          </Suspense>
          <p className="hero__hint">Drag your cursor to turn the bottle</p>
        </div>
      </div>

      <a href="#shop" className="hero__scroll" aria-label="Scroll to shop">
        <span />
      </a>
    </section>
  )
}
