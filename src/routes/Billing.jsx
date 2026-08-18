import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner, Button, Icon, useToast } from '../components/ui/index.js'
import { Tabs, TabList, Tab, TabPanel } from '../components/ui/index.js'
import AppLayout from '../components/AppLayout.jsx'
import BillingMenu from './BillingMenu.jsx'
import CancelSubscription from './CancelSubscription.jsx'
import ManageCards from './ManageCards.jsx'
import RecordsTable from './RecordsTable.jsx'
import StatusTag from './StatusTag.jsx'
import BrandMark from './BrandMark.jsx'
import { useAccount } from '../data/AccountProvider.jsx'
import { billingSummary, invoices, renewSubscription, transactions } from '../data/account.js'
import { TRIAL_CREDITS } from '../data/trial.js'
import styles from './Billing.module.css'

/**
 * 19 Billing - Starter Plan Free Trial (1:5133).
 *
 * Layout from Figma. Every figure comes from account.js, which derives them
 * from plans.js and trial.js — the artboard's $49, 30k-of-50k credits, "Trail",
 * "Expire on 06/32" and "15 days" all belong to the B2B template.
 */

const INVOICE_COLUMNS = [
  { key: 'number', label: 'Invoice number', width: 'number', sortable: true,
    value: (r) => r.reference, render: (r) => `Invoice #${r.reference}` },
  { key: 'due', label: 'Due date', width: 'due', sortable: false,
    value: (r) => r.dueLabel },
  { key: 'status', label: 'Status', width: 'std', sortable: true,
    value: (r) => r.statusLabel,
    render: (r) => <StatusTag tone={r.status}>{r.statusLabel}</StatusTag> },
  // Figma: "Trail"
  { key: 'plan', label: 'Plan name', width: 'std', sortable: true, value: (r) => r.planName },
  { key: 'amount', label: 'Amount', width: 'std', sortable: true,
    value: (r) => r.amount, render: (r) => r.amountLabel },
  { key: 'duration', label: 'Duration', width: 'std', sortable: true, value: (r) => r.duration },
  { key: 'issued', label: 'Invoice date', width: 'date', sortable: true,
    value: (r) => r.issued.getTime(), render: (r) => r.issuedLabel },
]

/**
 * Transactions has no artboard, so it borrows the invoice table's anatomy:
 * same widths scale, same status pill, same toolbar.
 */
const TRANSACTION_COLUMNS = [
  { key: 'date', label: 'Date', width: 'due', sortable: true,
    value: (r) => r.date.getTime(), render: (r) => r.dateLabel },
  { key: 'description', label: 'Description', width: 'desc', sortable: true,
    value: (r) => r.description },
  { key: 'method', label: 'Payment method', width: 'method', sortable: false,
    value: (r) => r.method },
  { key: 'amount', label: 'Amount', width: 'std', sortable: true,
    value: (r) => r.amount, render: (r) => r.amountLabel },
  { key: 'status', label: 'Status', width: 'status', sortable: true,
    value: (r) => r.statusLabel,
    render: (r) => <StatusTag tone={r.status}>{r.statusLabel}</StatusTag> },
]

