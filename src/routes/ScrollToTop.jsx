import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * A browser resets scroll on a real page load; a client-side router does not, so
 * navigating from a scrolled screen lands you part-way down the next one.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
