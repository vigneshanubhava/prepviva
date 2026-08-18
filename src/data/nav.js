/**
 * The one navigation set, per doc/BRIEF.md — Figma's Admin variant (Connectors,
 * People) is deleted. It lives here rather than in AppNav because two things
 * need it: the nav itself, and the "not built yet" placeholder, which keeps the
 * app shell for a destination that belongs to a signed-in screen.
 */
export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/practice', label: 'Practice', icon: 'microphone' },
  { to: '/sessions', label: 'My Sessions', icon: 'history' },
  { to: '/performance', label: 'Performance', icon: 'trendUp' },
  { to: '/billing', label: 'Billing', icon: 'poundCircle' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

/** Is this path one the signed-in shell owns? */
export function isSignedInPath(pathname) {
  return NAV_ITEMS.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
}
