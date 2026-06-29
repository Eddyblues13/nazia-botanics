// Prices in Naira (no kobo). Adjust these to your real pricing.
export const formatNaira = (n) => `₦${n.toLocaleString('en-NG')}`

export const product = {
  name: 'Botanical Growth Oil',
  tagline: 'Scalp & Strand Ritual Oil',
  priceFrom: 15000,
  sizes: [
    { label: '2 oz', price: 15000 },
    { label: '4 oz', price: 25000 },
  ],
  highlights: [
    { icon: 'sprout', title: 'Stimulates Growth', detail: 'Rosemary' },
    { icon: 'strand', title: 'Strengthens Strands', detail: 'Hibiscus' },
    { icon: 'calm', title: 'Reduces Stress-Shedding', detail: 'Ashwagandha' },
  ],
}

export const articles = [
  {
    id: 'siro-abhyanga',
    tag: 'Ritual',
    title: 'The History of Siro Abhyanga',
    excerpt: 'Why we massage — the ancient art of head anointing and the nervous system.',
    minutes: 6,
    tone: 'sage',
  },
  {
    id: 'rosemary-science',
    tag: 'The Science',
    title: 'Rosemary vs. Chemical Growth',
    excerpt: 'What the clinical research actually says about botanical stimulation.',
    minutes: 8,
    tone: 'terracotta',
  },
  {
    id: 'fenugreek',
    tag: 'Formulation',
    title: 'Itchy Scalp? Why We Removed Fenugreek',
    excerpt: 'The reformulation story — and how we chose comfort over tradition.',
    minutes: 5,
    tone: 'clay',
  },
]

export const journalLink = '#journal'
export const ritualGuideLink = '#journal'

export const social = {
  instagram: 'https://www.instagram.com/nazia_botanics/',
  handle: '@nazia_botanics',
}
