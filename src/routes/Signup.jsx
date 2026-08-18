import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Checkbox, VisuallyHidden } from '../components/ui/index.js'
import { PLANS, formatGBP } from '../data/plans.js'
import { TRIAL_CREDITS, TRIAL_DAYS, firstChargeDate, formatDate } from '../data/trial.js'
import banner from '../assets/signup/banner.png'
import logoMark from '../assets/signup/logo-mark.png'
import googleMark from '../assets/signup/google.png'
import styles from './Signup.module.css'

/**
 * The perforated ticket edge either side of the promo strip. Figma exports this
 * with a baked white fill, which is the card colour — inlined so it follows the
 * card in dark mode instead of punching white holes.
 */
function PromoNotch({ className }) {
  return (
    <svg className={className} viewBox="0 0 7.5 55" fill="currentColor" aria-hidden="true">
      {[3.75, 13.25, 22.75, 32.25, 41.75, 51.25].map((cy) => (
        <circle key={cy} cx="3.75" cy={cy} r="3.75" />
      ))}
    </svg>
  )
}

export default function Signup() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const plan = PLANS.find((p) => p.id === params.get('plan')) || PLANS[1]

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState({})

  // The brief requires every trial screen to state both the date and the amount.
  const charge = useMemo(() => formatDate(firstChargeDate()), [])

  function handleSubmit(event) {
    event.preventDefault()
    const next = {}
    if (!name.trim()) next.name = 'Tell us what to call you'
    if (!email.trim()) next.email = 'Enter your email address'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address'
    if (!agreed) next.agreed = 'Accept the terms to continue'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    // Carry the details forward in router state — the brief rules out storage.
    navigate(`/signup/checkout?plan=${plan.id}`, { state: { name, email } })
  }

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <img className={styles.banner} src={banner} alt="" />

        <div className={styles.card}>
          <div className={styles.logo}>
            <img className={styles.logoMark} src={logoMark} alt="" />
            <span className={styles.logoText}>PrepViva</span>
          </div>

          <div className={styles.body}>
            <div className={styles.headings}>
              <h1 className={styles.h1}>Sign-up</h1>
              {/* Two lines, but still carrying both the date and the amount —
                  doc/BRIEF.md requires every trial screen to state each. */}
              <p className={styles.lede}>
                You&rsquo;re starting a {TRIAL_DAYS}-day trial of{' '}
                <span className={styles.plan}>{plan.name}</span> &mdash; {TRIAL_CREDITS} credits included.
                <br />
                No charge until {charge}, then {formatGBP(plan.price.monthly)} a month. Cancel any
                time before then.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <VisuallyHidden as="label" htmlFor="signup-name">
                  What should we call you?
                </VisuallyHidden>
                <input
                  id="signup-name"
                  className={styles.input}
                  placeholder="What should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? 'signup-name-err' : undefined}
                  autoComplete="name"
                />
                {errors.name ? (
                  <span className={styles.error} id="signup-name-err" role="alert">
                    {errors.name}
                  </span>
                ) : null}
              </div>

              <div className={styles.field}>
                <VisuallyHidden as="label" htmlFor="signup-email">
                  Email address — you&rsquo;ll sign in with this
                </VisuallyHidden>
                <input
                  id="signup-email"
                  className={styles.input}
                  type="email"
                  placeholder="Email address — you'll sign in with this"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? 'signup-email-err' : undefined}
                  autoComplete="email"
                />
                {errors.email ? (
                  <span className={styles.error} id="signup-email-err" role="alert">
                    {errors.email}
                  </span>
                ) : null}
              </div>

              <div className={styles.promoWrap}>
                <PromoNotch className={`${styles.notch} ${styles.notchLeft}`} />
                <div className={styles.promo}>
                  <div className={styles.promoText}>
                    <span className={styles.promoTitle}>Have a promo code?</span>
                    <span className={styles.promoSub}>Add promo code to get additional credits.</span>
                  </div>
                  <button type="button" className={styles.promoBtn}>
                    Add promo code
                  </button>
                </div>
                <PromoNotch className={`${styles.notch} ${styles.notchRight}`} />
              </div>

              <Checkbox
                label={
                  <span className={styles.terms}>
                    I agree to the{' '}
                    <Link className={styles.termsLink} to="/terms">
                      Terms &amp; Conditions
                    </Link>
                  </span>
                }
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                error={errors.agreed}
              />

              <button type="submit" className={styles.continue}>
                Continue
              </button>

              <div className={styles.divider}>
                <span className={styles.rule} />
                <span className={styles.or}>or</span>
                <span className={styles.rule} />
              </div>

              <button type="button" className={styles.google}>
                <img className={styles.googleMark} src={googleMark} alt="" />
                Sign up with Google
              </button>
            </form>
          </div>

          <p className={styles.footer}>
            Have an account?{' '}
            <Link className={styles.footerLink} to="/login">
              Login
            </Link>{' '}
            Here
          </p>
        </div>
      </div>
    </main>
  )
}
