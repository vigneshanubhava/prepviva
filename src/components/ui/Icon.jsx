/**
 * Inline SVG set. Every path is stroked in currentColor and sized in em, so an
 * icon takes its colour and scale from the text around it — no icon library,
 * no colours outside the token layer.
 */
const paths = {
  check: <polyline points="4 12.5 9 17.5 20 6.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12.5 11 15.5 16 9" />
    </>
  ),
  x: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  chevronDown: <polyline points="6 9.5 12 15.5 18 9.5" />,
  chevronUp: <polyline points="6 14.5 12 8.5 18 14.5" />,
  chevronRight: <polyline points="9.5 6 15.5 12 9.5 18" />,
  chevronLeft: <polyline points="14.5 6 8.5 12 14.5 18" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <line x1="12" y1="7.5" x2="12" y2="7.6" />
    </>
  ),
  alertTriangle: (
    <>
      <path d="M12 4.5 21 19.5H3Z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <line x1="12" y1="16.8" x2="12" y2="16.9" />
    </>
  ),
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7.5" x2="12" y2="13" />
      <line x1="12" y1="16.4" x2="12" y2="16.5" />
    </>
  ),
  minus: <line x1="6" y1="12" x2="18" y2="12" />,
  plus: (
    <>
      <line x1="12" y1="6" x2="12" y2="18" />
      <line x1="6" y1="12" x2="18" y2="12" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <line x1="15.8" y1="15.8" x2="20" y2="20" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <line x1="12" y1="2.6" x2="12" y2="4.6" />
      <line x1="12" y1="19.4" x2="12" y2="21.4" />
      <line x1="2.6" y1="12" x2="4.6" y2="12" />
      <line x1="19.4" y1="12" x2="21.4" y2="12" />
      <line x1="5.4" y1="5.4" x2="6.8" y2="6.8" />
      <line x1="17.2" y1="17.2" x2="18.6" y2="18.6" />
      <line x1="18.6" y1="5.4" x2="17.2" y2="6.8" />
      <line x1="6.8" y1="17.2" x2="5.4" y2="18.6" />
    </>
  ),
  moon: <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4 8.6 8.6 0 1 0 20 14.2Z" />,
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.2" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
    </>
  ),
  userCheck: (
    <>
      <circle cx="10" cy="8" r="3.6" />
      <path d="M3.6 20a6.4 6.4 0 0 1 12.8 0" />
      <polyline points="16.5 11 18.3 12.8 21.5 9.6" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5.4" />
      <polyline points="8.6 13.4 7.4 20.5 12 18.2 16.6 20.5 15.4 13.4" />
    </>
  ),
  bell: (
    <path d="M9.35 21c.7.62 1.63 1 2.65 1s1.94-.38 2.65-1M18 8a6 6 0 0 0-12 0c0 3.09-.78 5.21-1.65 6.61-.73 1.18-1.1 1.77-1.09 1.93.02.19.06.26.2.37.14.09.73.09 1.93.09h13.22c1.2 0 1.8 0 1.93-.1.15-.1.19-.18.2-.36.02-.16-.35-.75-1.08-1.93C18.78 13.21 18 11.09 18 8Z" />
  ),
  helpCircle: (
    <>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
      <circle cx="12" cy="12" r="10" />
    </>
  ),
  arrowLeft: <path d="M19 12H5m0 0 7 7m-7-7 7-7" />,
  lock: (
    <>
      <path d="M17 10V8a5 5 0 0 0-10 0v2" />
      <path d="M12 14.5v2" />
      <path d="M8.8 21h6.4c1.68 0 2.52 0 3.16-.33a3 3 0 0 0 1.31-1.31c.33-.64.33-1.48.33-3.16v-1.4c0-1.68 0-2.52-.33-3.16a3 3 0 0 0-1.31-1.31C17.72 10 16.88 10 15.2 10H8.8c-1.68 0-2.52 0-3.16.33a3 3 0 0 0-1.31 1.31C4 12.28 4 13.12 4 14.8v1.4c0 1.68 0 2.52.33 3.16a3 3 0 0 0 1.31 1.31C6.28 21 7.12 21 8.8 21Z" />
    </>
  ),
  creditCard: (
    <>
      <path d="M22 10H2" />
      <path d="M2 8.2v7.6c0 1.12 0 1.68.22 2.11a2 2 0 0 0 .87.87c.43.22.99.22 2.11.22h13.6c1.12 0 1.68 0 2.11-.22a2 2 0 0 0 .87-.87c.22-.43.22-.99.22-2.11V8.2c0-1.12 0-1.68-.22-2.11a2 2 0 0 0-.87-.87C20.48 5 19.92 5 18.8 5H5.2c-1.12 0-1.68 0-2.11.22a2 2 0 0 0-.87.87C2 6.52 2 7.08 2 8.2Z" />
    </>
  ),
  // Figma component `mail-01` (1:725) — the glyph in the login email field.
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.4" />
      <path d="m3.2 6.6 7.4 5.18a2.5 2.5 0 0 0 2.8 0l7.4-5.18" />
    </>
  ),
  // ---- app navigation and billing (Figma 1:5133) ----
  dashboard: (
    <>
      <rect x="3" y="3" width="7.5" height="8.5" rx="1.2" />
      <rect x="3" y="15" width="7.5" height="6" rx="1.2" />
      <rect x="13.5" y="3" width="7.5" height="6" rx="1.2" />
      <rect x="13.5" y="12.5" width="7.5" height="8.5" rx="1.2" />
    </>
  ),
  microphone: (
    <>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <line x1="12" y1="17.5" x2="12" y2="21.5" />
    </>
  ),
  graduationCap: (
    <>
      <path d="M2.5 8.5 12 4.5l9.5 4-9.5 4-9.5-4Z" />
      <path d="M6.5 10.2v4.6c0 1.6 2.5 2.7 5.5 2.7s5.5-1.1 5.5-2.7v-4.6" />
      <path d="M20 9.6v5.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </>
  ),
  history: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <polyline points="3.2 4.2 3.2 9 8 9" />
      <polyline points="12 7.6 12 12 15.4 14" />
    </>
  ),
  trendUp: (
    <>
      <polyline points="3 17.5 9.5 11 13.5 15 21 7.2" />
      <polyline points="15.6 7.2 21 7.2 21 12.6" />
    </>
  ),
  // Figma's icon is currency-dollar-circle; this product prices in GBP.
  poundCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 16.5h6" />
      <path d="M9 12.4h4.2" />
      <path d="M14.4 8.6a2.6 2.6 0 0 0-4.5 1.9v3.1c0 1.2-.5 2.1-1.2 2.6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.5 14.3a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.8-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.2a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.2-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1v-.2a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.8 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.2a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </>
  ),
  sparkle: (
    <>
      <path d="M9.5 3.2 11 7.4l4.2 1.5-4.2 1.5-1.5 4.2L8 10.4 3.8 8.9 8 7.4Z" />
      <path d="M17.5 13.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9Z" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4.5m0 0L7.6 8.9M12 4.5l4.4 4.4" />
      <path d="M3.5 15.5v1.9c0 1.12 0 1.68.22 2.11a2 2 0 0 0 .87.87c.43.22.99.22 2.11.22h10.6c1.12 0 1.68 0 2.11-.22a2 2 0 0 0 .87-.87c.22-.43.22-.99.22-2.11v-1.9" />
    </>
  ),
  download: (
    <>
      <path d="M12 4.5V16m0 0-4.4-4.4M12 16l4.4-4.4" />
      <path d="M3.5 15.5v1.9c0 1.12 0 1.68.22 2.11a2 2 0 0 0 .87.87c.43.22.99.22 2.11.22h10.6c1.12 0 1.68 0 2.11-.22a2 2 0 0 0 .87-.87c.22-.43.22-.99.22-2.11v-1.9" />
    </>
  ),
  dotsVertical: (
    <>
      <circle cx="12" cy="5.2" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18.8" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  filterLines: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="6.5" y1="12" x2="17.5" y2="12" />
      <line x1="9.5" y1="17" x2="14.5" y2="17" />
    </>
  ),
  trash: (
    <>
      <path d="M4 6.5h16" />
      <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
      <path d="M6.5 6.5 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.9-12.5" />
      <path d="M10.2 10v6.5M13.8 10v6.5" />
    </>
  ),
  arrowCircleLeft: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 12h-7m0 0 3-3m-3 3 3 3" />
    </>
  ),
  /* The plan glyphs, drawn in this set's house style. PlanIcon carries the
     marketing page's Untitled UI originals of the same three concepts; both are
     keyed by plan.icon, so which glyph a plan gets is decided in one place. */
  users: (
    <>
      <circle cx="9.5" cy="8" r="3.6" />
      <path d="M3 20a6.5 6.5 0 0 1 13 0" />
      <path d="M15.8 4.7a3.6 3.6 0 0 1 0 6.6" />
      <path d="M17.6 14.6A6.5 6.5 0 0 1 21 20" />
    </>
  ),
  trophy: (
    <>
      <path d="M7.5 3.5h9V9a4.5 4.5 0 0 1-9 0Z" />
      <path d="M7.5 5.2H5v1.3a3.3 3.3 0 0 0 2.8 3.2" />
      <path d="M16.5 5.2H19v1.3a3.3 3.3 0 0 1-2.8 3.2" />
      <line x1="12" y1="13.5" x2="12" y2="17.2" />
      <path d="M8.6 20.5a3.4 3.4 0 0 1 6.8 0Z" />
    </>
  ),
  /* Figma: contrast-02 — the "follow the system" mark. The stroked circle with
     one half filled, so it reads at 16px. */
  contrast: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none" />
    </>
  ),
  /* Figma: log-out-01 */
  logOut: (
    <>
      <path d="M14 7.5V6a2 2 0 0 0-2-2H6.5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2H12a2 2 0 0 0 2-2v-1.5" />
      <path d="M20 12H9.5" />
      <path d="m16.8 8.8 3.2 3.2-3.2 3.2" />
    </>
  ),
  inbox: (
    <>
      <path d="M3.5 12.5h4l1.5 3h6l1.5-3h4" />
      <path d="M5.4 5h13.2l1.9 7.5v4.3a2.2 2.2 0 0 1-2.2 2.2H5.7a2.2 2.2 0 0 1-2.2-2.2v-4.3Z" />
    </>
  ),
}

export const iconNames = Object.keys(paths)

export default function Icon({ name, size = '1em', strokeWidth = 1.75, title, className = '', ...rest }) {
  const shape = paths[name]
  if (!shape) return null
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {shape}
    </svg>
  )
}
