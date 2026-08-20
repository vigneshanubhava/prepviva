import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SETTINGS, makePasskey } from './settings.js'
import { readPhoto } from './photo.js'
import { load, save } from './session.js'
import {
  ACCOUNT,
  attachResume,
  billingSummary,
  cancelSubscription,
  clearAvatar,
  changePlan,
  completeOnboarding,
  dismissOnboarding,
  keepCurrentPlan,
  removeResume,
  renewSubscription,
  scheduleChange,
  setAvatar,
  spendCredits,
  updateDetails,
  updateInterviewProfile,
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
  // seeded from the tab's session so a refresh does not undo the demo — see
  // data/session.js, including why a hard refresh cannot be told apart
  const [account, setAccount] = useState(() => load('account', ACCOUNT))
  const [notice, setNotice] = useState(null)
  /**
   * Everything Settings owns that the account has no field for — notification
   * preferences, recording retention, device choices, passkeys and the signed-in
   * device list. It sits here rather than in the settings route because the
   * screen is seven sections deep and each one saves on its own; holding it in
   * the route would reset the other six every time one of them navigated.
   */
  const [settings, setSettings] = useState(() => load('settings', SETTINGS))
  /**
   * Which notifications have been read. The bell's rows are derived from state
   * rather than stored (`data/notifications.js`), so the only thing there is to
   * keep is the ids that have been seen — and an id that stops being generated
   * simply stops mattering.
   */
  const [notificationsRead, setNotificationsRead] = useState(() => load('notificationsRead', []))

  useEffect(() => save('account', account), [account])
  useEffect(() => save('settings', settings), [settings])
  useEffect(() => save('notificationsRead', notificationsRead), [notificationsRead])

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

  // The practice screen's CV gate, and the session it then lets you start.
  const attachCv = useCallback((file) => setAccount((a) => attachResume(a, file)), [])
  const spend = useCallback((credits) => setAccount((a) => spendCredits(a, credits)), [])

  // Settings' own writers. Each takes the same shape the flow it replaces takes,
  // so a profile edited here is indistinguishable from one the wizard collected.
  const saveDetails = useCallback((details) => setAccount((a) => updateDetails(a, details)), [])
  const saveInterviewProfile = useCallback(
    (details) => setAccount((a) => updateInterviewProfile(a, details)),
    [],
  )
  const detachCv = useCallback(() => setAccount((a) => removeResume(a)), [])

  /* The photograph. `readPhoto` squares and shrinks it before it is kept, so
     what the account holds is a small data URL rather than a 5MB file. */
  const savePhoto = useCallback(
    (file) => readPhoto(file).then((avatar) => setAccount((a) => setAvatar(a, avatar))),
    [],
  )

  const removePhoto = useCallback(() => setAccount((a) => clearAvatar(a)), [])

  const saveSettings = useCallback(
    (patch) => setSettings((current) => ({ ...current, ...patch })),
    [],
  )
  const registerPasskey = useCallback(
    (name) =>
      setSettings((current) => ({ ...current, passkeys: [...current.passkeys, makePasskey(name)] })),
    [],
  )
  const removePasskey = useCallback(
    (id) =>
      setSettings((current) => ({
        ...current,
        passkeys: current.passkeys.filter((key) => key.id !== id),
      })),
    [],
  )
  // Revoking never touches the session you are reading the screen on — signing
  // yourself out of the device in your hand is a different action, and it lives
  // in the profile menu.
  const revokeSession = useCallback(
    (id) =>
      setSettings((current) => ({
        ...current,
        sessions: current.sessions.filter((s) => s.current || s.id !== id),
      })),
    [],
  )
  const revokeOtherSessions = useCallback(
    () => setSettings((current) => ({ ...current, sessions: current.sessions.filter((s) => s.current) })),
    [],
  )
  const changePassword = useCallback(
    () => setSettings((current) => ({ ...current, passwordChangedDaysAgo: 0 })),
    [],
  )

  const markNotificationsRead = useCallback(
    (ids) => setNotificationsRead((read) => [...new Set([...read, ...ids])]),
    [],
  )

  const updateCards = useCallback(
    (update) => setAccount((a) => ({ ...a, cards: update(a.cards) })),
    [],
  )

  const value = useMemo(
    () => ({
      account,
      summary: billingSummary(account),
      setAccount,
      settings,
      saveSettings,
      notificationsRead,
      markNotificationsRead,
      saveDetails,
      saveInterviewProfile,
      detachCv,
      savePhoto,
      removePhoto,
      registerPasskey,
      removePasskey,
      revokeSession,
      revokeOtherSessions,
      changePassword,
      cancel,
      renew,
      upgrade,
      schedule,
      keepPlan,
      onboard,
      skipOnboarding,
      attachCv,
      spend,
      updateCards,
      notice,
      setNotice,
    }),
    [
      account,
      notice,
      settings,
      saveSettings,
      notificationsRead,
      markNotificationsRead,
      saveDetails,
      saveInterviewProfile,
      detachCv,
      savePhoto,
      removePhoto,
      registerPasskey,
      removePasskey,
      revokeSession,
      revokeOtherSessions,
      changePassword,
      cancel,
      renew,
      upgrade,
      schedule,
      keepPlan,
      onboard,
      skipOnboarding,
      attachCv,
      spend,
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
