import Hero from './components/Hero'
import ProductSpotlight from '@/components/product/ProductSpotlight'
import WhySection from './components/WhySection'
import Reviews from './components/Reviews'
import JournalPreview from './components/JournalPreview'

export default function Home() {
  return (
    <main>
      <Hero />
      <ProductSpotlight />
      <WhySection />
      <Reviews />
      <JournalPreview />
    </main>
  )
}
