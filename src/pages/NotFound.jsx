import { Link } from 'react-router-dom'
import PageHero from '@/components/common/PageHero'

export default function NotFound() {
  return (
    <main className="page">
      <PageHero
        eyebrow="404"
        title="This page has shed."
        lead="Like a strand in telogen, the page you're looking for has moved on. Let's get you back to your ritual."
      >
        <div className="notfound__actions">
          <Link to="/" className="btn"><span>Back Home</span></Link>
          <Link to="/shop" className="link-arrow">Shop the Ritual →</Link>
        </div>
      </PageHero>
    </main>
  )
}
