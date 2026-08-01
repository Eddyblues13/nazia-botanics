import PageHero from '@/components/common/PageHero'

export default function Terms() {
  return (
    <main className="page">
      <PageHero eyebrow="Company" title="Terms of Service" lead="Last updated: July 2026" />

      <section className="section">
        <div className="container legal">
          <h3>Orders & payment</h3>
          <p>
            All prices are listed in Nigerian Naira (₦). An order is confirmed
            once payment is received, and you'll get a confirmation email with
            your order details.
          </p>

          <h3>Delivery</h3>
          <p>
            We ship nationwide from Lagos. Delivery timelines shown at checkout
            are estimates; we'll keep you updated if anything changes with your
            order.
          </p>

          <h3>Returns & refunds</h3>
          <p>
            Unopened bottles can be returned within 14 days of delivery for a
            full refund. If your order arrives damaged, send us a photo within
            48 hours and we'll replace it at no cost.
          </p>

          <h3>Product disclaimer</h3>
          <p>
            Our products are 100% botanical cosmetic products, not medicines.
            They are not intended to diagnose, treat or cure any condition.
            Patch-test before first use and consult a professional if you have a
            scalp condition, are pregnant, or are nursing.
          </p>

          <h3>Contact</h3>
          <p>
            Questions about these terms? Email{' '}
            <a href="mailto:hello@naziabotanics.com">hello@naziabotanics.com</a>.
          </p>
        </div>
      </section>
    </main>
  )
}
