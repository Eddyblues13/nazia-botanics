/**
 * The storefront draws its own icons rather than pulling in an icon package,
 * so the dashboard does the same. Every icon inherits currentColor.
 */
const base = {
  width: 17,
  height: 17,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const IconDashboard = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
)

export const IconOrders = (p) => (
  <svg {...base} {...p}>
    <path d="M6 2h9l4 4v16H6z" />
    <path d="M15 2v5h4" />
    <path d="M9 12h7M9 16h7" />
  </svg>
)

export const IconProduct = (p) => (
  <svg {...base} {...p}>
    <path d="M10 2h4v3h-4z" />
    <path d="M9 5h6l1.6 3.2a4 4 0 0 1 .4 1.8V20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-10a4 4 0 0 1 .4-1.8z" />
    <path d="M7 14h10" />
  </svg>
)

export const IconJournal = (p) => (
  <svg {...base} {...p}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22z" />
    <path d="M8 7h8M8 11h8" />
  </svg>
)

export const IconMail = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)

export const IconStar = (p) => (
  <svg {...base} {...p}>
    <path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.4l6-.8z" />
  </svg>
)

export const IconList = (p) => (
  <svg {...base} {...p}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="3.5" cy="6" r="1" />
    <circle cx="3.5" cy="12" r="1" />
    <circle cx="3.5" cy="18" r="1" />
  </svg>
)

export const IconUsers = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 5.5a3.2 3.2 0 0 1 0 6M18 20a6 6 0 0 0-2-4.5" />
  </svg>
)

export const IconUserCog = (p) => (
  <svg {...base} {...p}>
    <circle cx="10" cy="8" r="3.4" />
    <path d="M3 20a7 7 0 0 1 10-6.3" />
    <circle cx="17.5" cy="17.5" r="2.5" />
    <path d="M17.5 13.6v1M17.5 20.4v1M21 17.5h-1M15 17.5h-1" />
  </svg>
)

export const IconMenu = (p) => (
  <svg {...base} width={20} height={20} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const IconClose = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)

export const IconLogout = (p) => (
  <svg {...base} {...p}>
    <path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M10 17 5 12l5-5M5 12h11" />
  </svg>
)

export const IconStore = (p) => (
  <svg {...base} {...p}>
    <path d="M4 9h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    <path d="M4 9 5.5 4h13L20 9" />
    <path d="M10 21v-6h4v6" />
  </svg>
)

export const IconDownload = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3v11" />
    <path d="m8 11 4 4 4-4" />
    <path d="M4 19h16" />
  </svg>
)

export const IconPlus = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
