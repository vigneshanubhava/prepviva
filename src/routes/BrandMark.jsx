import visaLogo from '../assets/Visa_Inc._logo.svg'
import mastercardLogo from '../assets/mastercard.svg'
import styles from './BrandMark.module.css'

/**
 * Payment brand marks at Figma's 49x16. These keep their own colours — a card
 * scheme's logo is not a themeable surface, so unlike the interface icons they
 * are shipped as assets rather than recoloured from a token.
 */
const MARKS = {
  Visa: visaLogo,
  Mastercard: mastercardLogo,
}

export default function BrandMark({ brand, className = '' }) {
  const src = MARKS[brand]
  if (!src) return null
  return (
    <img
      className={`${styles.mark} ${className}`}
      src={src}
      alt=""
      width="49"
      height="16"
    />
  )
}
