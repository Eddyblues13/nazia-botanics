import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createArticle,
  fetchAdminArticle,
  fetchAdminArticles,
  updateArticle,
} from '@/lib/adminApi'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useToast } from '@/components/admin/toast-context'
import ImageUploader from '@/components/admin/ImageUploader'
import { ErrorState, Field, Panel, Spinner } from '@/components/admin/ui'

const BLANK = {
  title: '',
  tag: '',
  excerpt: '',
  tone: 'sage',
  cta: '',
  body: [{ type: 'p', text: '' }],
  next_id: '',
  next_teaser: '',
  image: '',
  is_published: true,
}

const TONES = ['sage', 'terracotta', 'clay']

const BLOCK_TYPES = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h', label: 'Sub-heading' },
  { value: 'ul', label: 'Bulleted list' },
  { value: 'ol', label: 'Numbered list' },
]

const isList = (type) => type === 'ul' || type === 'ol'

/** Maps an API record onto the shape the form edits. */
const toForm = (a) =>
  a
    ? {
        title: a.title,
        tag: a.tag,
        excerpt: a.excerpt,
        tone: a.tone,
        cta: a.cta ?? '',
        body: a.body?.length ? a.body : BLANK.body,
        next_id: a.next_up?.id ?? '',
        next_teaser: a.next_up?.teaser ?? '',
        image: a.image ?? '',
        is_published: a.is_published,
      }
    : BLANK

/**
 * Loads the record first and only then mounts the form, so the form's state can
 * be initialised from it rather than synchronised into it afterwards.
 */
export default function ArticleForm() {
  const { slug } = useParams()
  const isEdit = Boolean(slug)

  const fetcher = useCallback(
    (signal) => (isEdit ? fetchAdminArticle(slug, signal) : Promise.resolve(null)),
    [isEdit, slug]
  )
  const { data, status, error, reload } = useAsyncData(fetcher)

  if (isEdit && status === 'loading' && !data) return <Spinner label="Loading article" />
  if (isEdit && status === 'error') return <ErrorState message={error} onRetry={reload} />

  return <ArticleFields key={slug ?? 'new'} slug={slug} record={data?.data} />
}

