import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { articles } from '../data'

function Block({ block }) {
  if (block.type === 'h') return <h3>{block.text}</h3>
  if (block.type === 'ul')
    return (
      <ul>
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    )
  if (block.type === 'ol')
    return (
      <ol>
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    )
  return <p>{block.text}</p>
}

export default function ArticleReader({ article, onClose, onOpen }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const next = article.next ? articles.find((a) => a.id === article.next.id) : null

  return (
    <motion.div
      className="article-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.article
        key={article.id}
        className="article-panel"
        role="dialog"
        aria-modal="true"
        aria-label={article.title}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="article-panel__close" aria-label="Close article" onClick={onClose}>
          ×
        </button>

        <header className="article-panel__head">
          <span className="j-card__tag">{article.tag}</span>
          <h2>{article.title}</h2>
          <span className="article-panel__meta">{article.minutes} min read</span>
        </header>

        <div className="article-panel__body">
          {article.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        <a href="#shop" className="btn article-panel__cta" onClick={onClose}>
          <span>{article.cta}</span>
        </a>

        {next && (
          <footer className="article-panel__next">
            <p className="eyebrow">Enjoyed this?</p>
            <p>{article.next.teaser}</p>
            <button className="link-arrow" onClick={() => onOpen(next.id)}>
              {next.title} →
            </button>
          </footer>
        )}
      </motion.article>
    </motion.div>
  )
}
