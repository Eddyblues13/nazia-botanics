import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchArticles } from '@/lib/api'
import { articles as fallbackArticles } from '@/data'
import { JournalContext } from './journal-context'

/**
 * Journal cards, fetched once and shared by the homepage carousel and the
 * journal index. Article bodies are not included here — the article page
 * fetches the one it is showing.
 *
 * If the API cannot be reached the bundled articles are used, so the journal
 * is never an empty page.
 */
export function JournalProvider({ children }) {
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  const reload = useCallback(() => {
    setStatus('loading')
    setError(null)
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    fetchArticles(controller.signal)
      .then((payload) => {
        if (!active) return
        setArticles(payload?.data ?? [])
        setStatus('ready')
        setError(null)
      })
      .catch((err) => {
        if (!active || err?.name === 'AbortError') return
        setError(err.message)
        setStatus('error')
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [attempt])

  const value = useMemo(() => {
    const live = articles.length ? articles : fallbackArticles

    return {
      articles: live,
      isFallback: articles.length === 0,
      status,
      error,
      loading: status === 'loading',
      reload,
      getArticle: (id) => live.find((a) => a.id === id) ?? null,
    }
  }, [articles, status, error, reload])

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
}
