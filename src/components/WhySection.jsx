import Reveal from './Reveal'

const PILLARS = [
  {
    n: '01',
    title: 'Calm the nervous system',
    body: 'Adaptogens like Ashwagandha lower the cortisol that drives stress-shedding — growth begins with calm.',
  },
  {
    n: '02',
    title: 'Feed the follicle',
    body: 'Rosemary stimulates circulation at the root while hibiscus strengthens each strand from the inside out.',
  },
  {
    n: '03',
    title: 'Honour the ritual',
    body: 'A few mindful minutes of scalp massage a week — Siro Abhyanga — turns care into a practice, not a chore.',
  },
]

export default function WhySection() {
  return (
    <section className="section why" id="story">
      <div className="container why__grid">
        <div className="why__intro">
          <Reveal as="p" className="eyebrow">The Why</Reveal>
          <Reveal as="h2" delay={0.05} className="why__title">
            Beyond the Bottle:
            <br />a Holistic Approach.
          </Reveal>
          <Reveal as="p" delay={0.1} className="why__lead">
            We believe hair growth starts with a calm nervous system. That’s why we
            use adaptogens like Ashwagandha to treat the stress that causes shedding
            — at the source, not the surface.
          </Reveal>
          <Reveal delay={0.15}>
            <a href="#journal" className="link-arrow">Read the science →</a>
          </Reveal>
        </div>

        <div className="why__pillars">
          {PILLARS.map((p, i) => (
            <Reveal className="pillar" key={p.n} delay={i * 0.1}>
              <span className="pillar__n">{p.n}</span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
