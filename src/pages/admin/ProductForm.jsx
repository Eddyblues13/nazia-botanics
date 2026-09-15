import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createProduct, fetchAdminProduct, updateProduct } from '@/lib/adminApi'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useToast } from '@/components/admin/toast-context'
import ImageUploader from '@/components/admin/ImageUploader'
import { ErrorState, Field, Panel, Spinner } from '@/components/admin/ui'

const BLANK = {
  name: '',
  tagline: '',
  description: '',
  sizes: [{ label: '2 oz', price: 15000, cost: '' }],
  highlights: [],
  ingredients: [],
  image: '',
  is_active: true,
}

const HIGHLIGHT_ICONS = [
  { value: 'sprout', label: 'Sprout (growth)' },
  { value: 'strand', label: 'Strand (strength)' },
  { value: 'calm', label: 'Calm (stress)' },
]

/** Maps an API record onto the shape the form edits. */
const toForm = (p) =>
  p
    ? {
        name: p.name,
        tagline: p.tagline,
        description: p.description ?? '',
        sizes: p.sizes,
        highlights: p.highlights ?? [],
        ingredients: p.ingredients ?? [],
        image: p.image ?? '',
        is_active: p.is_active,
      }
    : BLANK

/**
 * Loads the record first and only then mounts the form, so the form's state can
 * be initialised from it rather than synchronised into it afterwards.
 */
/**
 * Shows the margin a size earns as soon as both figures are present, so the
 * person setting a price sees the consequence while they type.
 */
function marginHint(size) {
  const price = Number(size.price)
  const cost = size.cost === '' || size.cost === null || size.cost === undefined ? null : Number(size.cost)

  if (cost === null || !Number.isFinite(price) || !Number.isFinite(cost)) {
    return 'Leave cost blank if you do not track it — profit reporting will skip this size.'
  }
  if (price <= 0) return 'Set a price to see the margin.'
  if (cost > price) return `Sells below cost — losing ₦${(cost - price).toLocaleString()} per unit.`

  const profit = price - cost
  return `Profit ₦${profit.toLocaleString()} per unit · ${((profit / price) * 100).toFixed(0)}% margin`
}

export default function ProductForm() {
  const { slug } = useParams()
  const isEdit = Boolean(slug)

  const fetcher = useCallback(
    (signal) => (isEdit ? fetchAdminProduct(slug, signal) : Promise.resolve(null)),
    [isEdit, slug]
  )
  const { data, status, error, reload } = useAsyncData(fetcher)

  if (isEdit && status === 'loading' && !data) return <Spinner label="Loading product" />
  if (isEdit && status === 'error') return <ErrorState message={error} onRetry={reload} />

  return <ProductFields key={slug ?? 'new'} slug={slug} record={data?.data} />
}

