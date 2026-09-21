import { useCallback, useState } from 'react'
import {
  createDeliveryZone,
  deleteDeliveryZone,
  fetchDeliveryZonesAdmin,
  updateDeliveryZone,
} from '@/lib/adminApi'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatNaira } from '@/lib/format'
import { useToast } from '@/components/admin/toast-context'
import { Badge, ErrorState, Field, Panel, Spinner, TableWrap } from '@/components/admin/ui'

const BLANK = {
  name: '',
  areas: '',
  fee: '',
  delivery_period: '',
  is_active: true,
  sort_order: '',
}

export default function Delivery() {
  const fetcher = useCallback((signal) => fetchDeliveryZonesAdmin(signal), [])
  const { data, status, error, reload } = useAsyncData(fetcher)

  const toast = useToast()

  // The zone being edited, or null when adding a new one.
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  if (status === 'loading' && !data) return <Spinner label="Loading delivery areas" />
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />

  const zones = data.data
  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const startAdd = () => {
    setEditing(null)
    setForm(BLANK)
    setFieldErrors({})
  }

  const startEdit = (zone) => {
    setEditing(zone)
    setForm({
      name: zone.name,
      // Typed as one comma separated line; stored as a list.
      areas: (zone.areas ?? []).join(', '),
      fee: String(zone.fee),
      delivery_period: zone.delivery_period,
      is_active: zone.is_active,
      sort_order: String(zone.sort_order ?? 0),
    })
    setFieldErrors({})
  }

  const save = async (e) => {
    e.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    setFieldErrors({})

    // Fees are held as a string while typing so the field can be cleared;
    // the API wants a number.
    const body = {
      ...form,
      fee: Number(form.fee || 0),
      sort_order: Number(form.sort_order || 0),
      areas: form.areas
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    }

    try {
      if (editing) {
        await updateDeliveryZone(editing.id, body)
        toast.success(`${form.name} updated.`)
      } else {
        await createDeliveryZone(body)
        toast.success(`${form.name} added.`)
      }
      startAdd()
      reload()
    } catch (err) {
      setFieldErrors(err.errors ?? {})
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const remove = async (zone) => {
    if (!window.confirm(`Remove ${zone.name}? Customers there will no longer be able to order.`)) {
      return
    }

    try {
      await deleteDeliveryZone(zone.id)
      toast.success(`${zone.name} removed.`)
      if (editing?.id === zone.id) startAdd()
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const activeCount = zones.filter((z) => z.is_active).length

  return (
    <>
      <Panel title={`Delivery areas — ${activeCount} of ${zones.length} open`} bodyFlush>
        <TableWrap head={['Zone', 'Areas', 'Delivery fee', 'Arrives in', 'Status', '']}>
          {zones.map((zone) => (
            <tr key={zone.id}>
              <td>{zone.name}</td>
              <td className="ad-field__hint">
                {zone.areas?.length ? zone.areas.join(', ') : '—'}
              </td>
              <td>{formatNaira(zone.fee)}</td>
              <td>{zone.delivery_period}</td>
              <td>
                <Badge status={zone.is_active ? 'active' : 'inactive'} />
              </td>
              <td>
                <div className="ad-table__actions">
                  <button className="ad-btn ad-btn--ghost" onClick={() => startEdit(zone)}>
                    Edit
                  </button>
                  <button className="ad-btn ad-btn--danger" onClick={() => remove(zone)}>
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </TableWrap>
      </Panel>

      <Panel title={editing ? `Edit ${editing.state}` : 'Add a state'}>
        <p className="ad-field__hint">
          Only active zones appear at checkout, and the fee set here is what the customer
          is charged. A zone that is off is one nobody can order from.
        </p>

        <form className="ad-form" onSubmit={save}>
          <div className="ad-row">
            <Field label="Zone name" hint="What the customer sees, e.g. “Island 1”." error={fieldErrors.name}>
              <input
                type="text"
                required
                value={form.name}
                disabled={isSaving}
                onChange={(e) => set('name', e.target.value)}
              />
            </Field>

            <Field label="Delivery fee (₦)" hint="Whole naira. Zero for free delivery." error={fieldErrors.fee}>
              <input
                type="number"
                required
                min="0"
                step="1"
                inputMode="numeric"
                value={form.fee}
                disabled={isSaving}
                onChange={(e) => set('fee', e.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Areas covered"
            hint="Separated by commas — these are shown at checkout so people can find themselves."
            error={fieldErrors.areas}
          >
            <textarea
              rows={2}
              value={form.areas}
              disabled={isSaving}
              placeholder="Lekki Phase 1, Victoria Island, Ikoyi"
              onChange={(e) => set('areas', e.target.value)}
            />
          </Field>

          <Field
            label="Arrives in"
            hint="Shown to the customer, in your words — “1-2 business days”."
            error={fieldErrors.delivery_period}
          >
            <input
              type="text"
              required
              value={form.delivery_period}
              disabled={isSaving}
              onChange={(e) => set('delivery_period', e.target.value)}
            />
          </Field>

          <Field label="Order shown" hint="Lower numbers appear first at checkout." error={fieldErrors.sort_order}>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={form.sort_order}
              disabled={isSaving}
              onChange={(e) => set('sort_order', e.target.value)}
            />
          </Field>

          <label className="ad-check">
            <input
              type="checkbox"
              checked={form.is_active}
              disabled={isSaving}
              onChange={(e) => set('is_active', e.target.checked)}
            />
            <span>Open for orders</span>
          </label>

          <div className="ad-actions">
            <button type="submit" className="ad-btn" disabled={isSaving}>
              {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Add zone'}
            </button>
            {editing && (
              <button type="button" className="ad-btn ad-btn--ghost" onClick={startAdd}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </Panel>
    </>
  )
}
