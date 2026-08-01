import PageHero from '@/components/common/PageHero'

export default function Privacy() {
  return (
    <main className="page">
      <PageHero eyebrow="Company" title="Privacy Policy" lead="Last updated: July 2026" />

      <section className="section">
        <div className="container legal">
          <h3>What we collect</h3>
          <p>
            When you place an order or join our newsletter, we collect the details you give us: your name, email address,
            delivery address and phone number. We do not collect anything you
            don't hand us directly.
          </p>

          <h3>How we use it</h3>
          <ul>
            <li>To fulfil and deliver your orders.</li>
            <li>To send the newsletters and ritual guides you've asked for.</li>
            <li>To answer your messages and support requests.</li>
            <li>To improve our products and this website.</li>
          </ul>

          <h3>What we never do</h3>
          <p>
            We never sell your personal information, and we never share it with
            third parties beyond the payment and delivery partners needed to get
            your order to your door.
          </p>

          <h3>Cookies</h3>
          <p>
            This site uses only the essential cookies required for it to
            function — no advertising trackers.
          </p>

          <h3>Your rights</h3>
          <p>
            You may ask us at any time to see, correct or delete the data we
            hold about you. Email{' '}
            <a href="mailto:hello@naziabotanics.com">hello@naziabotanics.com</a>{' '}
            and we'll act within 30 days.
          </p>
        </div>
      </section>
    </main>
  )
}