function ArticleFields({ slug, record }) {
  const isEdit = Boolean(slug)
  const navigate = useNavigate()
  const toast = useToast()

  // The "read next" picker needs every other article to choose from.
  const listFetcher = useCallback(
    (signal) => fetchAdminArticles({ per_page: 100 }, signal),
    []
  )
  const { data: listData } = useAsyncData(listFetcher)
  const others = (listData?.data ?? []).filter((a) => a.slug !== slug)

  const [form, setForm] = useState(() => toForm(record))
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const setBlock = (index, patch) =>
    set(
      'body',
      form.body.map((block, i) => (i === index ? { ...block, ...patch } : block))
    )

  /** Switching between a text block and a list swaps which payload it carries. */
  const changeType = (index, type) => {
    const block = form.body[index]
    if (isList(type)) {
      setBlock(index, {
        type,
        items: block.items ?? (block.text ? [block.text] : ['']),
        text: undefined,
      })
    } else {
      setBlock(index, {
        type,
        text: block.text ?? block.items?.join(' ') ?? '',
        items: undefined,
      })
    }
  }

  const moveBlock = (index, delta) => {
    const target = index + delta
    if (target < 0 || target >= form.body.length) return
    const next = [...form.body]
    ;[next[index], next[target]] = [next[target], next[index]]
    set('body', next)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    setFieldErrors({})

    const payload = {
      title: form.title,
      tag: form.tag,
      excerpt: form.excerpt,
      tone: form.tone,
      cta: form.cta || null,
      body: form.body.map((block) =>
        isList(block.type)
          ? { type: block.type, items: (block.items ?? []).filter(Boolean) }
          : { type: block.type, text: block.text }
      ),
      next_up: form.next_id ? { id: form.next_id, teaser: form.next_teaser } : null,
      image: form.image || null,
      is_published: form.is_published,
    }

    try {
      if (isEdit) {
        await updateArticle(slug, payload)
        toast.success('Article saved.')
      } else {
        await createArticle(payload)
        toast.success('Article published.')
      }
      navigate('/admin/journal')
    } catch (err) {
      setFieldErrors(err.errors ?? {})
      toast.error(err.message)
      setIsSaving(false)
    }
  }

  return (
    <Panel title={isEdit ? `Edit ${form.title || 'article'}` : 'New article'}>
      <form className="ad-form ad-form--wide" onSubmit={submit}>
        <Field label="Title" error={fieldErrors.title}>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </Field>

        <div className="ad-row">
          <Field label="Tag" hint="The Science, Ritual, Heritage…" error={fieldErrors.tag}>
            <input
              type="text"
              required
              value={form.tag}
              onChange={(e) => set('tag', e.target.value)}
            />
          </Field>

          <Field label="Card tone" error={fieldErrors.tone}>
            <select value={form.tone} onChange={(e) => set('tone', e.target.value)}>
              {TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Excerpt" error={fieldErrors.excerpt}>
          <textarea
            rows={2}
            required
            value={form.excerpt}
            onChange={(e) => set('excerpt', e.target.value)}
          />
        </Field>

        <Field
          label="Call to action"
          hint="The button under the article, e.g. “Shop the Hair and Scalp Oil”."
          error={fieldErrors.cta}
        >
          <input type="text" value={form.cta} onChange={(e) => set('cta', e.target.value)} />
        </Field>

        {/* ---- Body blocks ---- */}
        <div className="ad-field">
          <span>Body</span>
          <p className="ad-field__hint">
            Blocks render in this order. Reading time is estimated from the words here.
          </p>
          {fieldErrors.body && <span className="ad-field__error">{fieldErrors.body}</span>}

          <div className="ad-repeat">
            {form.body.map((block, i) => (
              <div className="ad-repeat__item" key={i}>
                <div className="ad-repeat__head">
                  <span>Block {i + 1}</span>
                  <div className="ad-repeat__move">
                    <button
                      type="button"
                      className="ad-btn ad-btn--ghost ad-btn--sm"
                      disabled={i === 0}
                      onClick={() => moveBlock(i, -1)}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="ad-btn ad-btn--ghost ad-btn--sm"
                      disabled={i === form.body.length - 1}
                      onClick={() => moveBlock(i, 1)}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    {form.body.length > 1 && (
                      <button
                        type="button"
                        className="ad-btn ad-btn--danger ad-btn--sm"
                        onClick={() => set('body', form.body.filter((_, n) => n !== i))}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <Field label="Type">
                  <select value={block.type} onChange={(e) => changeType(i, e.target.value)}>
                    {BLOCK_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </Field>

                {isList(block.type) ? (
                  <Field
                    label="List items"
                    hint="One item per line."
                    error={fieldErrors[`body.${i}.items`]}
                  >
                    <textarea
                      rows={4}
                      value={(block.items ?? []).join('\n')}
                      onChange={(e) => setBlock(i, { items: e.target.value.split('\n') })}
                    />
                  </Field>
                ) : (
                  <Field
                    label={block.type === 'h' ? 'Heading' : 'Paragraph'}
                    error={fieldErrors[`body.${i}.text`]}
                  >
                    <textarea
                      rows={block.type === 'h' ? 1 : 4}
                      value={block.text ?? ''}
                      onChange={(e) => setBlock(i, { text: e.target.value })}
                    />
                  </Field>
                )}
              </div>
            ))}
          </div>

          <div className="ad-actions">
            <button
              type="button"
              className="ad-btn ad-btn--ghost ad-btn--sm"
              onClick={() => set('body', [...form.body, { type: 'p', text: '' }])}
            >
              Add a block
            </button>
          </div>
        </div>

        {/* ---- Read next ---- */}
        <div className="ad-row">
          <Field label="Read next" error={fieldErrors['next_up.id']}>
            <select value={form.next_id} onChange={(e) => set('next_id', e.target.value)}>
              <option value="">Nothing — this ends the series</option>
              {others.map((article) => (
                <option key={article.slug} value={article.slug}>
                  {article.title}
                </option>
              ))}
            </select>
          </Field>

          {form.next_id && (
            <Field label="Hand-off teaser" error={fieldErrors['next_up.teaser']}>
              <textarea
                rows={3}
                required
                value={form.next_teaser}
                onChange={(e) => set('next_teaser', e.target.value)}
              />
            </Field>
          )}
        </div>

        <ImageUploader
          label="Article image"
          value={form.image}
          onChange={(url) => set('image', url)}
        />

        <label className="ad-check">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => set('is_published', e.target.checked)}
          />
          Published
        </label>

        <div className="ad-actions">
          <button type="submit" className="ad-btn" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create article'}
          </button>
          <button
            type="button"
            className="ad-btn ad-btn--ghost"
            onClick={() => navigate('/admin/journal')}
          >
            Cancel
          </button>
        </div>
      </form>
    </Panel>
  )
}
