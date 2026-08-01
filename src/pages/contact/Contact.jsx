import { useState } from 'react'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'
import { social } from '@/data'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setSent(true)
  }

  return (
    <main className="page">
      <PageHero
        eyebrow="Contact"
        title="We'd love to hear from you."
        lead="Questions about your order, your ritual or your scalp — nothing is too small."
      />

      <section className="section">
        <div className="container form-wrap">
          <Reveal className="form-card">
            {sent ? (
              <div className="form-card__done">
                <span className="form-card__check">✓</span>
                <h3>Message received</h3>
                <p>
                  Thank you, {form.name.split(' ')[0]}. We reply to every message
                  within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h3>Send us a message</h3>
                <label>
                  Full name
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>
                <label>
                  Email address
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>
                <label>
                  Message
                  <textarea
                    required
                    rows={5}
                    placeholder="How can we help?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </label>
                <button type="submit" className="btn"><span>Send message</span></button>
              </form>
            )}
          </Reveal>

          <Reveal className="form-aside" delay={0.1}>
            <p className="eyebrow">Elsewhere</p>
            <h3>Find us on Instagram.</h3>
            <p>
              Daily rituals, behind-the-scenes brewing and community stories
              live at{' '}
              <a href={social.instagram} target="_blank" rel="noreferrer">
                {social.handle}
              </a>
              .
            </p>
            <p className="form-aside__note">
              Prefer email? Reach us any time at{' '}
              <a href="mailto:hello@naziabotanics.com">hello@naziabotanics.com</a>.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
