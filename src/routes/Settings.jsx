import { useEffect, useRef } from 'react'
import { Navigate, NavLink, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import PageHero from '../components/PageHero.jsx'
import { Badge, Icon } from '../components/ui/index.js'
import { useAccount } from '../data/AccountProvider.jsx'
import {
  DataSection,
  DevicesSection,
  InterviewSection,
  PreferencesSection,
  ProfileSection,
  SecuritySection,
  SessionsSection,
} from './SettingsSections.jsx'
import styles from './Settings.module.css'

/**
 * Settings — the one screen doc/HANDOFF.md listed as a gap and every other
 * screen already linked to. The left nav has always had it, the profile menu
 * has always had it, and first-run setup's own copy promised its answers could
 * be changed here.
 *
 * **Not the reference's layout.** The mock it was asked from is a row of pill
 * tabs over one long stack, with two black device previews taking up half the
 * first screen. Tabs cap how many sections can exist and hide the rest behind a
 * horizontal scroll; a settings screen grows by one section a quarter forever.
 * So the sections are a rail — grouped, always visible, each with its own URL —
 * and the content column is capped at a reading width instead of stretching.
 * The device previews are gone: this prototype never opens a camera, and two
 * black rectangles that will never show a face are the least honest thing on
 * the screen. What replaces them is the thing they were next to and had no room
 * for — the connection strip and a diagnostics run that names what to fix.
 *
 * Each section carries its own draft and its own save bar (`SettingsParts.jsx`).
 * Nothing writes on keystroke.
 */

const SECTIONS = [
  {
    id: 'profile',
    label: 'Profile',
    icon: 'userCheck',
    group: 'Account',
    Component: ProfileSection,
  },
  {
    id: 'interview',
    label: 'Interview profile',
    icon: 'graduationCap',
    group: 'Account',
    Component: InterviewSection,
  },
  {
    id: 'devices',
    label: 'Devices',
    icon: 'microphone',
    group: 'Practice',
    Component: DevicesSection,
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: 'contrast',
    group: 'Practice',
    Component: PreferencesSection,
  },
  {
    id: 'security',
    label: 'Sign-in and security',
    icon: 'lock',
    group: 'Security',
    Component: SecuritySection,
  },
  {
    id: 'sessions',
    label: 'Active sessions',
    icon: 'monitor',
    group: 'Security',
    Component: SessionsSection,
  },
  {
    id: 'data',
    label: 'Data and privacy',
    icon: 'shield',
    group: 'Security',
    Component: DataSection,
  },
]

const GROUPS = ['Account', 'Practice', 'Security']

export default function Settings() {
  const { section } = useParams()
  const { account, settings } = useAccount()
  const headingRef = useRef(null)
  const first = useRef(true)

  const active = SECTIONS.find((item) => item.id === section)

  /* Moving between sections replaces the whole content column, so focus is sent
     to its heading — otherwise a keyboard user's next Tab starts from the rail
     link they just left and walks the rail again. Skipped on first paint, where
     nothing has moved yet. */
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    headingRef.current?.focus()
  }, [section])

  if (!section) return <Navigate to="/settings/profile" replace />
  if (!active) return <Navigate to="/settings/profile" replace />

  const Section = active.Component

  /* A rail flag is for a section that wants something done, not for every
     figure a section holds — a badge on all seven says nothing about any of
     them, and the two-line labels it caused were the tell. */
  const flags = {
    interview: account.profile.track ? null : 'Not set',
    devices: settings.devices.autoCheck ? null : 'Check off',
  }

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHero
          className={styles.hero}
          icon="settings"
          title="Settings"
          lede="Your account, how a session runs on this machine, and who is signed in."
        />

        <div className={styles.body}>
          <div className={styles.side}>
            <nav className={styles.rail} aria-label="Settings sections">
              {GROUPS.map((group) => (
                <div key={group} className={styles.railGroup}>
                  <p className={styles.railLabel}>{group}</p>
                  <ul className={styles.railList}>
                    {SECTIONS.filter((item) => item.group === group).map((item) => (
                      <li key={item.id}>
                        <NavLink
                          to={`/settings/${item.id}`}
                          className={({ isActive }) =>
                            `${styles.railItem} ${isActive ? styles.railOn : ''}`
                          }
                        >
                          <Icon name={item.icon} size="16px" strokeWidth={1.5} />
                          <span className={styles.railText}>{item.label}</span>
                          {flags[item.id] ? (
                            <Badge tone="warning" size="sm">
                              {flags[item.id]}
                            </Badge>
                          ) : null}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* keyed on the section so a draft never survives a move between two
              sections that happen to hold the same field names */}
          <div className={styles.content} key={active.id}>
            <span className={styles.anchor} ref={headingRef} tabIndex={-1} />
            <Section />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
