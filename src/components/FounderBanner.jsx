import Reveal from './Reveal'

export default function FounderBanner() {
  const total = 10
  const remaining = 4
  return (
    <section className="founder" id="account">
      <div className="founder__bg" aria-hidden="true" />
      <div className="container founder__inner">
        <Reveal as="p" className="eyebrow founder__eyebrow">The Inner Circle</Reveal>
        <Reveal as="h2" delay={0.05} className="founder__title">
          Join the Inner Circle.
        </Reveal>
        <Reveal as="p" delay={0.1} className="founder__text">
          We’re looking for our first 10 Founding Members. Receive a{' '}
          <strong>permanent 20% discount</strong> and help us grow something rooted
          in care.
        </Reveal>

        <Reveal delay={0.15} className="founder__status">
          <div className="founder__dots">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={i < total - remaining ? 'taken' : 'open'} />
            ))}
          </div>
          <span className="founder__count">Only {remaining} slots remaining</span>
        </Reveal>

        <Reveal delay={0.2}>
          <a href="#footer" className="btn"><span>Become a Founder</span></a>
        </Reveal>
      </div>
    </section>
  )
}
