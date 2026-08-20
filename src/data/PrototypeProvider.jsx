import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { HISTORY, resolveState } from './dashboard.js'
import { load, save } from './session.js'

const PrototypeContext = createContext(null)

/**
 * The one piece of scenario state that is not the account: how much practice
 * history the candidate has (`cold | warm | established | lapsed`).
 *
 * Everything else the prototype controls panel forces — trial day, plan,
 * subscription, credits, CV — is real account state and goes through
 * `AccountProvider`. This exists because practice history is fixture data the
 * account has no field for.
 *
 * Seeded from `?state=` on first load, so the links that predate the panel
 * still work and a particular state is still shareable by URL. Failing that it
 * picks up whatever the tab was last on, so a refresh keeps the scenario.
 */
export function PrototypeProvider({ children }) {
  const [history, setHistory] = useState(() => {
    // an explicit ?state= wins: it is someone asking for that scenario now
    const asked = new URLSearchParams(window.location.search).get('state')
    if (asked) return resolveState(asked)
    return load('history', resolveState(null))
  })

  useEffect(() => save('history', history), [history])

  const value = useMemo(
    () => ({ history, setHistory, state: HISTORY[history] }),
    [history],
  )

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>
}

export function usePrototype() {
  const ctx = useContext(PrototypeContext)
  if (!ctx) throw new Error('usePrototype must be used inside PrototypeProvider')
  return ctx
}
