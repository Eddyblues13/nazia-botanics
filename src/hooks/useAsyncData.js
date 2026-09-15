import { useCallback, useEffect, useState } from 'react'

/**
 * Small fetch-and-track helper.
 *
 * `fetcher` must be wrapped in useCallback by the caller — its identity is the
 * dependency, so changing a filter re-runs the request. Existing rows stay on
 * screen while a refetch is in flight rather than flashing a spinner.
 */
export function useAsyncData(fetcher) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
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

    fetcher(controller.signal)
      .then((payload) => {
        if (!active) return
        setData(payload)
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
  }, [fetcher, attempt])

  return { data, status, error, reload, setData }
}
