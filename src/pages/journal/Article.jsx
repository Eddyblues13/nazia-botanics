import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { articles } from '@/data'

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

export default function Article() {
  const { id } = useParams()
  const article = articles.find((a) => a.id === id)

  if (!article) return <Navigate to="/journal" replace />

  const next = article.next ? articles.find((a) => a.id === article.next.id) : null

  return (
    <main className="page">
      <motion.article
        key={article.id}
        className="article-page"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container article-page__inner">
          <Link to="/journal" className="article-page__back">← Back to the Journal</Link>

          <header className="article-page__head">
            <span className="j-card__tag">{article.tag}</span>
            <h1>{article.title}</h1>
            <span className="article-page__meta">{article.minutes} min read</span>
          </header>

          <div className="article-page__body">
            {article.body.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>

          <Link to="/shop" className="btn article-page__cta">
            <span>{article.cta}</span>
          </Link>

          {next && (
            <footer className="article-page__next">
              <p className="eyebrow">Enjoyed this?</p>
              <p>{article.next.teaser}</p>
              <Link className="link-arrow" to={`/journal/${next.id}`}>
                {next.title} →
              </Link>
            </footer>
          )}
        </div>
      </motion.article>
    </main>
  )
}
