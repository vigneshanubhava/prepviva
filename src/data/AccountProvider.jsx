import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  ACCOUNT,
  billingSummary,
  cancelSubscription,
  changePlan,
  completeOnboarding,
  dismissOnboarding,
  keepCurrentPlan,
  renewSubscription,
  scheduleChange,
} from './account.js'

const AccountContext = createContext(null)

/**
 * The live account, in memory for the whole session.
 *
 * The upgrade flow spans two screens — you change the plan on Manage plan and
 * see the result on Billing — so the account cannot live in either screen's
 * own state. doc/BRIEF.md rules out localStorage and sessionStorage, not
 * memory, so this is the one copy every signed-in screen reads and writes. It
 * resets on reload, which is the right behaviour for a prototype.
 *
 * `notice` is the one-shot message a screen leaves for the next one — the
 * "Successfully updated the plan to Core Prep" toast on artboard 43. The screen
 * that shows it clears it.
 */
export function AccountProvider({ children }) {
  const [account, setAccount] = useState(ACCOUNT)
  const [notice, setNotice] = useState(null)

  const cancel = useCallback(
    (reason) => setAccount((a) => cancelSubscription(a, reason)),
    [],
  )
  const renew = useCallback(() => setAccount((a) => renewSubscription(a)), [])
  const upgrade = useCallback((change) => setAccount((a) => changePlan(a, change)), [])
  const schedule = useCallback((change) => setAccount((a) => scheduleChange(a, change)), [])
  const keepPlan = useCallback(() => setAccount((a) => keepCurrentPlan(a)), [])

  // The first-run wizard: finishing keeps what it collected, skipping keeps
  // nothing. Both stop it asking again for the rest of the session.
  const onboard = useCallback((details) => setAccount((a) => completeOnboarding(a, details)), [])
  const skipOnboarding = useCallback(() => setAccount((a) => dismissOnboarding(a)), [])

  const updateCards = useCallback(
    (update) => setAccount((a) => ({ ...a, cards: update(a.cards) })),
    [],
  )

  const value = useMemo(
    () => ({
      account,
      summary: billingSummary(account),
      setAccount,
      cancel,
      renew,
      upgrade,
      schedule,
      keepPlan,
      onboard,
      skipOnboarding,
      updateCards,
      notice,
      setNotice,
    }),
    [
      account,
      notice,
      cancel,
      renew,
      upgrade,
      schedule,
      keepPlan,
      onboard,
      skipOnboarding,
      updateCards,
    ],
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount must be used inside AccountProvider')
  return ctx
}
