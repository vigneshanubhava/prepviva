import {
  Banner,
  Button,
  Checkbox,
  ChoiceCards,
  Icon,
  Input,
  Select,
} from '../components/ui/index.js'
import { DIFFICULTY, MODES, costOf, isCircuit, summaryRows } from '../data/practice.js'
import styles from './SessionConfig.module.css'

/**
 * The four steps of the session configurator, and the rail beside them.
 *
 * Ported from the reference prototype's `features/session-config/`. The claim
 * the split is there to hold up: **nothing here knows about a particular
 * track**. Every field, option and limit comes from `data/practice.js`, so a
 * fourth track is a config entry rather than a new screen.
 */

/* ── step 1 · context ─────────────────────────────────────────────────────
   What the interview is for. Shapes the questions, not the price.
   ────────────────────────────────────────────────────────────────────── */
export function StepContext({ config, ctx, setCtx }) {
  function update(key, value) {
    setCtx((current) => {
      const next = { ...current, [key]: value }
      /* a field that depends on this one is now answering a different
         question — clear it rather than leave a stale answer that looks
         deliberate */
      config.context.forEach((f) => {
        if (f.gatedBy === key) delete next[f.key]
      })
      return next
    })
  }

  return (
    <div className={styles.step}>
      <p className={styles.stepLede}>
        Tell us what you are interviewing for. This shapes the questions, not the price.
      </p>

      <div className={styles.panel}>
        <div className={styles.fields}>
          {config.context.map((f) => {
            const gated = f.gatedBy && !ctx[f.gatedBy]
            const options = f.optionsBy ? f.optionsBy[ctx[f.gatedBy]] || [] : f.options || []

            return f.type === 'select' ? (
              <Select
                key={f.key}
                label={f.label}
                required={f.required}
                optional={!f.required}
                placeholder={gated ? f.gatePrompt : 'Select one'}
                disabled={gated}
                value={ctx[f.key] || ''}
                options={options.map((option) => ({ value: option, label: option }))}
                onChange={(event) => update(f.key, event.target.value)}
              />
            ) : (
              <Input
                key={f.key}
                label={f.label}
                optional={!f.required}
                required={f.required}
                maxLength={80}
                placeholder={f.placeholder}
                value={ctx[f.key] || ''}
                onChange={(event) => update(f.key, event.target.value)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── step 2 · format ──────────────────────────────────────────────────────
   The only step where the price moves. Every option says what it costs and
   what it would take to afford it, so the wall is visible before it is hit.
   ────────────────────────────────────────────────────────────────────── */
export function StepFormat({ config, format, setFormat, setStations, cost, balance, affordable }) {
  const circuit = isCircuit(config)
  const sizes = circuit ? config.format.stations : config.format.lengths

  /* the cheapest option that is still affordable — the way out the wall offers */
  const cheapest = sizes.find((size) =>
    circuit
      ? costOf(config, { ...format, stations: size }) <= balance
      : costOf(config, { duration: size }) <= balance,
  )

  return (
    <div className={styles.step}>
      <p className={styles.stepLede}>
        {circuit ? 'Set your circuit size.' : 'Set the length.'} This is the only step where the
        cost changes — after this it is locked.
      </p>

      <fieldset className={styles.panel}>
        {/* the group's name for a screen reader; the heading you can see is the
            paragraph under it, because a <legend> renders on the card's edge */}
        <legend className={styles.visuallyHidden}>{circuit ? 'Stations' : 'Duration'}</legend>
        <p className={styles.eyebrow}>{circuit ? 'Stations' : 'Duration'}</p>

        <div className={styles.sizes}>
          {sizes.map((size) => {
            const on = circuit ? format.stations === size : format.duration === size
            const price = circuit
              ? costOf(config, { ...format, stations: size })
              : costOf(config, { duration: size })
            const can = price <= balance

            return (
              <label key={size} className={styles.size} data-on={on || undefined} data-over={!can || undefined}>
                <input
                  className={styles.native}
                  type="radio"
                  name={circuit ? 'stations' : 'duration'}
                  checked={on}
                  onChange={() =>
                    circuit ? setStations(size) : setFormat((f) => ({ ...f, duration: size }))
                  }
                />
                <span className={styles.sizeFigure}>{size}</span>
                <span className={styles.sizeUnit}>{circuit ? 'stations' : 'minutes'}</span>
                <span className={styles.sizeCost}>
                  {can ? `${price} credits` : `needs ${price - balance} more`}
                </span>
              </label>
            )
          })}
        </div>

        {circuit ? (
          <div className={styles.subField}>
            <ChoiceCards
              legend="Station length"
              name="stationLength"
              layout="row"
              value={format.stationLength}
              onChange={(value) => setFormat((f) => ({ ...f, stationLength: value }))}
              options={config.format.stationLengths.map((s) => ({
                value: s.value,
                label: `${s.value} min`,
                detail: s.label,
              }))}
            />
            <p className={styles.subNote}>
              Longer stations cost more — the price above follows this.
            </p>
          </div>
        ) : null}
      </fieldset>

      {/* The wall: named in credits, with the exact shortfall, and two ways
          out. Never just a disabled button. */}
      {!affordable ? (
        <Banner
          className={styles.wall}
          tone="danger"
          title={`This session needs ${cost} credits. You have ${balance}.`}
          actions={
            <>
              <Button as="a" href="/billing/manage-plan" variant="danger" size="sm">
                Top up {cost - balance} credits
              </Button>
              {cheapest ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    circuit
                      ? setStations(cheapest)
                      : setFormat((f) => ({ ...f, duration: cheapest }))
                  }
                >
                  Use the {cheapest} {circuit ? 'station' : 'minute'} option
                </Button>
              ) : null}
            </>
          }
        >
          Every option above says what it costs. The ones you cannot afford say how much is
          missing.
        </Banner>
      ) : null}

      <div className={styles.panel}>
        <ChoiceCards
          legend="Mode"
          name="mode"
          layout="row"
          value={format.mode}
          onChange={(value) => setFormat((f) => ({ ...f, mode: value }))}
          options={MODES}
        />
      </div>

      <div className={styles.panel}>
        <ChoiceCards
          legend="Examiner"
          caption="Both are free — only length changes the price."
          name="difficulty"
          layout="row"
          value={format.difficulty}
          onChange={(value) => setFormat((f) => ({ ...f, difficulty: value }))}
          options={DIFFICULTY}
        />
      </div>
    </div>
  )
}

/* ── step 3 · focus ───────────────────────────────────────────────────────
   One step, two meanings. On a panel these are the areas the examiner leans
   on, and a range is enough. On a circuit each one *is* a station, so the
   count has to land exactly on the size chosen at step 2.
   ────────────────────────────────────────────────────────────────────── */
export function StepFocus({ config, picked, toggle, target, circuit, hint }) {
  const cap = circuit ? target : config.focus.max
  const full = picked.length >= cap
  const ok = circuit ? picked.length === target : picked.length >= config.focus.min

  return (
    <div className={styles.step}>
      <div className={styles.focusHead}>
        <div>
          <p className={styles.stepLede}>
            {circuit
              ? `Pick ${target} stations for your circuit.`
              : `Choose ${config.focus.min}–${config.focus.max} areas for the panel to explore.`}
          </p>
          {hint ? (
            <p className={styles.focusHint}>
              <Icon name="sparkle" size="14px" strokeWidth={1.5} />
              {hint}
            </p>
          ) : null}
        </div>

        <p className={styles.counter} data-ok={ok || undefined}>
          {circuit
            ? `${picked.length} of ${target} stations`
            : `${picked.length} of ${config.focus.max} selected`}
        </p>
      </div>

      <fieldset className={styles.focusSet}>
        <legend className={styles.visuallyHidden}>{config.focus.title}</legend>
        <div className={styles.focusGrid}>
          {config.focus.items.map((item) => {
            const on = picked.includes(item)
            const blocked = !on && full
            const order = picked.indexOf(item) + 1

            return (
              <label
                key={item}
                className={styles.focusItem}
                data-on={on || undefined}
                data-blocked={blocked || undefined}
                title={
                  blocked
                    ? circuit
                      ? 'The circuit is full. Deselect one to swap.'
                      : 'Maximum reached.'
                    : undefined
                }
              >
                <input
                  className={styles.native}
                  type="checkbox"
                  checked={on}
                  disabled={blocked}
                  onChange={() => toggle(item)}
                />
                <span className={styles.focusMark} aria-hidden="true">
                  {on ? (
                    circuit ? (
                      order
                    ) : (
                      <Icon name="check" size="12px" strokeWidth={3} />
                    )
                  ) : null}
                </span>
                <span className={styles.focusLabel}>{item}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}

/* ── the order panel ──────────────────────────────────────────────────────
   Priority for a panel, running order for a circuit. Lives in the rail on a
   wide screen and inline under the grid on a narrow one.
   ────────────────────────────────────────────────────────────────────── */
export function OrderPanel({ config, picked, move, circuit, className = '' }) {
  if (!picked.length) return null

  return (
    <div className={`${styles.panel} ${className}`}>
      <p className={styles.eyebrow}>{circuit ? 'Running order' : 'Priority'}</p>
      <p className={styles.orderNote}>{config.focus.priorityCopy}</p>

      <ol className={styles.order}>
        {picked.map((item, i) => (
          <li key={item} className={styles.orderRow}>
            <span className={styles.orderIndex}>{i + 1}</span>
            <span className={styles.orderLabel}>{item}</span>
            <span className={styles.orderMoves}>
              <button
                type="button"
                className={styles.move}
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move ${item} up`}
              >
                <Icon name="chevronUp" size="14px" strokeWidth={2} />
              </button>
              <button
                type="button"
                className={styles.move}
                onClick={() => move(i, 1)}
                disabled={i === picked.length - 1}
                aria-label={`Move ${item} down`}
              >
                <Icon name="chevronDown" size="14px" strokeWidth={2} />
              </button>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ── step 4 · ready ───────────────────────────────────────────────────────
   A confirmation, not a form. Every row jumps back to the step that owns it,
   so changing one answer never means re-answering the rest.
   ────────────────────────────────────────────────────────────────────── */
export function StepReady({ config, ctx, format, picked, cost, balance, consent, setConsent, onEdit, circuit, resume }) {
  const rows = summaryRows({ config, ctx, format, picked, circuit })

  return (
    <div className={styles.step}>
      <dl className={styles.summary}>
        {rows.map((row) => (
          <div key={row.k} className={styles.summaryRow}>
            <dt className={styles.summaryKey}>{row.k}</dt>
            <dd className={styles.summaryValue}>{row.v}</dd>
            <button type="button" className={styles.summaryEdit} onClick={() => onEdit(row.step)}>
              Edit<span className={styles.visuallyHidden}> {row.k}</span>
            </button>
          </div>
        ))}
      </dl>

      <div className={styles.readyRow}>
        <span className={styles.readyTile} data-tone="success" aria-hidden="true">
          <Icon name="checkCircle" size="18px" strokeWidth={1.5} />
        </span>
        <div>
          <p className={styles.readyTitle}>CV attached</p>
          <p className={styles.readyMeta}>
            {resume.name} — your interviewer reads it before the session.
          </p>
        </div>
      </div>

      <Checkbox
        className={styles.consent}
        checked={consent}
        onChange={(event) => setConsent(event.target.checked)}
        label="Record this session so I can review it"
        description="Video is kept for 90 days and can be deleted any time from Settings."
      />

      <p className={styles.cost}>
        <span className={styles.costTile} aria-hidden="true">
          <Icon name="sparkle" size="18px" strokeWidth={1.5} />
        </span>
        <span>
          <span className={styles.costTitle}>This session will use {cost} credits</span>
          <span className={styles.costMeta}>You will have {balance - cost} left afterwards.</span>
        </span>
      </p>
    </div>
  )
}

/* ── the rail ─────────────────────────────────────────────────────────────
   Keeps the whole configuration visible from step 1 instead of revealing it
   at step 4. Unanswered rows show as em-dashes rather than disappearing, so
   what is still to come has a shape.
   ────────────────────────────────────────────────────────────────────── */
export function SummaryRail({ config, ctx, format, picked, step, circuit, move, blocked }) {
  const rows = [
    ...config.context.map((f) => ({ k: f.label, v: ctx[f.key] })),
    {
      k: circuit ? 'Circuit' : 'Length',
      v:
        step >= 2
          ? circuit
            ? `${format.stations} × ${format.stationLength} min`
            : `${format.duration} minutes`
          : null,
    },
    { k: 'Mode', v: step >= 2 ? MODES.find((m) => m.value === format.mode)?.label : null },
    {
      k: 'Examiner',
      v: step >= 2 ? DIFFICULTY.find((d) => d.value === format.difficulty)?.label : null,
    },
  ]

  return (
    <aside className={styles.rail} aria-label="Your session so far">
      {step === 3 ? (
        <OrderPanel config={config} picked={picked} move={move} circuit={circuit} />
      ) : null}

      <div className={styles.panel}>
        <p className={styles.eyebrow}>Your session</p>

        <dl className={styles.railRows}>
          {rows.map((row) => (
            <div key={row.k} className={styles.railRow}>
              <dt className={styles.railKey}>{row.k}</dt>
              <dd className={styles.railValue} data-empty={row.v ? undefined : true}>
                {row.v || '—'}
              </dd>
            </div>
          ))}
        </dl>

        {picked.length ? (
          <div className={styles.railFocus}>
            <p className={styles.railKey}>{circuit ? 'Stations' : 'Focus areas'}</p>
            <ul className={styles.railChips}>
              {picked.map((item) => (
                <li key={item} className={styles.railChip}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Why Continue is off, under the session it is refusing to start. It
          rides the rail on a wide screen and sits beside the button on a narrow
          one (`.blockedInline`), so the reason is never off-screen from the
          control it explains. */}
      {blocked ? (
        <p className={styles.railBlocked}>
          <Icon name="alertTriangle" size="14px" strokeWidth={1.6} />
          <span className={styles.railBlockedText}>{blocked}</span>
        </p>
      ) : null}
    </aside>
  )
}
