import { motion } from 'framer-motion'

// Fade + rise on scroll into view. `as` lets it wrap any element.
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  as = 'div',
  className,
  ...rest
}) {
  const MotionTag = motion[as] || motion.div
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
