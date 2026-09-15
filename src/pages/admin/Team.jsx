import { useCallback, useState } from 'react'
import { createTeamMember, deleteTeamMember, fetchTeam, updateTeamMember } from '@/lib/adminApi'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDateTime } from '@/lib/format'
import { useAdminAuth } from '@/context/admin-auth-context'
import { useToast } from '@/components/admin/toast-context'
import { Badge, ErrorState, Field, Panel, Spinner, TableWrap } from '@/components/admin/ui'

const BLANK = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'manager',
  is_active: true,
}

export default function Team() {
  const fetcher = useCallback((signal) => fetchTeam(signal), [])
  const { data, status, error, reload } = useAsyncData(fetcher)

  const { admin: me } = useAdminAuth()
  const toast = useToast()

  // `editing` is the admin being edited, or null when adding someone new.
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  if (status === 'loading' && !data) return <Spinner label="Loading the team" />
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />

  const members = data.data
  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const startAdd = () => {
    setEditing(null)
    setForm(BLANK)
    setFieldErrors({})
  }

  const startEdit = (member) => {
    setEditing(member)
    setForm({ ...BLANK, name: member.name, email: member.email, role: member.role, is_active: member.is_active })
    setFieldErrors({})
  }

  const submit = async (e) => {
    e.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    setFieldErrors({})

    try {
      if (editing) {
        await updateTeamMember(editing.id, form)
        toast.success(`${form.name} updated.`)
      } else {
        await createTeamMember(form)
        toast.success(`${form.name} added to the team.`)
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

  const remove = async (member) => {
    if (!window.confirm(`Remove ${member.name} from the team?`)) return

    try {
      const payload = await deleteTeamMember(member.id)
      toast.success(payload.message)
      if (editing?.id === member.id) startAdd()
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <>
      <Panel title="Team" bodyFlush>
        <TableWrap head={['Name', 'Email', 'Role', 'Last signed in', 'Status', '']}>
          {members.map((member) => (
            <tr key={member.id}>
              <td>
                {member.name}
                {me?.id === member.id && <span className="ad-field__hint"> (you)</span>}
              </td>
              <td>{member.email}</td>
              <td>
                <Badge status={member.role} />
              </td>
              <td>{formatDateTime(member.last_login_at)}</td>
              <td>
                <Badge status={member.is_active ? 'active' : 'inactive'} />
              </td>
              <td>
                <div className="ad-table__actions">
                  <button
                    className="ad-btn ad-btn--ghost ad-btn--sm"
                    onClick={() => startEdit(member)}
                  >
                    Edit
                  </button>
                  {me?.id !== member.id && (
                    <button
                      className="ad-btn ad-btn--danger ad-btn--sm"
                      onClick={() => remove(member)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </TableWrap>
      </Panel>

      <Panel
        title={editing ? `Edit ${editing.name}` : 'Add a team member'}
        action={
          editing && (
            <button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={startAdd}>
              Add someone new instead
            </button>
          )
        }
      >
        <form className="ad-form" onSubmit={submit}>
          <div className="ad-row">
            <Field label="Name" error={fieldErrors.name}>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </Field>

            <Field label="Email" error={fieldErrors.email}>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </Field>
          </div>

          <div className="ad-row">
            <Field
              label="Password"
              hint={editing ? 'Leave blank to keep the current one.' : 'At least 8 characters.'}
              error={fieldErrors.password}
            >
              <input
                type="password"
                autoComplete="new-password"
                required={!editing}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
            </Field>

            <Field label="Confirm password">
              <input
                type="password"
                autoComplete="new-password"
                required={!editing || Boolean(form.password)}
                value={form.password_confirmation}
                onChange={(e) => set('password_confirmation', e.target.value)}
              />
            </Field>
          </div>

          <div className="ad-row">
            <Field
              label="Role"
              hint="Owners can manage the team; managers can run the shop."
              error={fieldErrors.role}
            >
              <select value={form.role} onChange={(e) => set('role', e.target.value)}>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>
            </Field>
          </div>

          <label className="ad-check">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set('is_active', e.target.checked)}
            />
            Account is active
          </label>
          {fieldErrors.is_active && <p className="ad-field__error">{fieldErrors.is_active}</p>}

          <div className="ad-actions">
            <button type="submit" className="ad-btn" disabled={isSaving}>
              {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Add to team'}
            </button>
          </div>
        </form>
      </Panel>
    </>
  )
}
