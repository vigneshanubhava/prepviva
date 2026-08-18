import { useRef } from 'react'
import { Icon, Modal } from '../components/ui/index.js'
import BrandMark from './BrandMark.jsx'
import styles from './ManageCards.module.css'

/**
 * Manage cards — the right-hand panel on Figma node 29:4853 (455px wide,
 * sitting under the app header over a scrim).
 *
 * The artboard lists twelve payment *brands*. This lists the cards actually on
 * the account; see the note on ACCOUNT.cards in src/data/account.js.
 *
 * Nothing is really added or removed — the panel's own copy says payment
 * methods are handled in Stripe, and this prototype has no Stripe.
 */

export default function ManageCards({
  open,
  onClose,
  cards,
  onMakeDefault,
  onRemove,
  className = '',
  scrimClassName = '',
}) {
  const listRef = useRef(null)

  /**
   * Both actions delete the button that was clicked — promoting a card swaps
   * its button for a tag, removing one takes the whole row away. Focus would
   * fall to <body>, which drops it out of the dialog and breaks the trap, so
   * it is moved to the panel heading and announced there.
   */
  function afterAction(run) {
    return (id) => {
      run(id)
      requestAnimationFrame(() => {
        const heading = listRef.current?.closest('[role="dialog"]')?.querySelector('h2')
        heading?.focus()
      })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      placement="drawer"
      title="Manage cards"
      closeLabel="Close manage cards"
      className={`${styles.panel} ${className}`}
      scrimClassName={scrimClassName}
    >
      <p className={styles.note}>
        For security, adding or updating payment methods is handled directly in Stripe.
      </p>

      <ul className={styles.list} ref={listRef}>
        {cards.map((card) => (
          <li key={card.id}>
            <div className={`${styles.card} ${card.default ? styles.cardDefault : ''}`}>
              <span className={styles.brand}>
                <BrandMark brand={card.brand} />
              </span>

              <div className={styles.details}>
                <p className={styles.name}>
                  {card.brand} card ending {card.last4}
                </p>
                {/* Figma: "Expire on 06/32" */}
                <p className={styles.expiry}>Expires {card.expires}</p>
              </div>

              <div className={styles.actions}>
                {card.default ? (
                  <span className={styles.tag}>Default</span>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.setDefault}
                      onClick={() => afterAction(onMakeDefault)(card.id)}
                    >
                      Set as default
                    </button>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => afterAction(onRemove)(card.id)}
                      aria-label={`Remove ${card.brand} card ending ${card.last4}`}
                    >
                      <Icon name="trash" size="16px" strokeWidth={1.5} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {cards.length === 0 ? (
        <p className={styles.empty}>No cards saved. Add one in Stripe to keep practising.</p>
      ) : null}
    </Modal>
  )
}
