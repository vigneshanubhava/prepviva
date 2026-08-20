import { useEffect, useMemo, useState } from 'react'

/* ── a draft of one section's answers ────────────────────────────────────────
   A settings form that writes on every keystroke has no Cancel, and one that
   writes on blur cannot be reviewed. So each section edits a copy, and the save
   bar appears the moment the copy differs from what is committed.

   The comparison is by value, not by reference: `committed` is rebuilt on every
   render from the account, so an identity check would say "dirty" forever. It
   also means an edit made elsewhere — the prototype controls panel resetting
   the account — resyncs the draft rather than leaving a stale one on screen.
   Everything held in a draft here is strings, booleans and arrays of strings. */
export function useDraft(committed) {
  const key = JSON.stringify(committed)
  const [draft, setDraft] = useState(committed)

  useEffect(() => {
    setDraft(JSON.parse(key))
  }, [key])

  const dirty = useMemo(() => JSON.stringify(draft) !== key, [draft, key])

  return {
    draft,
    dirty,
    set: (patch) => setDraft((current) => ({ ...current, ...patch })),
    reset: () => setDraft(JSON.parse(key)),
  }
}
