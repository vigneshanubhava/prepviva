import { Link, useLocation, useNavigate } from 'react-router-dom'
import EmailCard, { EmailHeroStrong } from '../components/EmailCard.jsx'
import MailClient from '../components/MailClient.jsx'
import styles from './EmailMagicLink.module.css'

/**
 * 14 Email - Magic Link (14:10469).
 *
 * The artboard is a Gmail window with a PrepViva email inside it: the window is
 * MailClient, the card is EmailCard, and only the wording and the sign-in
 * button are here. Every word comes from the docs — the Figma's copy
 * ("Decisions, not duels, with data", an analytics platform for finance teams)
 * belongs to the B2B template this file was built on.
 */

export default function EmailMagicLink() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email || 'oliver.davies@example.com'

  function openLink(event) {
    event.preventDefault()
    // Prototype only: the link always resolves. It goes through the signing-in
    // loader rather than straight to the app — an instant landing reads as a
    // page swap, not a sign-in. That screen carries on to Billing.
    navigate('/login/signing-in', { state: { email } })
  }

  return (
    <MailClient
      subject="Your PrepViva sign-in link 🚀"
      to={email}
      proto={
        <>
          This is a simulated inbox — no email was sent. Clicking{' '}
          <strong>Open PrepViva</strong> signs you in. <Link to="/login">Back to sign in</Link>
        </>
      }
    >
      <EmailCard
        heroLine={
          <>
            <EmailHeroStrong>Real practice.</EmailHeroStrong>
            <br />
            Real progress.
          </>
        }
        heading="Come on board! 🚀"
        greeting="Hi!"
        footerReason={`You received this because someone asked for a sign-in link for ${email}.`}
      >
        <p>
          You asked for a sign-in link for {email}. Click the secure link below to open your
          account:
        </p>

        <a className={styles.cta} href="/login/signing-in" onClick={openLink}>
          Open PrepViva
        </a>

        <p>
          The link signs you in on this device and expires in 15 minutes. If you didn&rsquo;t ask
          for it, you can ignore this email — nothing will change.
          <br />
          See you soon!
          <br />— All of us at PrepViva
        </p>
      </EmailCard>
    </MailClient>
  )
}
