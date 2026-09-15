import { useRef, useState } from 'react'
import { ACCEPT_ATTR, optimizedUrl, uploadImage } from '@/lib/cloudinary'
import { useToast } from './toast-context'

/**
 * Uploads straight to Cloudinary and hands the resulting URL back through
 * `onChange`. Falls back to pasting a URL when Cloudinary is not configured,
 * so the dashboard is still usable without it.
 */
export default function ImageUploader({ value, onChange, label = 'Image' }) {
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const toast = useToast()

  const pick = async (event) => {
    const file = event.target.files?.[0]
    // Clear the input so re-picking the same file fires change again.
    event.target.value = ''
    if (!file) return

    setError('')
    setProgress(0)

    try {
      const { url } = await uploadImage(file, { onProgress: setProgress })
      onChange(url)
      toast.success('Image uploaded.')
    } catch (err) {
      setError(err.message)
    } finally {
      setProgress(null)
    }
  }

  return (
    <div className="ad-upload">
      <label className="ad-field">
        <span>{label}</span>
        <input
          type="url"
          placeholder="https://…"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="ad-field__hint">
          Paste a URL, or upload a file to store it on Cloudinary.
        </span>
      </label>

      {value && (
        <div className="ad-upload__preview">
          <img src={optimizedUrl(value, { width: 640 })} alt="" />
        </div>
      )}

      <div className="ad-actions">
        <button
          type="button"
          className="ad-btn ad-btn--ghost ad-btn--sm"
          disabled={progress !== null}
          onClick={() => inputRef.current?.click()}
        >
          {progress !== null ? `Uploading ${progress}%` : 'Upload an image'}
        </button>
        {value && (
          <button
            type="button"
            className="ad-btn ad-btn--danger ad-btn--sm"
            onClick={() => onChange('')}
          >
            Remove
          </button>
        )}
      </div>

      {progress !== null && (
        <div className="ad-upload__bar">
          <span style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className="ad-field__error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        hidden
        onChange={pick}
      />
    </div>
  )
}
