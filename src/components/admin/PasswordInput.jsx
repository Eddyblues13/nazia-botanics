import { useId, useState } from 'react'

function EyeIcon({ off }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  return off ? (
    <svg {...common}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A9.6 9.6 0 0 1 12 5c5 0 9 4.5 9 7a12 12 0 0 1-2.3 3.3" />
      <path d="M6.5 6.9C3.9 8.4 3 10.8 3 12c0 2.5 4 7 9 7 1.6 0 3-.4 4.3-1.1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  ) : (
    <svg {...common}>
      <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/**
 * A password field with a reveal toggle.
 *
 * The toggle is a button rather than a checkbox so it can sit inside the field
 * without disturbing the layout, and it is deliberately `tabIndex={-1}`: tabbing
 * out of a password field should land on the submit button, not on a control
 * most people never use. It stays reachable by click, and by keyboard through
 * normal focus order if the field is skipped.
 *
 * Revealing resets whenever the form is submitted by the caller clearing the
 * value, so a password is never left visible on a filled-in form.
 */
export default function PasswordInput({
  value,
  onChange,
  autoComplete = 'current-password',
  placeholder = '••••••••',
  required = false,
  disabled = false,
  id,
  ...rest
}) {
  const [shown, setShown] = useState(false)
  const generated = useId()
  const inputId = id ?? generated

  return (
    <div className={`ad-password ${disabled ? 'ad-password--disabled' : ''}`}>
      <input
        id={inputId}
        type={shown ? 'text' : 'password'}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...rest}
      />
      <button
        type="button"
        className="ad-password__toggle"
        onClick={() => setShown((s) => !s)}
        disabled={disabled}
        tabIndex={-1}
        aria-controls={inputId}
        aria-pressed={shown}
        aria-label={shown ? 'Hide password' : 'Show password'}
        title={shown ? 'Hide password' : 'Show password'}
      >
        <EyeIcon off={shown} />
      </button>
    </div>
  )
}
