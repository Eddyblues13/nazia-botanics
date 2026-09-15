import { useEffect } from 'react'

const SITE = 'Nazia Botanics'
const ORIGIN = 'https://naziabotanics.com'

/** Creates the tag on first use, so index.html only has to carry the defaults. */
function setMeta(selector, attr, value) {
  if (!value) return
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [, key, name] = selector.match(/\[(property|name)="([^"]+)"\]/) ?? []
    if (!key) return
    el.setAttribute(key, name)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

function setCanonical(path) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', `${ORIGIN}${path}`)
}

/**
 * Per-route title, description and canonical.
 *
 * Link-preview scrapers (WhatsApp, Facebook) never run this — they read the
 * static index.html and stop — so the tags there stay the source of truth for
 * shared links. This is for Google, which does execute the page, and for the
 * browser tab and history, where a per-page title is what people actually see.
 *
 * `title` is the page's own name; the site name is appended here so no caller
 * has to remember it. Pass `null` to leave the document title alone.
 */
export function useSeo({ title, description, path, noindex = false } = {}) {
  useEffect(() => {
    const full = title ? `${title} — ${SITE}` : SITE
    document.title = full

    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', full)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[name="twitter:title"]', 'content', full)
    setMeta('meta[name="twitter:description"]', 'content', description)

    if (path) {
      setMeta('meta[property="og:url"]', 'content', `${ORIGIN}${path}`)
      setCanonical(path)
    }

    // Cart, checkout and order pages are per-visitor and worth keeping out of
    // the index even though robots.txt already asks for that.
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large')
  }, [title, description, path, noindex])
}
