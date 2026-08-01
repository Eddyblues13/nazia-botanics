import { Link } from 'react-router-dom'
import Reveal from '@/components/common/Reveal'
import { pillars } from '@/data'

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
            <Link to="/journal" className="link-arrow">Read the science →</Link>
          </Reveal>
        </div>

        <div className="why__pillars">
          {pillars.map((p, i) => (
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