export default function Billing() {
  // The account is shared for the session — the upgrade flow changes it on
  // Manage plan and this screen shows the result. See AccountProvider.
  const {
    account,
    summary,
    cancel: applyCancel,
    renew: applyRenew,
    updateCards,
    keepPlan,
    notice,
    setNotice,
  } = useAccount()
  const [cardsOpen, setCardsOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(true)
  const { toast } = useToast()

  const invoiceRows = useMemo(() => invoices(account), [account])
  const transactionRows = useMemo(() => transactions(account), [account])

  const [tab, setTab] = useState('invoices')

  /**
   * Artboard 43 (1:10758) lands here from Manage plan with a toast confirming
   * the new plan. The message is left on the shared account and raised once —
   * router state would survive a back-navigation and fire again.
   */
  // StrictMode runs an effect twice on mount, and the second pass still sees
  // the notice the first one raised — the message would land as two toasts.
  const noticeShown = useRef(null)

  useEffect(() => {
    if (!notice || noticeShown.current === notice) return
    noticeShown.current = notice
    toast({ tone: 'success', title: notice })
    setNotice(null)
  }, [notice, setNotice, toast])

  function makeDefault(id) {
    updateCards((cards) => cards.map((c) => ({ ...c, default: c.id === id })))
  }

  function removeCard(id) {
    updateCards((cards) => {
      const next = cards.filter((c) => c.id !== id)
      // never leave the account without a card to charge
      if (next.length > 0 && !next.some((c) => c.default)) next[0] = { ...next[0], default: true }
      return next
    })
  }

  function cancel(reason) {
    applyCancel(reason)
    setBannerOpen(true)
  }

  /**
   * Renew, from the banner, the plan card or the hero menu. Figma has no
   * artboard for the result, so it borrows the pattern artboard 43 uses for
   * the upgrade — a toast that states the date and the amount.
   */
  /**
   * Drop a scheduled change (artboard 55's button, in this direction).
   *
   * The strip and its button go with the change, so focus would fall to
   * <body>. It moves once the re-render has happened — moving it inside the
   * handler does not survive a keyboard activation, where the button is
   * removed while the key is still being processed.
   */
  const planLinkRef = useRef(null)
  const reverting = useRef(false)

  useEffect(() => {
    if (summary.pending || !reverting.current) return
    reverting.current = false
    // A keyboard activation is still in flight when the effect runs, and the
    // browser's own fixup for the removed button lands after it — so this waits
    // for the frame the removal is painted in.
    const frame = requestAnimationFrame(() => planLinkRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [summary.pending])

  function keepCurrent() {
    reverting.current = true
    keepPlan()
    toast({
      tone: 'success',
      title: `Staying on ${summary.plan.name}`,
      body: `The downgrade is cancelled. Next charge of ${summary.amountLabel} on ${summary.chargeDateLabel}.`,
    })
  }

  function renew() {
    // The toast is raised outside the updater: React may run an updater during
    // render, and a setState from there lands in another component mid-render.
    const after = billingSummary(renewSubscription(account))
    applyRenew()
    toast({
      tone: 'success',
      title: 'Subscription renewed',
      body: `Your ${after.plan.name} plan continues. ${
        after.trialing ? 'First charge' : 'Next charge'
      } of ${after.amountLabel} on ${after.chargeDateLabel}.`,
    })
  }

  return (
    <AppLayout>
      <div className={styles.stack}>
        {/* 33 Canceled Banner with Renew Option (1:9718) — the artboard runs it
            edge to edge directly under the app header, above the hero. It waits
            for the confirmation dialog to be dismissed, so 32 and 33 stay the
            two separate moments the artboards draw rather than one stacked one. */}
        {summary.canceled && bannerOpen && !cancelOpen ? (
          <Banner
            className={styles.notice}
            title="Your subscription has been cancelled."
            onDismiss={() => setBannerOpen(false)}
            dismissLabel="Dismiss the cancellation notice"
            actions={
              <Button variant="primary" size="sm" className={styles.noticeBtn} onClick={renew}>
                Renew subscription
              </Button>
            }
          >
            You can keep using everything until{' '}
            <span className={styles.noticeStrong}>{summary.accessEndsLabel}</span>. If you would
            like to keep your access beyond that date, you can renew any time.
          </Banner>
        ) : null}

        <div className={styles.masthead}>
          {/* ------------------------------------------------------------ hero */}
          <section className={styles.hero} aria-labelledby="billing-heading">
            <div className={styles.heroTop}>
              <div className={styles.heroTitle}>
                <span className={styles.heroIcon}>
                  <Icon name="poundCircle" size="18px" strokeWidth={1.5} />
                </span>
                <h1 className={styles.h1} id="billing-heading">
                  Billing and invoices
                </h1>
              </div>

              <div className={styles.heroActions}>
                <Link className={styles.heroBtn} to="/billing/manage-plan">
                  <Icon name="upload" size="16px" strokeWidth={1.5} />
                  Manage plan
                </Link>
                {/* 25 Cancel Reason Dropdown Open (1:6544) — one item, and the
                    opposite one once the subscription is already cancelled. */}
                <BillingMenu
                  items={
                    summary.canceled
                      ? [{ id: 'renew', label: 'Renew subscription', onSelect: renew }]
                      : [
                          /* 55 (1:15222) opens this menu on a scheduled
                             downgrade; the way back out belongs in it. */
                          ...(summary.pending
                            ? [
                                {
                                  id: 'revert',
                                  label: summary.pending.revertLabel,
                                  onSelect: keepCurrent,
                                },
                              ]
                            : []),
                          {
                            id: 'cancel',
                            label: 'Cancel subscription',
                            tone: 'danger',
                            onSelect: () => setCancelOpen(true),
                          },
                        ]
                  }
                />
              </div>
            </div>

          {/* Figma: "Easily track, download, and manage all your invoices in one
              place. Review payment history, update billing details, and generate
              receipts instantly for your records." Trimmed to what this product
              actually offers. */}
          <p className={styles.heroLede}>
            Your plan, your credits and every invoice in one place. Update the card we keep on
            file or download a receipt whenever you need one.
          </p>
          </section>

          {/* ----------------------------------------------------------- cards */}
          <div className={`${styles.cards} ${summary.canceled ? styles.cardsCanceled : ''}`}>
            {/* -- plan -- */}
            <section className={styles.card} aria-labelledby="plan-card">
              {/* the glyph follows the plan — see plans.js */}
              <span className={styles.cardIcon} aria-hidden="true">
                <Icon name={summary.plan.icon} size="26px" strokeWidth={1.5} />
              </span>

              <div className={styles.cardHead}>
                <h2 className={styles.cardTitle} id="plan-card">
                  {summary.plan.name}
                </h2>
                <Link className={styles.cardLink} to="/billing/manage-plan" ref={planLinkRef}>
                  Manage subscription
                </Link>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.statRow}>
                  <span className={styles.stat}>{summary.amountLabel}</span>
                  <span className={styles.statUnit}>per month</span>
                </p>
                {summary.pending ? (
                  /* A downgrade waiting for the period to end — artboard 55
                     (1:15222). Same strip as the cancelled one, in the tone
                     that says "scheduled", not "gone". */
                  <p className={`${styles.canceled} ${styles.scheduled}`}>
                    <span className={styles.scheduledFlag}>{summary.pending.title}.</span>
                    <span className={styles.canceledMeta}>Plan will take effect from</span>
                    <span className={styles.canceledDate}>
                      {summary.pending.effectiveOnLabel}
                    </span>
                    {/* Figma labels this "Renew", which is the cancel strip's
                        word — nothing has lapsed here. It reverts. */}
                    <Button
                      variant="primary"
                      size="sm"
                      className={styles.renew}
                      onClick={keepCurrent}
                      aria-label={`${summary.pending.revertLabel} and stay on ${summary.plan.name} ${summary.periodLabel}`}
                    >
                      Revert
                    </Button>
                  </p>
                ) : summary.canceled ? (
                  /* 33 (1:9536) — the renewal line is replaced by the strip that
                     says when the access already paid for runs out. */
                  <p className={styles.canceled}>
                    <span className={styles.canceledFlag}>Subscription cancelled.</span>
                    <span className={styles.canceledMeta}>Access active until</span>
                    <span className={styles.canceledDate}>{summary.accessEndsLabel}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      className={styles.renew}
                      onClick={renew}
                      aria-label={`Renew the ${summary.plan.name} subscription`}
                    >
                      Renew
                    </Button>
                  </p>
                ) : (
                  /* Figma says "Next auto renewal on <date>". Nothing renews during
                     a trial — this is the first charge, and doc/BRIEF.md requires
                     the date and the amount together. */
                  <p className={styles.cardMeta}>
                    {summary.trialing ? 'First charge of ' : 'Next charge of '}
                    <span className={styles.cardMetaStrong}>{summary.amountLabel}</span> on{' '}
                    <span className={styles.cardMetaStrong}>{summary.chargeDateLabel}</span>
                  </p>
                )}
              </div>
            </section>

            {/* -- credits -- */}
            <section className={styles.card} aria-labelledby="credits-card">
              <span className={styles.cardIcon} aria-hidden="true">
                <Icon name="sparkle" size="26px" strokeWidth={1.5} />
              </span>

              <div className={styles.cardHead}>
                <h2 className={styles.cardTitle} id="credits-card">
                  Credit usage
                </h2>
                {/* Credits are always stated twice — the number and what it buys.
                    This sits on the sub-line the other two cards use for their
                    link, so the card keeps Figma's 148px height. */}
                <p className={styles.cardSub}>
                  {summary.credits.remaining} left &mdash;{' '}
                  {summary.credits.remainingInPlainTerms}
                </p>
              </div>

              <div className={`${styles.cardBody} ${styles.cardBodyGap}`}>
                <p className={styles.statRow}>
                  <span className={styles.stat}>{summary.credits.used}</span>
                  <span className={styles.statUnitWide}>
                    of {summary.credits.allowance}{' '}
                    {summary.trialing ? 'trial credits' : 'credits'} used
                  </span>
                </p>

                <span
                  className={styles.track}
                  role="progressbar"
                  aria-valuenow={summary.credits.used}
                  aria-valuemin={0}
                  aria-valuemax={summary.credits.allowance}
                  aria-label={`${summary.credits.used} of ${summary.credits.allowance} credits used`}
                >
                  <span
                    className={styles.fill}
                    style={{ inlineSize: `${summary.credits.percentUsed}%` }}
                  />
                </span>
              </div>
            </section>

            {/* -- card on file -- */}
            <section className={styles.card} aria-labelledby="payment-card">
              <span className={styles.cardIcon} aria-hidden="true">
                <Icon name="creditCard" size="26px" strokeWidth={1.5} />
              </span>

              <div className={styles.cardHead}>
                <h2 className={styles.cardTitle} id="payment-card">
                  Payment details
                </h2>
                <button type="button" className={styles.cardLink} onClick={() => setCardsOpen(true)}>
                  Manage card
                </button>
              </div>

              <div className={styles.cardPayment}>
                {summary.card ? (
                  <>
                    <BrandMark brand={summary.card.brand} className={styles.brand} />
                    <div>
                      <p className={styles.cardNumber}>
                        {summary.card.brand} card ending {summary.card.last4}
                      </p>
                      {/* Figma: "Expire on 06/32" */}
                      <p className={styles.cardMeta}>Expires {summary.card.expires}</p>
                    </div>
                  </>
                ) : (
                  <p className={styles.cardMeta}>
                    No card on file. Add one before {summary.chargeDateLabel}.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* ------------------------------------------------- tabs and table */}
        <Tabs value={tab} onChange={setTab} className={styles.tabs}>
          <div className={styles.tabBar}>
            {/* Figma: "Pervious invoice" */}
            <TabList label="Billing records">
              <Tab value="invoices">Previous invoices</Tab>
              <Tab value="transactions">Transactions</Tab>
            </TabList>
          </div>

          <TabPanel value="invoices">
            <RecordsTable
              label={`Invoices for the ${summary.plan.name} plan`}
              columns={INVOICE_COLUMNS}
              rows={invoiceRows}
              defaultSort={{ key: 'issued', dir: 'desc' }}
              searchLabel="Search invoices"
              searchPlaceholder="Search invoices…"
              downloadLabel="Download invoice"
              rowLabel={(r) => `invoice ${r.reference}`}
              emptyLabel="No invoices match"
            />
          </TabPanel>

          <TabPanel value="transactions">
            {transactionRows.length === 0 ? (
              // Only reachable on a trial, when nothing has been charged yet.
              <p className={styles.empty}>
                No transactions yet. Your {TRIAL_CREDITS} trial credits are free, and the first
                payment of {summary.amountLabel} is taken on {summary.chargeDateLabel}.
              </p>
            ) : (
              <RecordsTable
                label={`Card transactions for the ${summary.plan.name} plan`}
                columns={TRANSACTION_COLUMNS}
                rows={transactionRows}
                defaultSort={{ key: 'date', dir: 'desc' }}
                searchLabel="Search transactions"
                searchPlaceholder="Search transactions…"
                downloadLabel="Download receipt"
                rowLabel={(r) => `the ${r.amountLabel} charge on ${r.dateLabel}`}
                emptyLabel="No transactions match"
              />
            )}
          </TabPanel>
        </Tabs>
      </div>

      <ManageCards
        scrimClassName={styles.drawerScrim}
        open={cardsOpen}
        onClose={() => setCardsOpen(false)}
        cards={account.cards}
        onMakeDefault={makeDefault}
        onRemove={removeCard}
      />

      <CancelSubscription
        open={cancelOpen}
        summary={summary}
        onConfirm={cancel}
        onClose={() => setCancelOpen(false)}
      />
    </AppLayout>
  )
}