function ProductFields({ slug, record }) {
  const isEdit = Boolean(slug)
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState(() => toForm(record))
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const setItem = (key, index, patch) =>
    set(
      key,
      form[key].map((item, i) => (i === index ? { ...item, ...patch } : item))
    )

  const addItem = (key, blank) => set(key, [...form[key], blank])
  const removeItem = (key, index) => set(key, form[key].filter((_, i) => i !== index))

  const submit = async (e) => {
    e.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    setFieldErrors({})

    // Prices come off number inputs as strings; the API wants whole integers.
    const payload = {
      ...form,
      sizes: form.sizes.map((s) => ({
        label: s.label,
        price: Number(s.price),
        // Blank stays null rather than becoming 0, which would read as
        // "free to make" and quietly overstate profit.
        cost: s.cost === '' || s.cost === null || s.cost === undefined ? null : Number(s.cost),
      })),
    }

    try {
      if (isEdit) {
        await updateProduct(slug, payload)
        toast.success('Product saved.')
      } else {
        await createProduct(payload)
        toast.success('Product created.')
      }
      navigate('/admin/products')
    } catch (err) {
      setFieldErrors(err.errors ?? {})
      toast.error(err.message)
      setIsSaving(false)
    }
  }

  return (
    <Panel title={isEdit ? `Edit ${form.name || 'product'}` : 'New product'}>
      <form className="ad-form ad-form--wide" onSubmit={submit}>
        <div className="ad-row">
          <Field label="Name" error={fieldErrors.name}>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </Field>

          <Field label="Tagline" error={fieldErrors.tagline}>
            <input
              type="text"
              required
              placeholder="Scalp and Hair Oil"
              value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Description" error={fieldErrors.description}>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>

        {/* ---- Sizes ---- */}
        <div className="ad-field">
          <span>Sizes &amp; prices</span>
          <p className="ad-field__hint">
            Whole naira, no kobo. The lowest price becomes the &ldquo;from&rdquo; price on the
            storefront.
          </p>
          {fieldErrors.sizes && <span className="ad-field__error">{fieldErrors.sizes}</span>}

          <div className="ad-repeat">
            {form.sizes.map((size, i) => (
              <div className="ad-repeat__item" key={i}>
                <div className="ad-repeat__head">
                  <span>Size {i + 1}</span>
                  {form.sizes.length > 1 && (
                    <button
                      type="button"
                      className="ad-btn ad-btn--danger ad-btn--sm"
                      onClick={() => removeItem('sizes', i)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="ad-row">
                  <Field label="Label" error={fieldErrors[`sizes.${i}.label`]}>
                    <input
                      type="text"
                      required
                      placeholder="4 oz"
                      value={size.label}
                      onChange={(e) => setItem('sizes', i, { label: e.target.value })}
                    />
                  </Field>
                  <Field label="Price (₦)" error={fieldErrors[`sizes.${i}.price`]}>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={size.price}
                      onChange={(e) => setItem('sizes', i, { price: e.target.value })}
                    />
                  </Field>
                  <Field label="Cost to make (₦)" error={fieldErrors[`sizes.${i}.cost`]}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Optional"
                      value={size.cost ?? ''}
                      onChange={(e) => setItem('sizes', i, { cost: e.target.value })}
                    />
                  </Field>
                </div>
                <p className="ad-field__hint">
                  {marginHint(size)}
                </p>
              </div>
            ))}
          </div>

          <div className="ad-actions">
            <button
              type="button"
              className="ad-btn ad-btn--ghost ad-btn--sm"
              onClick={() => addItem('sizes', { label: '', price: 0, cost: '' })}
            >
              Add a size
            </button>
          </div>
        </div>

        {/* ---- Highlights ---- */}
        <div className="ad-field">
          <span>Spotlight highlights</span>
          <p className="ad-field__hint">The three badges beside the bottle on the shop page.</p>

          <div className="ad-repeat">
            {form.highlights.map((highlight, i) => (
              <div className="ad-repeat__item" key={i}>
                <div className="ad-repeat__head">
                  <span>Highlight {i + 1}</span>
                  <button
                    type="button"
                    className="ad-btn ad-btn--danger ad-btn--sm"
                    onClick={() => removeItem('highlights', i)}
                  >
                    Remove
                  </button>
                </div>
                <div className="ad-row">
                  <Field label="Icon">
                    <select
                      value={highlight.icon}
                      onChange={(e) => setItem('highlights', i, { icon: e.target.value })}
                    >
                      {HIGHLIGHT_ICONS.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Title" error={fieldErrors[`highlights.${i}.title`]}>
                    <input
                      type="text"
                      required
                      placeholder="Stimulates Growth"
                      value={highlight.title}
                      onChange={(e) => setItem('highlights', i, { title: e.target.value })}
                    />
                  </Field>
                  <Field label="Detail" error={fieldErrors[`highlights.${i}.detail`]}>
                    <input
                      type="text"
                      required
                      placeholder="Rosemary"
                      value={highlight.detail}
                      onChange={(e) => setItem('highlights', i, { detail: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>

          <div className="ad-actions">
            <button
              type="button"
              className="ad-btn ad-btn--ghost ad-btn--sm"
              onClick={() =>
                addItem('highlights', { icon: 'sprout', title: '', detail: '' })
              }
            >
              Add a highlight
            </button>
          </div>
        </div>

        {/* ---- Ingredients ---- */}
        <div className="ad-field">
          <span>Ingredients</span>
          <p className="ad-field__hint">Shown in the &ldquo;What&rsquo;s Inside&rdquo; grid.</p>

          <div className="ad-repeat">
            {form.ingredients.map((ingredient, i) => (
              <div className="ad-repeat__item" key={i}>
                <div className="ad-repeat__head">
                  <span>Ingredient {i + 1}</span>
                  <button
                    type="button"
                    className="ad-btn ad-btn--danger ad-btn--sm"
                    onClick={() => removeItem('ingredients', i)}
                  >
                    Remove
                  </button>
                </div>
                <div className="ad-row">
                  <Field label="Name" error={fieldErrors[`ingredients.${i}.name`]}>
                    <input
                      type="text"
                      required
                      placeholder="Rosemary"
                      value={ingredient.name}
                      onChange={(e) => setItem('ingredients', i, { name: e.target.value })}
                    />
                  </Field>
                  <Field label="Role" error={fieldErrors[`ingredients.${i}.role`]}>
                    <input
                      type="text"
                      required
                      placeholder="The Stimulator"
                      value={ingredient.role}
                      onChange={(e) => setItem('ingredients', i, { role: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Detail" error={fieldErrors[`ingredients.${i}.detail`]}>
                  <textarea
                    rows={2}
                    required
                    value={ingredient.detail}
                    onChange={(e) => setItem('ingredients', i, { detail: e.target.value })}
                  />
                </Field>
              </div>
            ))}
          </div>

          <div className="ad-actions">
            <button
              type="button"
              className="ad-btn ad-btn--ghost ad-btn--sm"
              onClick={() => addItem('ingredients', { name: '', role: '', detail: '' })}
            >
              Add an ingredient
            </button>
          </div>
        </div>

        <ImageUploader
          label="Product image"
          value={form.image}
          onChange={(url) => set('image', url)}
        />

        <label className="ad-check">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set('is_active', e.target.checked)}
          />
          Live on the storefront
        </label>

        <div className="ad-actions">
          <button type="submit" className="ad-btn" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <button
            type="button"
            className="ad-btn ad-btn--ghost"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </button>
        </div>
      </form>
    </Panel>
  )
}
