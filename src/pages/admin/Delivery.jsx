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
  state: '',
  fee: '',
  delivery_period: '',
  is_active: true,
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
      state: zone.state,
      fee: String(zone.fee),
      delivery_period: zone.delivery_period,
      is_active: zone.is_active,
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
    const body = { ...form, fee: Number(form.fee || 0) }

    try {
      if (editing) {
        await updateDeliveryZone(editing.id, body)
        toast.success(`${form.state} updated.`)
      } else {
        await createDeliveryZone(body)
        toast.success(`${form.state} added.`)
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
    if (!window.confirm(`Remove ${zone.state}? Customers there will no longer be able to order.`)) {
      return
    }

    try {
      await deleteDeliveryZone(zone.id)
      toast.success(`${zone.state} removed.`)
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
        <TableWrap head={['State', 'Delivery fee', 'Arrives in', 'Status', '']}>
          {zones.map((zone) => (
            <tr key={zone.id}>
              <td>{zone.state}</td>
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
          Only active states appear at checkout, and the fee set here is what the customer
          is charged. A state that is off is one nobody can order from.
        </p>

        <form className="ad-form" onSubmit={save}>
          <div className="ad-row">
            <Field label="State" error={fieldErrors.state}>
              <input
                type="text"
                required
                value={form.state}
                disabled={isSaving}
                onChange={(e) => set('state', e.target.value)}
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
              {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Add state'}
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
