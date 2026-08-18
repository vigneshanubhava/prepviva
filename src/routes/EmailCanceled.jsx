import { Link, useLocation } from 'react-router-dom'
import EmailCard, { EmailHeroStrong } from '../components/EmailCard.jsx'
import MailClient from '../components/MailClient.jsx'
import { ACCOUNT, accessEndsOn, currentPlan } from '../data/account.js'
import { formatDate } from '../data/trial.js'

/**
 * 34 Email - Subscription Canceled (14:10022).
 *
 * The confirmation that lands after the cancel flow. No email is really sent —
 * the screen is reachable from the confirmation dialog through a clearly
 * marked prototype link, the same affordance the magic-link flow uses.
 *
 * Figma's copy is the template's ("Prep Viva ... an AI analytics platform for
 * finance teams", a Palo Alto address, "Hi Babu!"). The shape of the message is
 * kept — confirm, state the access date, invite feedback, leave the door open —
 * and the words come from the docs. The date is derived, never typed, so it
 * always matches what Billing says.
 */

export default function EmailCanceled() {
  const { state } = useLocation()
  const email = state?.email || ACCOUNT.email
  const name = (state?.name || ACCOUNT.name).split(' ')[0]
  const plan = currentPlan()
  const endsOn = formatDate(state?.accessEnds ? new Date(state.accessEnds) : accessEndsOn())

  return (
    <MailClient
      // Figma: "Your subscription has been cancelled"
      subject="Your subscription has been cancelled"
      tag="Updates"
      to={email}
      timestamp="just now"
      proto={
        <>
          This is a simulated inbox — no email was sent.{' '}
          {/* carries the cancellation back, since nothing is stored */}
          <Link to="/billing" state={{ canceled: true, reason: state?.reason }}>
            Back to billing
          </Link>
        </>
      }
    >
      <EmailCard
        tone="brand"
        heroLine={
          <>
            <EmailHeroStrong>Your practice</EmailHeroStrong>
            <br />
            is here when you are.
          </>
        }
        // Figma: "We're sorry to see you go. 🙁"
        heading="Sorry to see you go 🙁"
        greeting={`Hi ${name}!`}
        footerReason={`You received this because the ${plan.name} subscription on ${email} was cancelled.`}
      >
        <p>
          This confirms that your PrepViva <strong>{plan.name}</strong> subscription has been
          cancelled. You can keep using everything until <strong>{endsOn}</strong>, after which
          billing stops and your account moves to read-only. Nothing further will be charged.
        </p>

        <p>
          If you cancelled because something was missing or in the way, we would genuinely like to
          hear it — reply to this email and it reaches a person.
        </p>

        <p>
          Your session recordings and feedback stay on your account for the retention period on
          your plan, so returning picks up where you left off.
        </p>

        <p>
          Thank you for practising with us.
          <br />— All of us at PrepViva
        </p>
      </EmailCard>
    </MailClient>
  )
}
