import { optimizedUrl, srcSetFor } from '@/lib/cloudinary'

/**
 * The image band at the top of a journal card — rendered only when the article
 * actually has artwork.
 *
 * With no image it returns nothing rather than an empty tinted well, because a
 * large blank band reads as a picture that failed to load. The card then falls
 * back to a text-led treatment (see `j-card--text`), where the tag moves inline
 * above the title and the card looks deliberately typographic.
 */
export default function ArticleVisual({
  article,
  sizes = '(min-width: 900px) 33vw, 90vw',
  width = 900,
}) {
  if (!article.image) return null

  return (
    <div className="j-card__image">
      <img
        src={optimizedUrl(article.image, { width })}
        srcSet={srcSetFor(article.image)}
        sizes={sizes}
        alt={article.title}
        loading="lazy"
        decoding="async"
        className="j-card__photo"
      />
      <span className="j-card__tag">{article.tag}</span>
    </div>
  )
}
