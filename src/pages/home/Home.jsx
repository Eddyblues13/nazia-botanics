import Hero from './components/Hero'
import ProductSpotlight from '@/components/product/ProductSpotlight'
import WhySection from './components/WhySection'
import JournalPreview from './components/JournalPreview'

export default function Home() {
  return (
    <main>
      <Hero />
      <ProductSpotlight />
      <WhySection />
      <JournalPreview />
    </main>
  )
}
