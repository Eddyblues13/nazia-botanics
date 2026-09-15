import { useCallback } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchArticle } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useJournal } from '@/context/journal-context'
import { optimizedUrl, srcSetFor } from '@/lib/cloudinary'
import { useSeo } from '@/hooks/useSeo'

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
  const { getArticle, isFallback } = useJournal()

  const fetcher = useCallback((signal) => fetchArticle(id, signal), [id])
  const { data, status, error, reload } = useAsyncData(fetcher)

  // The bundled copy carries its body already, so an unreachable API still
  // renders the article rather than an error.
  const article = data?.data ?? getArticle(id)

  // Each article carries its own title and excerpt into search results.
  useSeo({
    title: article?.title ?? 'The Journal',
    description: article?.excerpt ?? undefined,
    path: `/journal/${id}`,
  })

  if (status === 'error' && !article) {
    // A missing article is a wrong URL; anything else is worth retrying.
    if (error?.includes('404') || isFallback) return <Navigate to="/journal" replace />

    return (
      <main className="page">
        <div className="container article-page__inner">
          <p className="form-card__hint">{error}</p>
          <button className="btn btn--ghost" onClick={reload}>
            <span>Try again</span>
          </button>
        </div>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="page">
        <div className="container article-page__inner">
          <p className="form-card__hint">Opening the journal…</p>
        </div>
      </main>
    )
  }

  const next = article.next ? getArticle(article.next.id) : null

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

          {article.image && (
            <figure className="article-page__figure">
              <img
                src={optimizedUrl(article.image, { width: 1200 })}
                srcSet={srcSetFor(article.image)}
                sizes="(min-width: 900px) 760px, 90vw"
                alt={article.title}
                decoding="async"
              />
            </figure>
          )}

          <div className="article-page__body">
            {(article.body ?? []).map((block, i) => (
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
