import styles from './Avatar.module.css'

/**
 * The account's face: a photograph when one has been uploaded, initials when
 * not.
 *
 * Initials remain the default and the fallback. What the earlier decision ruled
 * out was a *stock* face — a photograph of someone who never agreed to be in
 * this product — not a picture the account holder chose. `src` is a blob URL
 * made in the browser from the file they picked; there is no backend to send it
 * to, so it lasts the session and no longer.
 */
export function initialsFrom(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 1)
  return parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)
}

export default function Avatar({ name, src, size = 'md', className = '', ...rest }) {
  const initials = initialsFrom(name)
  return (
    <span
      className={`${styles.avatar} ${styles[size]} ${className}`}
      role="img"
      aria-label={name ? `${name} — account` : 'Account'}
      {...rest}
    >
      {/* the alt is empty: the wrapper is the labelled image, and a second
          announcement of the same name is noise */}
      {src ? <img className={styles.photo} src={src} alt="" /> : initials}
    </span>
  )
}
