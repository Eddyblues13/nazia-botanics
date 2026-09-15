# Nazia Botanics — storefront

React + Vite storefront for Nazia Botanics, plus the admin dashboard that runs
it. Content, orders and signups all come from the
[Laravel API](../nazia-botanicsbackend).

## Setup

```bash
npm install
cp .env.example .env     # point VITE_API_URL at the API
npm run dev              # http://localhost:5173
```

The API needs to be running too — see its README. Open the
`nazia-botanics.code-workspace` file in the backend folder to get both in one
editor window.

## Layout

```
src/lib/api.js         storefront API client
src/lib/adminApi.js    dashboard API client (bearer token)
src/context/           shop, journal, cart and admin-auth providers
src/pages/             storefront pages
src/pages/admin/       dashboard pages
src/components/admin/  dashboard shell and shared UI
src/data/index.js      bundled copy of the content, used as a fallback
```

## Routes

**Storefront** — `/`, `/shop`, `/cart`, `/checkout`, `/order/:reference`,
`/journal`, `/journal/:id`, `/our-story`, `/account`, `/contact`, `/privacy`,
`/terms`, and `/waitlist` (standalone, no header or footer).

**Dashboard** — `/admin/login`, then `/admin` for the dashboard, orders,
products, journal, messages, reviews, waitlist, subscribers, team (owners only)
and account.

## Things worth knowing

**The storefront degrades rather than breaks.** If the API can't be reached, the
product, journal and reviews fall back to the bundled copies in `src/data`, so
visitors still see a complete site. Forms, which have nowhere to fall back to,
report the failure honestly instead.

**The cart is priced twice.** Prices shown in the cart are a snapshot for
display; the server re-prices every line from its own catalog when the order is
placed, so the total is always the real one.

**`/account` tracks orders, it doesn't sign anyone in.** Orders are placed
without an account — the reference on the confirmation is what a customer looks
up.

**The cart survives a refresh** via localStorage, wrapped so Safari's private
mode can't break the page.
