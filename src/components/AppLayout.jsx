import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import AppHeader from './AppHeader.jsx'
import AppNav from './AppNav.jsx'
import { useAccount } from '../data/AccountProvider.jsx'
import styles from './AppLayout.module.css'

/**
 * Shell for every signed-in screen: fixed header, left nav, content column.
 *
 * An account that has not been through first-run setup is sent there before it
 * sees any of this. The gate lives on the shell rather than on one screen, so
 * every signed-in route inherits it, and setup is a page of its own rather than
 * a dialog over a screen the user has not earned yet.
 */
export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  // The live account, not the module default: the first-run wizard can change
  // the name, and the header shows it.
  const { account } = useAccount()

  if (!account.onboarded) return <Navigate to="/welcome/setup" replace />

  return (
    <div className={styles.page} data-collapsed={collapsed || undefined}>
      <AppHeader name={account.name} email={account.email} />
      <AppNav collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className={styles.content}>{children}</main>
    </div>
  )
}
