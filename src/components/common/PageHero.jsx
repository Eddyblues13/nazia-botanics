import { motion } from 'framer-motion'

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function PageHero({ eyebrow, title, lead, children }) {
  return (
    <section className="page-hero">
      <div className="container page-hero__inner">
        {eyebrow && (
          <motion.p className="eyebrow" variants={fade} initial="hidden" animate="show" custom={0}>
            {eyebrow}
          </motion.p>
        )}
        <motion.h1 className="page-hero__title" variants={fade} initial="hidden" animate="show" custom={1}>
          {title}
        </motion.h1>
        {lead && (
          <motion.p className="page-hero__lead" variants={fade} initial="hidden" animate="show" custom={2}>
            {lead}
          </motion.p>
        )}
        {children && (
          <motion.div variants={fade} initial="hidden" animate="show" custom={3}>
            {children}
          </motion.div>
        )}
      </div>
    </section>
  )
}
