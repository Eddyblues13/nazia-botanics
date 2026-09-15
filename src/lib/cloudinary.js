import { ApiError } from './api'
import { createUploadSignature } from './adminApi'

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(',')

/** Rejects obviously bad files before spending a signature on them. */
export function validateImage(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "That file type isn't supported — use JPEG, PNG, WebP or AVIF."
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is ${
      MAX_UPLOAD_BYTES / 1024 / 1024
    }MB.`
  }
  return null
}

/**
 * Uploads straight from the browser to Cloudinary using a signature minted by
 * the API. Uses XMLHttpRequest rather than fetch because only XHR reports
 * upload progress, which matters for multi-megabyte product photography.
 */
export async function uploadImage(file, { onProgress, signal } = {}) {
  const invalid = validateImage(file)
  if (invalid) throw new ApiError(invalid)

  const { data: sig } = await createUploadSignature()

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.api_key)
  form.append('timestamp', sig.timestamp)
  form.append('signature', sig.signature)
  form.append('folder', sig.folder)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', sig.endpoint)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', () => {
      let payload = null
      try {
        payload = JSON.parse(xhr.responseText)
      } catch {
        // Falls through to the generic message below.
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload?.secure_url) {
        resolve({
          url: payload.secure_url,
          publicId: payload.public_id,
          width: payload.width,
          height: payload.height,
          bytes: payload.bytes,
          format: payload.format,
        })
        return
      }

      reject(new ApiError(payload?.error?.message ?? 'Cloudinary rejected that upload.'))
    })

    xhr.addEventListener('error', () =>
      reject(new ApiError("Couldn't reach Cloudinary — check your connection and try again."))
    )
    xhr.addEventListener('abort', () => reject(new ApiError('Upload cancelled.')))

    signal?.addEventListener('abort', () => xhr.abort(), { once: true })

    xhr.send(form)
  })
}

const UPLOAD_SEGMENT = '/image/upload/'

const TRANSFORM_SEGMENT =
  /^(a|ar|b|bo|br|c|co|cs|d|dl|dn|dpr|e|f|fl|fn|g|h|if|l|o|p|pg|q|r|so|t|u|vc|w|x|y|z)_[^/]*\//

/**
 * Rewrites a Cloudinary delivery URL to add transformations. `f_auto` serves
 * AVIF/WebP to browsers that take them and `q_auto` picks a quality per image.
 *
 * Non-Cloudinary URLs pass through untouched, so externally hosted images and
 * anything uploaded before this existed keep working.
 */
export function optimizedUrl(url, { width, height, crop = 'limit' } = {}) {
  if (typeof url !== 'string' || !url.includes(UPLOAD_SEGMENT)) return url

  // An already-transformed URL is left alone rather than stacked on. Matching
  // Cloudinary's actual transformation keys rather than any `xx_` prefix keeps
  // a folder like `my_photos/` from being mistaken for one.
  const [base, rest] = url.split(UPLOAD_SEGMENT)
  if (TRANSFORM_SEGMENT.test(rest)) return url

  const transform = ['f_auto', 'q_auto', `c_${crop}`, width && `w_${width}`, height && `h_${height}`]
    .filter(Boolean)
    .join(',')

  return `${base}${UPLOAD_SEGMENT}${transform}/${rest}`
}

const DEFAULT_WIDTHS = [400, 600, 900, 1200]

/** Lets the browser pick a width instead of everyone downloading the largest. */
export function srcSetFor(url, widths = DEFAULT_WIDTHS) {
  if (typeof url !== 'string' || !url.includes(UPLOAD_SEGMENT)) return undefined

  return widths.map((w) => `${optimizedUrl(url, { width: w })} ${w}w`).join(', ')
}
