import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Checkbox, Icon, Select } from '../components/ui/index.js'
import AppHeader from '../components/AppHeader.jsx'
import { PLANS, formatGBP } from '../data/plans.js'
import { TRIAL_DAYS, firstChargeDate, formatDate } from '../data/trial.js'
import styles from './Checkout.module.css'

const COUNTRIES = [
  { value: 'GB', label: 'United Kingdom' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IN', label: 'India' },
  { value: 'AU', label: 'Australia' },
  { value: 'CA', label: 'Canada' },
]

export default function Checkout() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const plan = PLANS.find((p) => p.id === params.get('plan')) || PLANS[1]

  const charge = useMemo(() => formatDate(firstChargeDate()), [])

  // One fallback for a direct visit, so the header avatar and the Name field
  // never disagree about who is signing up.
  const accountName = state?.name || 'Oliver Davies'
  const accountEmail = state?.email || 'oliver.davies@example.com'

  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [holder, setHolder] = useState(state?.name || '')
  const [country, setCountry] = useState('GB')
  const [address, setAddress] = useState('')
  const [save, setSave] = useState(true)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')   // idle | busy

  function handleSubmit(event) {
    event.preventDefault()
    const next = {}
    if (card.replace(/\s/g, '').length < 12) next.card = 'Enter a card number'
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(expiry)) next.expiry = 'Use MM / YY'
    if (cvc.length < 3) next.cvc = 'Enter the CVC'
    if (!holder.trim()) next.holder = 'Enter the name on the card'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    // Prototype only: no payment is taken, and this always succeeds.
    setStatus('busy')
    setTimeout(
      () => navigate(`/signup/preparing?plan=${plan.id}`, { state: { name: state?.name, email: state?.email } }),
      600,
    )
  }

  return (
    <div className={styles.page}>
      <AppHeader name={accountName} controls={false} />

      <main className={styles.wrap}>
        <button type="button" className={styles.back} onClick={() => navigate(-1)} aria-label="Back">
          <Icon name="arrowLeft" size="1.5rem" strokeWidth={2} />
        </button>

        <h1 className={styles.h1}>Review and checkout</h1>

        <div className={styles.columns}>
          {/* ---------------------------------------------------- summary */}
          <section aria-labelledby="charges-heading">
            <h2 className={styles.sectionTitle} id="charges-heading">
              Automatic monthly charges
            </h2>

            <div className={styles.planRow}>
              <div>
                <p className={styles.planName}>{plan.name}</p>
                {/* Figma said "first 15 days"; the trial is 14 days and the first
                    charge lands on day 15, so this states the date and the amount. */}
                <p className={styles.planMeta}>
                  Your first {TRIAL_DAYS} days are free. You can{' '}
                  <Link className={styles.planLink} to="/billing">
                    cancel any time
                  </Link>{' '}
                  before then.
                </p>
                <p className={styles.planMeta}>
                  First charge of {formatGBP(plan.price.monthly)} on {charge}, then monthly.
                </p>
              </div>

              <p className={styles.priceRow}>
                <span className={styles.price}>{formatGBP(plan.price.monthly)}</span>
                <span className={styles.priceUnit}>monthly</span>
              </p>
            </div>

            <div className={styles.summary}>
              <p className={styles.summaryTitle}>Plan summary</p>
              <ul className={styles.features}>
                {plan.features.map((feature) => (
                  <li key={feature} className={styles.feature}>
                    <span className={styles.tick}>
                      <Icon name="check" size="0.75rem" strokeWidth={2} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ---------------------------------------------------- payment */}
          <form className={styles.panel} onSubmit={handleSubmit} noValidate>
            <h2 className={styles.panelTitle}>Payment method</h2>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="co-name">
                Name
              </label>
              <input
                id="co-name"
                className={`${styles.control} ${styles.readOnly}`}
                value={accountName}
                readOnly
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="co-email">
                Email
              </label>
              <input
                id="co-email"
                className={`${styles.control} ${styles.readOnly}`}
                value={accountEmail}
                readOnly
              />
            </div>

            <fieldset className={styles.fieldset}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="co-card">
                  Card information
                </label>
                <span className={styles.cardNumberWrap}>
                  <input
                    id="co-card"
                    className={styles.control}
                    placeholder="1234 1234 1234 1234"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={card}
                    onChange={(e) => setCard(e.target.value)}
                    aria-invalid={errors.card ? true : undefined}
                    aria-describedby={errors.card ? 'co-card-err' : undefined}
                  />
                  <span className={styles.cardIcon}>
                    <Icon name="creditCard" size="1.25rem" strokeWidth={2} />
                  </span>
                </span>
                {errors.card ? (
                  <span className={styles.error} id="co-card-err" role="alert">
                    {errors.card}
                  </span>
                ) : null}
              </div>

              <div className={styles.cardGroup}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="co-exp">
                    Expiry
                  </label>
                  <input
                    id="co-exp"
                    className={styles.control}
                    placeholder="MM / YY"
                    autoComplete="cc-exp"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    aria-invalid={errors.expiry ? true : undefined}
                    aria-describedby={errors.expiry ? 'co-exp-err' : undefined}
                  />
                  {errors.expiry ? (
                    <span className={styles.error} id="co-exp-err" role="alert">
                      {errors.expiry}
                    </span>
                  ) : null}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="co-cvc">
                    CVC
                  </label>
                  <input
                    id="co-cvc"
                    className={styles.control}
                    placeholder="CVC"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    aria-invalid={errors.cvc ? true : undefined}
                    aria-describedby={errors.cvc ? 'co-cvc-err' : undefined}
                  />
                  {errors.cvc ? (
                    <span className={styles.error} id="co-cvc-err" role="alert">
                      {errors.cvc}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="co-holder">
                  Cardholder name
                </label>
                <input
                  id="co-holder"
                  className={styles.control}
                  placeholder="Full name on card"
                  autoComplete="cc-name"
                  value={holder}
                  onChange={(e) => setHolder(e.target.value)}
                  aria-invalid={errors.holder ? true : undefined}
                  aria-describedby={errors.holder ? 'co-holder-err' : undefined}
                />
                {errors.holder ? (
                  <span className={styles.error} id="co-holder-err" role="alert">
                    {errors.holder}
                  </span>
                ) : null}
              </div>

              <Select
                label="Billing address"
                options={COUNTRIES}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />

              <input
                className={styles.control}
                placeholder="Address"
                aria-label="Billing address line"
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </fieldset>

            <Checkbox
              label="Save my payment information for future purchases"
              checked={save}
              onChange={(e) => setSave(e.target.checked)}
            />

            <button type="submit" className={styles.submit} disabled={status === 'busy'}>
              {status === 'busy' ? 'Starting your trial…' : `Start ${TRIAL_DAYS}-day trial`}
            </button>

            <p className={styles.reassure}>
              <span className={styles.reassureIcon}>
                <Icon name="lock" size="0.875rem" strokeWidth={2} />
              </span>
              You won&rsquo;t be charged today. Your card is saved and the first payment of{' '}
              {formatGBP(plan.price.monthly)} is taken on {charge}. Cancel any time before then.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
