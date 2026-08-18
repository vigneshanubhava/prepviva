import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

const SYSTEM_QUERY = '(prefers-color-scheme: dark)'

/**
 * Theme lives in memory only — the brief rules out localStorage/sessionStorage.
 * Switching writes data-theme on <html>; no component markup changes.
 *
 * Three settings, as the profile menu draws them (Figma 1:5099): 'system'
 * follows the OS and keeps following it, 'light' and 'dark' pin it. `theme` is
 * the setting; `resolved` is what is actually on <html>, which is what a
 * control showing the current appearance needs.
 *
 * The default is 'light', not 'system' — doc/BRIEF.md makes light the default,
 * and starting from the OS would make that depend on the machine.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(SYSTEM_QUERY).matches,
  )

  // Only listen while 'system' is selected; a pinned theme ignores the OS.
  useEffect(() => {
    if (theme !== 'system') return undefined
    const query = window.matchMedia(SYSTEM_QUERY)
    const onChange = (event) => setSystemDark(event.matches)
    setSystemDark(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [theme])

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
  }, [resolved])

  const value = useMemo(
    () => ({
      theme,
      resolved,
      setTheme,
      toggleTheme: () => setTheme(resolved === 'light' ? 'dark' : 'light'),
    }),
    [theme, resolved],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
