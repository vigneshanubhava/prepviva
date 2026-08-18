import styles from './Avatar.module.css'

/**
 * Initials avatar. No photograph: the prototype has no real users, and a stock
 * face reads as a real person who hasn't consented to being here.
 */
export function initialsFrom(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 1)
  return parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)
}

export default function Avatar({ name, size = 'md', className = '', ...rest }) {
  const initials = initialsFrom(name)
  return (
    <span
      className={`${styles.avatar} ${styles[size]} ${className}`}
      role="img"
      aria-label={name ? `${name} — account` : 'Account'}
      {...rest}
    >
      {initials}
    </span>
  )
}
