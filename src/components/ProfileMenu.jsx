import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarUpload, Icon, useToast } from './ui/index.js'
import { useAccount } from '../data/AccountProvider.jsx'
import { useTheme } from '../theme/ThemeProvider.jsx'
import { PHOTO_MAX_MB, PHOTO_TYPES } from '../data/onboarding.js'
import styles from './ProfileMenu.module.css'

/**
 * 18 Home - User Profile Dropdown Menu (1:4997), the menu itself at 1:5099.
 *
 * The account block, the theme setting and the two links. This is where the
 * theme toggle the brief asks for finally lives in the app rather than only on
 * /kitchen-sink — Settings is not built, and the artboard puts it here anyway.
 *
 * Figma's second link is "Admin". doc/BRIEF.md deletes the Admin variant
 * outright, so it is Settings — the same destination the left nav already has,
 * and the same gear glyph the artboard draws.
 */

const THEMES = [
  { value: 'system', label: 'System', icon: 'contrast' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
]

export default function ProfileMenu({ name, email }) {
  const [open, setOpen] = useState(false)
  const { account, savePhoto, removePhoto } = useAccount()
  const [photoError, setPhotoError] = useState(null)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open) menuRef.current?.querySelector('[role^="menuitem"]')?.focus()
  }, [open])

  function moveFocus(step) {
    const nodes = [...(menuRef.current?.querySelectorAll('[role^="menuitem"]') || [])]
    if (nodes.length === 0) return
    const at = nodes.indexOf(document.activeElement)
    nodes[(at + step + nodes.length) % nodes.length].focus()
  }

  /* The theme row runs across and the links run down, so both axes move
     through the same list — which is also what a screen reader announces. */
  function onMenuKeyDown(event) {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
    if (step) {
      event.preventDefault()
      moveFocus(step)
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  function go(to) {
    setOpen(false)
    navigate(to)
  }

  return (
    <span className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        ref={buttonRef}
        className={styles.trigger}
        aria-label={`Account — ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
          }
        }}
      >
        <Avatar name={name} src={account.avatar?.url} aria-hidden="true" />
      </button>

      {open ? (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
          className={styles.menu}
          role="menu"
          aria-label="Account"
          ref={menuRef}
          onKeyDown={onMenuKeyDown}
        >
          {/* Figma draws a photograph here, and now so can the account holder:
              their own picture, chosen by them, or the initials they get by
              default. What was ruled out was a stock face standing in for a
              person who never agreed to be here.

              The picture is the button — a camera badge on the circle, the
              browser's own file dialog behind it. A link reading "Add a photo"
              said the same thing in more words and further from the thing it
              changed. */}
          <div className={styles.account}>
            <AvatarUpload
              className={styles.photo}
              name={name}
              src={account.avatar?.url}
              size="lg"
              itemRole="menuitem"
              accept={PHOTO_TYPES}
              maxMB={PHOTO_MAX_MB}
              onSelect={(file) => {
                setPhotoError(null)
                return savePhoto(file).then(() =>
                  toast({ tone: 'success', title: 'Photo updated' }),
                )
              }}
              onRemove={() => {
                setPhotoError(null)
                removePhoto()
                toast({ tone: 'success', title: 'Photo removed' })
              }}
              onReject={(message) => setPhotoError(message)}
            />

            <p className={styles.email}>{email}</p>

            {photoError ? (
              <p className={styles.photoError} role="alert">
                {photoError}
              </p>
            ) : null}
          </div>

          <hr className={styles.rule} />

          <div className={styles.themes} role="group" aria-label="Appearance">
            {THEMES.map((option) => {
              const selected = theme === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  className={styles.theme}
                  onClick={() => setTheme(option.value)}
                >
                  <span className={`${styles.tile} ${selected ? styles.tileOn : ''}`}>
                    <Icon name={option.icon} size="16px" strokeWidth={1.5} />
                  </span>
                  <span className={styles.themeLabel}>{option.label}</span>
                </button>
              )
            })}
          </div>

          <hr className={styles.rule} />

          <div className={styles.links}>
            {/* Figma: "Admin" */}
            <button type="button" role="menuitem" className={styles.link} onClick={() => go('/settings')}>
              <Icon name="settings" size="var(--profile-icon)" strokeWidth={1.5} />
              Settings
            </button>
            <button type="button" role="menuitem" className={styles.link} onClick={() => go('/login')}>
              <Icon name="logOut" size="var(--profile-icon)" strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </span>
  )
}
