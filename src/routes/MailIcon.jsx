/**
 * Chrome glyphs for the simulated mail client on 14 Email - Magic Link
 * (14:10469). They belong to the mock inbox, not to PrepViva, so they live
 * beside that screen rather than in the design-system Icon set.
 *
 * Figma exports each of these as a flat SVG with its colour baked in, which
 * would not follow the theme — redrawn in currentColor so the client's dark
 * palette resolves from tokens like everything else.
 */
const paths = {
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <line x1="15.8" y1="15.8" x2="20" y2="20" />
    </>
  ),
  chevronDown: <polyline points="6 9.5 12 15.5 18 9.5" />,
  chevronLeft: <polyline points="14.5 6 8.5 12 14.5 18" />,
  chevronRight: <polyline points="9.5 6 15.5 12 9.5 18" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.4a2.5 2.5 0 0 1 4.85.85c0 1.7-2.5 2.5-2.5 2.5" />
      <line x1="12" y1="16.5" x2="12" y2="16.6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </>
  ),
  apps: (
    <>
      {[5, 12, 19].map((y) => [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="currentColor" stroke="none" />))}
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  inbox: (
    <>
      <path d="M3.5 13h4l1.5 3h6l1.5-3h4" />
      <path d="M5.4 5h13.2l1.9 8v4.8A2.2 2.2 0 0 1 18.3 20H5.7a2.2 2.2 0 0 1-2.2-2.2V13Z" />
    </>
  ),
  star: <path d="m12 3.6 2.66 5.4 5.96.87-4.31 4.2 1.02 5.93L12 17.2l-5.33 2.8 1.02-5.93-4.31-4.2 5.96-.87Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6.8 12 12 15.6 14" />
    </>
  ),
  send: <path d="M21.5 3 2.8 10.4l7.3 2.6 2.6 7.3Zm0 0-11.4 10" />,
  file: (
    <>
      <path d="M14 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7Z" />
      <polyline points="14 3 14 7 18 7" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7.5" x2="12" y2="13" />
      <line x1="12" y1="16.4" x2="12" y2="16.5" />
    </>
  ),
  trash: (
    <>
      <path d="M4 6.5h16" />
      <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
      <path d="M6.5 6.5 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.9-12.5" />
    </>
  ),
  tag: (
    <>
      <path d="M3 8.4A2.4 2.4 0 0 1 5.4 6h4.3a2 2 0 0 1 1.4.6l8.3 8.3a1.7 1.7 0 0 1 0 2.4l-3.1 3.1a1.7 1.7 0 0 1-2.4 0L5.6 12.1a2 2 0 0 1-.6-1.4Z" />
      <circle cx="8" cy="11" r="1.2" />
    </>
  ),
  video: (
    <>
      <rect x="2.5" y="6" width="13" height="12" rx="2" />
      <path d="m15.5 11 6-3.5v9l-6-3.5Z" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M7 15h10M6.5 10.5h.01M10 10.5h.01M13.5 10.5h.01M17 10.5h.01" />
    </>
  ),
  archive: (
    <>
      <rect x="3" y="4" width="18" height="4.5" rx="1.2" />
      <path d="M4.6 8.5v10A1.5 1.5 0 0 0 6.1 20h11.8a1.5 1.5 0 0 0 1.5-1.5v-10" />
      <path d="M10 12.5h4" />
    </>
  ),
  markUnread: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3.2 6.6 7.4 5.2a2.5 2.5 0 0 0 2.8 0l7.4-5.2" />
    </>
  ),
  addTask: (
    <>
      <polyline points="4 12.5 8.5 17 20 5.5" />
      <path d="M17.5 14v6M14.5 17h6" />
    </>
  ),
  moveTo: (
    <>
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2.5h9A1.5 1.5 0 0 1 21 9v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18Z" />
      <path d="M10.5 13.5h5m0 0-2-2m2 2-2 2" />
    </>
  ),
  moreVert: (
    <>
      <circle cx="12" cy="5.2" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18.8" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  arrowBack: <path d="M20 12H4.5m0 0 6.5 6.5M4.5 12 11 5.5" />,
  print: (
    <>
      <path d="M7 9V3.5h10V9" />
      <rect x="3.5" y="9" width="17" height="7.5" rx="1.6" />
      <path d="M7 14h10v6.5H7Z" />
    </>
  ),
  openInNew: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14.5v4A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6h4" />
    </>
  ),
  reply: <path d="M9 6.5 3.5 12 9 17.5M3.5 12H14a6.5 6.5 0 0 1 6.5 6.5V19" />,
  forward: <path d="M15 6.5 20.5 12 15 17.5M20.5 12H10a6.5 6.5 0 0 0-6.5 6.5V19" />,
  labelImportant: <path d="M4 5h11.5l4.5 7-4.5 7H4l4.5-7Z" />,
}

export default function MailIcon({ name, size = '22px', strokeWidth = 1.6, className = '' }) {
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
      aria-hidden="true"
      focusable="false"
    >
      {shape}
    </svg>
  )
}
