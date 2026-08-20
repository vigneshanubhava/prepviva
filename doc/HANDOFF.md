# PrepViva — session handoff

Paste the "Prompt for the next session" block below into a new Claude Code session
started in this directory.

---

## Prompt for the next session

I'm continuing work on the PrepViva prototype in this directory.

**Read first, in this order:** `doc/BRIEF.md`, `doc/PLAN-MODEL-AND-COPY.md`,
`src/styles/tokens.css`, then this file (`doc/HANDOFF.md`).

**The flow reference:** `../interview-prototype` (sibling folder) is an earlier,
fuller prototype of the same product — signup and onboarding, the session
configurator, the scored report. It owns the **product thinking**; this repo owns
the **design language**. First-run setup was ported from its
`src/features/onboarding/`. When a flow exists there, follow its substance and
restyle it here rather than inventing a second version.

**Figma:** file key `zb3i347yZU1jw7qb0Nf9FA`, page `0:1`, 55 artboards.
`doc/figma-screens/INDEX.md` maps every artboard name to its node ID, and
`doc/figma-screens/*.png` holds a render of each. Pull any artboard on demand
with the Figma MCP (`get_design_context` for geometry, `get_screenshot` for the
render) — load the `figma-design-to-code` skill before `get_design_context`.

**Next task:** the two remaining billing states, which reuse `AppLayout` and the
`Billing` screen's parts — `22 Billing - Starter Plan Active Single Invoice`
(`1:13733`) and `49 Billing - Starter Zero Credits` (`1:11635`). They differ by
**account state, not layout**: drive them from `ACCOUNT.status` / `creditsUsed`
in `src/data/account.js` rather than forking the screen. The cancel flow
(artboards 24-34, `36 Billing - Canceled Subscription Banner` included) and the
downgrade flow (50-55) are built — see below — and are the worked examples of
that approach.

The **Prototype controls panel** the brief asks for is built — the gear in the
header. It forces practice history, account age, subscription, plan, credits and
the CV, so every state below is reachable in a demo without editing a file.

The **dashboard and practice are built** — `/dashboard`, where the magic link
and first-run setup both land, and `/practice`, which gates on the CV and then
configures a session in four steps. It has no artboard: the behaviour is the reference prototype's, and the look
comes from a mock supplied in the session — a light page, white cards with a
soft edge and a soft lift, outlined glyph tiles, one filled brand pill per card.
Same tokens, type scale and radii as everything else; the surface is where it
parts company with Billing's purple masthead on grey. See "Practice history"
below.

The onboarding modal (`15`-`17`, `1:4194`) is built, but as a **first-run
wizard** collecting name, phone and CV rather than the three-card product tour —
see the decisions below. The tour copy rewritten in `PLAN-MODEL-AND-COPY.md` §5
("Pick your track" / "Practise on camera" / "See what to fix") is therefore
still unused; it belongs on a product tour if one is ever added.

Follow the conventions in the rest of this file. They are not optional — several
were learned by breaking something first.

---

## Stack

Vite 8 + React 19 + Tailwind v4 + React Router. **JavaScript, not TypeScript.**
No backend. `npm run dev` → http://localhost:5173

**sessionStorage is now used** (`src/data/session.js`), which reverses
doc/BRIEF.md's no-storage rule on request (2026-08-20): a refresh used to reset
the account to `ACCOUNT`, which meant back to `onboarded: false` and out to
first-run setup mid-demo. The account, the settings, notification read-state,
the prototype's practice history and the theme are kept for the tab.

Two things to know:

- **A hard refresh cannot be told apart from a normal one.** No web API
  distinguishes them — `PerformanceNavigationTiming.type` reports `"reload"` for
  both — and sessionStorage survives either. The ways back to a clean slate are
  **closing the tab** and **Reset** in the prototype controls panel, which
  clears the stored record as well as the live state.
- **Dates are named, not sniffed.** `JSON.stringify` writes Dates as strings and
  nothing turns them back, so `session.js` lists the fields that really are
  Dates. A blanket reviver would also convert `profile.interviewDate`, which is
  a date *input's* value and must stay a string.

## Routes built

| Route | Screen | Figma node |
|---|---|---|
| `/` | redirects to `/pricing` | — |
| `/pricing` | Public pricing page | `14:11391` |
| `/signup` | Signup form | `1:2777` |
| `/signup/checkout` | Review and checkout | `1:2121` |
| `/signup/preparing` | Preparing account (auto-advances) | `1:2167` |
| `/signup/welcome` | You're in | `1:2230` |
| `/login` | Login — email entry | `1:3169` |
| `/login/sending` | Generating secure link (auto-advances) | `1:6287` |
| `/login/link-sent` | Sign-in link sent | `1:5516` |
| `/login/email` | Magic-link email in a simulated inbox | `14:10469` |
| `/login/signing-in` | "Signing you in" loader between the email and the app (auto-advances) | — (borrows `1:6287`) |
| `/welcome/setup` | First-run setup — six steps: about you, track, date, worries, one question, CV | — (flow from `../interview-prototype`) |
| `/dashboard` | Dashboard — greeting, track switcher, practise-next / readiness / consistency, global figures, competencies and recent sessions | — (flow from `../interview-prototype`, look from a supplied mock) |
| `/practice` | Practice — the CV gate, then the track picker | — (flow from `../interview-prototype`) |
| `/practice/:trackId` | Session configurator — Context, Format, Focus, Ready, with the summary rail | — (flow from `../interview-prototype`) |
| `/practice/:trackId/room` | Where Start lands — the interview room, held as a placeholder that says so | — |
| `/sessions` | My Sessions — every session across every track, newest first | — (flow from `../interview-prototype`) |
| `/sessions/:trackId/:index` | One session's report — six zones, in reading order | — (flow from `../interview-prototype`) |
| `/performance` | Performance — readiness over time, the full competency breakdown, session-by-session, and the compare view | — (flow from `../interview-prototype`) |
| `/settings` | Settings — redirects to the first section | — |
| `/settings/:section` | Settings — profile, interview profile, devices, preferences, sign-in and security, active sessions, data and privacy | — (no artboard; layout is this build's) |
| `/billing` | Billing and invoices — Starter, on trial | `1:5133`, spacing from `1:13303` |
| `/billing` + Manage card | Manage-cards drawer (455px, over a scrim) | `29:4853` |
| any signed-in screen + avatar | Profile menu: account, theme, Settings, Sign out | `1:4997` / `1:5099` |
| `/billing` + kebab | Cancel-subscription flow: menu, modal, confirmation | `1:6544`, `1:6928`–`1:9513` |
| `/billing` cancelled | Canceled banner, plan-card strip, Renew | `1:9718`, `1:16360` |
| `/billing/canceled-email` | Cancellation confirmation in the mock inbox | `14:10022` |
| `/billing/manage-plan` | Manage plan — three cards, current-plan state, scheduled-downgrade notice | `1:9922`, `1:11825`, `1:14729` |
| `/billing/manage-plan` + card CTA | Upgrade / downgrade modal, then its confirmation | `1:10052`, `1:14889`, `1:10230`, `1:15085` |
| `/billing` with a downgrade scheduled | The scheduled strip on the plan card, Revert in the hero menu | `1:15222` |
| `/kitchen-sink` | Component library, every state | — |
| `*` | "Not built yet" placeholder | — |

Signup flow: pricing CTA → `/signup?plan=<id>` → checkout → preparing → welcome.
Login flow: `/login` → `/login/sending` → `/login/link-sent` → (prototype-only
"Open the email") → `/login/email` → magic link → `/login/signing-in` →
**`/dashboard`**. The loader replaces its own history entry, so Back from the
dashboard returns to the email rather than signing you in again.

**First run gates the app**: `AppLayout` sends an account with
`onboarded: false` to `/welcome/setup`, so the first signed-in screen anyone
reaches is setup. Finishing it, or "Set up later", lands on **`/dashboard`** —
`LANDING` at the top of `Onboarding.jsx`, the same one-line switch `SigningIn`
carries. The track setup collects becomes the dashboard's primary track, so the
screen it hands over to opens on what was just chosen.

Plan travels in the query string; name/email travel in React Router `state`
(the brief rules out storage). Each login screen falls back to
`oliver.davies@example.com` on a direct visit, the same fallback checkout and
welcome use, so every screen stays reachable by URL.

## Shared components — `src/components/`

| Component | What it owns |
|---|---|
| `Logo` | The mark + wordmark lockup. Used by `AppHeader`, `AuthShell` and the email. |
| `AppHeader` | The fixed app header from `1:2121`. Pages clear it with `--app-header-h`. `controls={false}` hides the prototype gear — Checkout passes it, having no account to force anything on. |
| `AuthShell` | Banner + card page shell for the out-of-app screens (`1:2167`, `1:2230`, `1:3169`, `1:5516`). Props: `tone` (`welcome`/`signup`), `gap` (`lg`/`apart`). |
| `AppNav` | The left navigation, its credits panel, and the collapse toggle. |
| `AppLayout` | Shell for every **signed-in** screen: `AppHeader` + `AppNav` + content column. Wrap new signed-in screens in this. |
| `BrandMark` | Payment-scheme logos (Visa, Mastercard) at Figma's 49×16. |
| `PlanCard` | One plan card — Figma draws the same one on the public pricing page (`14:11391`) and on Manage plan. Takes `badge`, `cta`, `note` and `footer` (which replaces the CTA — artboard 54's scheduled-downgrade notice); exports `PlanIcon` and `Tick`. |
| `NotificationsMenu` | The bell in the header and the panel behind it. Every row is **derived from live state** (`data/notifications.js`), so it cannot announce something that is no longer true, and each row obeys the switch that owns it in Settings → Preferences — which is the link in the panel's footer. Read state lives on `AccountProvider` (`notificationsRead`, `markNotificationsRead`). |
| `HelpMenu` | The question mark. Four answers to the questions this product actually raises, each quoting its figure from the module that owns it (`data/help.js` reads `MINUTES_PER_CREDIT`, `TRIAL_CREDITS`, `TRIAL_DAYS`), plus two things you can do. Every destination is a screen that exists, and the footnote says plainly there is no support inbox behind it. |
| `usePopover` | The open/close behaviour those two share — outside click, Escape back to the trigger, focus into the panel. `ProfileMenu` keeps its own: it is a `role="menu"` with arrow-key roving, which these two are not. |
| `PageHero` | The purple masthead (Figma `1:5133`) — glyph, title, lede, and an optional row of `HeroAction` pills on the right. Used by Settings, Performance, My Sessions and Practice. **Billing still draws its own**: that one is 206px because three stat cards overlap its bottom half, and it carries a menu, so the height and the overlap arithmetic belong to that screen. Both read `--app-hero-*`, so a change to the band's colours still lands on both. |
| `PrototypeMenu` | **Prototype only.** The gear in the header and the controls panel behind it — practice history, account age, subscription, plan, credits, CV. Delete it and its line in `AppHeader` before this ships. |
| `TrackSwitcher` | The chips that rescope a screen to one track, shared by the dashboard and Performance. A track earns a place by having been used; the primary track shows at zero, and the note says which are missing and why. |
| `TrackCharts` | `Sparkline`, `Heatmap`, `DimBars` and `TrendChart` — hand-drawn SVG/CSS, no charting dependency. **None takes a colour**: they inherit `--screen-accent` from the section they sit in. |
| `CreditNotice` | The low-balance ladder (low / critical / empty), shared by the dashboard and the practice screens. Thresholds stay in `data/dashboard.js`. |
| `ProfileMenu` | The dropdown under the header avatar (`1:5099`) — account block, System/Light/Dark, Settings, Sign out. Opened by `AppHeader`, so every signed-in screen has it. |
| `MailClient` | The simulated inbox both emails are read in (`14:10469`, `14:10022`). Chrome only, inert, `aria-hidden`. Takes `subject`, `to`, `proto` and the email as children. |
| `EmailCard` | The branded 640px email inside it — logo, gradient hero, heading, body, footer. `tone="brand"` swaps the blue hero for the purple one artboard 34 uses. |

Billing's cancel flow adds two route-scoped parts: `BillingMenu` (the hero
kebab, `1:6925`) and `CancelSubscription` (the modal's four states plus the
confirmation dialog, `1:6928`–`1:9513`).

Billing's two tabs share `RecordsTable` (toolbar + searchable, sortable table,
driven by a `columns` spec) and `StatusTag` (the status pill). Add a column, not
a second table.

`AppHeader` was lifted out of `Checkout.jsx`; the header tokens were renamed
`--checkout-header-*` → `--app-header-*` to match.

`Modal` also takes `label`, an `aria-label` for a dialog whose heading sits in
its body rather than a header row (the cancel confirmation, `1:9709`), and
`placement="drawer"` for a right-hand panel, plus `scrimClassName` — a page holds the drawer clear of the fixed header by setting
`--modal-inset-top` **on the scrim**, since the drawer is its child and custom
properties only inherit downward.

## Shared account state — `src/data/AccountProvider.jsx`

The upgrade flow spans two screens: you change the plan on Manage plan and see
the result on Billing. `AccountProvider` holds the one live account for the
session — `useAccount()` gives `{ account, summary, cancel, renew, upgrade,
schedule, keepPlan, onboard, skipOnboarding, attachCv, spend, updateCards,
notice, setNotice }`, plus the settings screen's own state and writers
(`settings`, `saveSettings`, `saveDetails`, `saveInterviewProfile`, `detachCv`,
`registerPasskey`, `removePasskey`, `revokeSession`, `revokeOtherSessions`,
`changePassword`). `attachCv` is the practice screen's gate; `spend` is what
starting a session does to the balance, which is why the nav's credits panel and
the billing card move the moment one starts. **Signed-in screens read
the account from here, not from `ACCOUNT` directly.** In memory only; the brief
rules out storage, not state. `notice` is the one-shot message a screen leaves
for the next one — artboard 43's "Successfully updated the plan" toast.

## Mock account state — `src/data/account.js`

`ACCOUNT` is the signed-in user; `billingSummary()` and `invoices()` derive
every figure from `plans.js` and `trial.js`, so a date and its amount can never
drift apart. **Read state from here — never hard-code a plan, price, credit
count or date into a screen.**

Two states are one edit apart, at the top of `account.js`:

| `DAYS_ELAPSED` / `status` | Gives you | Artboard |
|---|---|---|
| `5` / `'trialing'` | mid-trial, one £0 invoice, trial credits, "9 days left" | 19 (`1:5133`) |
| `250` / `'active'` | a paying subscriber, 9 invoices, Paid/Unpaid/Free tags | 21 (`1:13303`) |

`changePlan()` applies an upgrade now; `scheduleChange()` holds a downgrade
until the period already paid for ends; `keepCurrentPlan()` drops it again.
`prorate()` does the arithmetic the change modal shows, so what the modal
promises is what the account then does. `periodStart` — not `signedUpOn` —
anchors the renewal date, because a plan change restarts the period.

`cancelSubscription()` and `renewSubscription()` return a new account rather
than mutating `ACCOUNT`; `Billing` holds the live copy in state. Seeding
`status: 'canceled'` lands straight on artboards 33 and 36 without walking the
flow — `accessEnds`, `canceledFrom` and `cancelReason` all fall back sensibly.

Currently set to **active**, so the invoice table is populated. The invoice run
is generated from the billing anniversaries, not typed out — change the number
of months and the rows follow.

## Practice history — `src/data/dashboard.js`

The dashboard's own state, ported from the reference prototype
(`../interview-prototype/src/data/dashboardData.js` + `domain/rubric.js`). Two
rules it exists to enforce, both the reference's:

- **Quality is per track, volume is global.** The three tracks are marked
  against different rubrics on different scales (`RUBRIC`: 0–100, 0–10, 0–12),
  so a blended readiness number would be meaningless. Everything under the
  track chips rescopes; `globalTotals()` — sessions and minutes — deliberately
  does not.
- **A score off one data point is a lie.** `tierOf(sessions)` returns
  `empty | single | early | full`, and the screen renders only what the tier has
  earned: one session shows its result, never a readiness figure or a trend.

Tracks are keyed by the ids first-run setup already uses (`onboarding.js`
`TRACKS`: `nhs`, `university`, `postgraduate`), so **the track collected in
setup becomes the dashboard's primary track** — the one that shows in the
switcher at zero sessions, and the one the interview countdown names.
`profile.interviewDate` drives the countdown when setup collected one.

A session's price is `creditsFor(minutes)` — 1 credit ≈ 10 minutes, from
`trial.js` — so the card's sentence and the number on its button cannot drift
apart. `creditLevel()` is the low-balance ladder the notice above the screen
renders against, set against what a session actually costs.

`HISTORY` holds the four candidate states — `cold`, `warm`, `established`,
`lapsed`. The prototype controls panel switches between them; **`?state=cold`**
on the URL still seeds it on first load, and anything unrecognised falls back to
`established`.

The charts (`DashboardCharts.jsx`) are route-scoped, like `RecordsTable` on
Billing: three hand-drawn SVG/CSS pieces with no charting dependency. **None of
them takes a colour** — they inherit `--dash-accent`, which `Dashboard.module.css`
sets from the track on show, so a chart can never pick a colour of its own and
both themes resolve without a prop. A competency row's glyph repeats what its
bar colour says (strength / middle / needs work), so the judgement is not
carried by colour alone.

Two things about the screen's surface are worth knowing before editing it:

- **it paints its own page tint.** `.page` bleeds out through `AppLayout`'s
  padding with negative margins — the trick Billing's banner uses — so the
  content column reads light edge to edge instead of the app's grey. Anything
  added at the top level of the route goes inside that div.
- **the brand purple carries the actions, the track accent carries the data.**
  Eyebrows, pills and links are `--brand`; the chips, the card's leading edge,
  the sparkline, the heatmap and the middle competency bars are the track's own
  `--track-*` colour. That split is what keeps three tracks legible on one
  screen.

`Icon` gained `calendar` and `arrowRight` for this screen; both show at
`/kitchen-sink` automatically, which renders `iconNames`.

## What a session can be — `src/data/practice.js`

The configurator's whole vocabulary: per-track context fields, format, focus
items, plus `MODES` and `DIFFICULTY`. Ported from the reference prototype's
`domain/branches.js`, and it makes the same claim — **these objects are the only
difference between a panel and a circuit.** Every step is rendered by shared
code in `SessionSteps.jsx`, which knows nothing about any particular track, so a
fourth track is a config entry rather than a new screen. Keep it that way: if a
step starts branching on `config.id`, the config is missing a field.

`shape` decides how format and focus are read:

| | panel (`nhs`) | circuit (`university`, `postgraduate`) |
|---|---|---|
| Format | one length, 30/45/60 min | station count × station length |
| Focus | 3–6 areas the examiner leans on | one station each, **exactly** the circuit size |
| Order | priority — higher areas get more of the interview | the running order you face them in |

**Pricing is minutes, not stations.** The reference charges a flat rate per
station; this app has already told the candidate that 1 credit is about 10
minutes (`trial.js`), so `costOf()` runs everything through `creditsFor()`.
A longer station costs what it takes, and the dashboard's recommendation and the
configurator can never quote different numbers.

`practicePlan()` lives here too, because a plan *is* a session configuration.
The dashboard's "practise this next" card builds one and hands it over in router
state; the configurator applies it wholesale and lands on the step that still
needs an answer — Ready if nothing does, Format if the balance will not cover
it, Context if a required field could not be recovered. Whatever it pre-filled
is named in a note at the top of the step, because answers nobody typed have to
say where they came from.

**One vocabulary, two files.** `focusFromWorries()` maps setup's worries onto
focus areas, and the strings in `onboarding.js`'s `WORRY_FOCUS` must be items
this file offers, spelled exactly — an unmatched one is dropped rather than
pre-selecting an area the candidate never chose. `DIM_FOCUS` does the same job
for rubric dimensions ("Handling Pressure" scores; "Handling Pressure /
Resilience" is what you practise). Both are checked by walking the flow, not by
a type.

## Practice — `src/routes/Practice.jsx`, `SessionConfig.jsx`, `SessionSteps.jsx`

**The page title does not change with the state.** Both states open on the same
`PageHero` — "Practice" — and the CV gate explains itself inside its own card
instead of renaming the page above it; a heading that disagrees with the nav
item it was reached from reads as a different screen.

`/practice` does two things in order, both the reference's:

1. **the CV gate.** Practice is unreachable without a CV — the questions are
   meant to reference real experience. Setup lets the CV be skipped, so this is
   where the rule is enforced, and it explains why rather than just refusing.
   `attachCv()` on the account saves it (name and size only, as setup does), and
   `SessionConfig` redirects back here if it is ever missing.
2. **the track picker.** One card per track, each naming its shape and price
   range, because a panel and a circuit are configured differently from the very
   next screen.

`/practice/:trackId` is the configurator — addressed by track rather than held
in the parent's state, so a half-configured session survives a refresh and the
dashboard can hand a plan over by navigating.

Things worth not breaking:

- **the credit meter changes state, not just its number**: a range at Context,
  live at Format (the only step where the price moves), locked after.
- **the header carries a rule under the stepper**, and the credit meter beside
  the title is two lines — label, then the figure with the balance as a pill —
  so it stands the same height as the back button and title opposite it.
- **the CV can be swapped from the Ready step.** Replace only, not remove:
  practice is gated on the CV, so taking it off at the point of confirming a
  session would strand the flow. Removing lives in Settings, where the
  consequence can be spelled out. A rejected file leaves the old CV in place and
  says why, on its own line under the row.
- **the credit wall rides the summary rail**, under the session it is refusing
  to price, and drops into the step itself below 1100px where the rail is not on
  screen. One `CreditWall` rendered in two places — the same wide/narrow split
  `OrderPanel` uses — so it can never say one thing in the column and another in
  the rail. The one-line reason beside a disabled Continue stays where it is.
- **the wall is never just a disabled button.** An option that costs more than
  the balance says how much is missing, and the banner offers both ways out —
  top up, or drop to the cheapest option that fits. Every disabled Continue has
  the reason beside it.
- **dropping the station count trims the circuit**, or step 3 keeps stations
  that no longer have a slot.
- the focus grid is native checkboxes with a full-cover invisible input, the
  same pattern `ChoiceCards` and `ChipGroup` use — a test has to `check()` the
  input rather than click the label.

`CreditNotice` moved to `src/components/` when the practice screens became the
second surface that needed the low-balance ladder; the thresholds stay in
`data/dashboard.js`.

## The report — `src/data/report.js`, `src/routes/Report.jsx`, `ReportZones.jsx`

Ported from the reference prototype's `features/report/`. Six zones, in reading
order: **Verdict · Headline · Scorecard · Answer lab · Coaching · Path forward.**

Three rules carried over, all of them load-bearing:

1. **Derived is separated from placeholder.** The score, its band and rank, the
   readiness call and gap, the practice estimate, the trend against the previous
   attempt, the date, the session code, the duration and the competency scores
   are all computed. Everything else — narratives, insights, voice, ethics, the
   answer lab — is sample copy, kept in one block at the bottom of `report.js`
   so there is a single place to delete from, and **tagged on screen wherever it
   appears**. A reviewer must never think a paragraph was written about their
   own session.
2. **No tabs.** The reference tried a Full report / Section-wise toggle and
   removed it: a report split across tabs is one someone finishes having never
   read the action plan. The links under the header jump; they never filter.
3. **A URL can outlive what it points at.** A report is addressed by track and
   position (`/sessions/nhs/0`) rather than handed over in state, so it survives
   a reload and can be linked — and switching practice history in the prototype
   panel can delete the session under it, which is why there is an explicit
   "that report is not here" state rather than a crash.

`sessionCode()` is deterministic (FNV-1a then xorshift32) so a code survives a
re-render; the alphabet drops I, O, 0 and 1 because they are misread when a code
is read aloud. `REPORT.benchmark` is the one number the gap, the readiness call,
the ring's notch and the practice estimate all hang off — move it and they move
together.

The only export is the browser's own print-to-PDF, behind a real button, with a
`@media print` block that drops the chrome and keeps every zone. Nothing here
reaches a backend, so nothing pretends to.

## My Sessions and Performance

`Sessions.jsx` flattens every track's history, newest first. The **per-track
index travels in the link** because that is how a report finds the attempt
before it — a flat list position would point at the wrong one the moment two
tracks interleave.

`Performance.jsx` is the dashboard's scoping rule with room to breathe:
readiness over time as a full `TrendChart`, the complete competency breakdown,
and a session-by-session table with the change column the dashboard has no space
for. Its compare view carries **a warning it cannot be shown without** — two
tracks are marked on different scales by different examiners against different
axes, so a longer bar is not a better performance. The view exists to show the
*shape* of two profiles. If that warning ever gets trimmed as clutter, the view
should go with it.

## Settings — `src/routes/Settings.jsx`, `SettingsSections.jsx`, `SettingsParts.jsx`

The screen every other screen already linked to: the left nav has always had it,
the profile menu has always had it, and first-run setup's own copy promised its
answers could be changed here. It has **no artboard** — the reference for it was
a set of screenshots supplied in the session, and the request was to take their
*content* and lay it out better.

What was taken, and what was not:

- **taken:** input devices, connection status, notification preferences,
  password, passkeys, active sessions, profile fields, the delete-account danger
  zone.
- **replaced:** the row of pill tabs became a grouped **section rail**, one URL
  per section (`/settings/:section`). Tabs cap how many sections can exist; a
  settings screen grows by one a quarter forever. The rail also lets Account /
  Practice / Security be said out loud instead of implied by tab order. On
  request the page title sits in **Billing's purple masthead** above both
  columns; below 1080px the rail becomes one horizontally-scrolling row of pills
  under it.
- **dropped:** the two large black device-preview panes. This prototype never
  opens a camera, and two rectangles that will never show a face were the least
  honest thing on the screen. What replaces them is what they crowded out — the
  connection strip and a diagnostics run that names what to fix.
- **added, because the gap list asked for them:** the interview profile
  (setup's own answers, editable at last), CV replace/remove, recording
  retention, and a data export.

Rules it follows:

1. **Nothing saves on keystroke.** Each section edits a draft (`useDraft` in
   `settingsDraft.js`) and a sticky save bar appears the moment the draft
   differs from what is committed. A form that writes as you type has no
   Discard. The two deliberate exceptions say so on screen: the theme applies
   immediately (it is the same setting as the profile menu's, and a preview that
   needs saving is not a preview), and the CV saves on attach.
2. **The account half writes through `account.js`**, not through a settings
   store of its own — `updateDetails`, `updateInterviewProfile`, `removeResume`.
   A profile edited here is indistinguishable from one the wizard collected, and
   changing the track here moves the dashboard's primary track with it.
3. **Everything else lives in `src/data/settings.js`** and is held in
   `AccountProvider` beside the account (`settings`, `saveSettings`,
   `registerPasskey`, `removePasskey`, `revokeSession`, `revokeOtherSessions`,
   `changePassword`). It sits in the provider rather than the route because the
   screen is seven sections deep and each one saves on its own — held in the
   route, moving between sections would reset the other six.
4. **Nothing pretends to reach a device or a server.** The device lists are
   named options, not an `enumerateDevices()` call that returns blanks without a
   permission prompt; the latency samples and every diagnostic verdict are
   fixed, because a chart that redraws differently each render is a decoration
   claiming to be a measurement. Each of those panels carries one line saying
   so. The one genuinely working action is **Download my data**, which builds
   the JSON in the browser from live state.
5. **Revoking never touches the current session**, and deleting the account
   resets it to `ACCOUNT` and returns to `/pricing` — with the dialog saying
   plainly that a reload brings the demo account back.

**The masthead is shared, so its tokens are.** `--billing-hero-from/to/text/bd`
and the 40px inline padding are now `--app-hero-*`, beside `--app-header-*` and
`--app-nav-*`; `--billing-hero-h` (206px) stays Billing's, because that height
exists to be overlapped by its three stat cards and nothing overlaps the rest.
The band moved into `components/PageHero.jsx` once Settings, Performance, My
Sessions and Practice all carried it — four copies of one gradient are four
chances to drift. Performance's Single track / Compare two switch rides the band
as `HeroAction` pills, since it scopes the whole screen the band names.

`Switch` was added to `src/components/ui/` for this screen and shows at
`/kitchen-sink`; so do the seven new `Icon` glyphs (camera, monitor, smartphone,
wifi, activity, key, shield). The rail carries a flag only where a section wants
something done — `Not set` on an interview profile that setup skipped — never a
badge per section, which says nothing about any of them.

## Prototype controls — the gear in the header

The panel doc/BRIEF.md asks for, built as `src/components/PrototypeMenu.jsx`.
The reference prototype keeps the same thing in its sidebar
(`../interview-prototype/src/app/dev/ScenarioPanel.jsx`) and the reasoning is
its: most of the interesting screens cannot be reached by using the app
normally. You cannot run out of credits on demand, you cannot age an account
eight months, and you certainly cannot cancel a subscription four times in a
demo — without this they can only be seen by editing `account.js` mid-sentence.

| Control | Writes | Reaches |
|---|---|---|
| Practice history | `PrototypeProvider` | the dashboard's four candidate states |
| Account age | `forcePhase` — `signedUpOn` + `status` | trial day counts, the invoice run |
| Subscription | `forceStatus` | the trial card, the cancelled banner and strip |
| Plan | `forcePlan` | plan name, price, credit allowance everywhere |
| Credits | `forceCredits` | the credit notice ladder, the nav panel, the practice wall |
| CV on the account | `forceCv` | the practice screen's gate |

Two rules it follows:

- **it writes the same fields the flows write**, so no screen can tell a forced
  state from an earned one. The blunt writers live in a marked block at the
  bottom of `account.js` and do no arithmetic — no proration, no invoices, no
  negotiated dates. `changePlan()` and `cancelSubscription()` stay the honest
  path, and the panel's Cancelled option calls the real one.
- **practice history is the exception**: it is fixture data the account has no
  field for, so it lives in `src/data/PrototypeProvider.jsx`. `?state=cold` on
  any URL still seeds it, which is what the dashboard used before the panel
  existed.

`Reset` puts the whole account back to `ACCOUNT`; `Run first-run setup` clears
`onboarded` and sends you to `/welcome/setup`. Nothing persists — a reload is
the other way back.

**Delete `PrototypeMenu`, `PrototypeProvider` and the prototype block in
`account.js` before any of this ships.**

### The light screens' ground

`--screen-page` is deliberately a step darker than white (`#eff1f7`). A
near-white ground made the whole dashboard read as one washed-out sheet — the
cards have to sit **on** something for their edges and shadows to mean anything.
The card, tile and chip borders are set against that ground, not against white,
which is why they look heavy if you preview them on a white background.

For the same reason the left nav carries a right edge (`--app-nav-bd`): the nav
and the header are both white, so without it the nav bleeds into the header
above and has no boundary against the page beside it. Billing keeps its own
darker `--app-page-bg` and is unaffected by either.

## Component library — `src/components/ui/`

Avatar, Badge, Banner, Button, Card, Checkbox, ChipGroup, ChoiceCards,
EmptyState, Field, FileDrop, Icon, Input, Modal, Radio/RadioGroup,
SegmentedControl, Select, Skeleton, Spinner, StepProgress, Switch, Table, Tabs,
Toast, VisuallyHidden. All exported from `index.js`.

Every one is shown in every state at `/kitchen-sink`. **A control built for one
screen moves here as soon as a second surface could want it** — the last four
were first-run setup's own parts:

| Component | What it owns |
|---|---|
| `ChoiceCards` | Radios as cards: glyph, label, a line of explanation. `layout="row"`, an `error`, and a per-option `accent` — `brand`, or `nhs` / `uni` / `pg`, which the token layer already colours. |
| `ChipGroup` | Multi-select chips over a checkbox group, for short unordered answers. |
| `FileDrop` | Attach one file. Checks extension and size itself and hands the message back through `onReject`, so the screen keeps its own voice. Passes on name and size only. The attached state offers **Replace** as well as Remove — both go through the same input and the same two checks, so a second picker elsewhere can never drift from these rules. `compact` renders actions alone with no drop zone, for a screen that already names the file or has no room for a target; `allowRemove={false}` where removing would strand the flow; `passFile` adds the `File` to the payload for a screen that must *show* what was picked (the profile photo). `onRemove` exists because `onSelect(null)` means both "removed" and "what you picked was rejected" — fine for a form field, wrong for anything already saved: a bad file must not delete the good one. |
| `StepProgress` | Where you are in a multi-step flow: one `role="progressbar"`, decorative segments, and the count in words. |
| `Switch` | A preference that *applies*, as opposed to a checkbox, which selects a value a form later submits. A native `<input type="checkbox">` with `role="switch"` under paint; `size="sm"` for a dense row. Settings' own toggles sit inside a form that still needs saving, which is why that screen carries a save bar rather than letting the control imply it saved. |

The full-cover invisible `<input>` in `ChoiceCards` and `ChipGroup` is
deliberate — the whole card is the hit area and the native control keeps the
focus ring. It also means a test has to `check()` the input rather than click the
label text.

## Styling rules — non-negotiable

1. **CSS Modules, one per component/route. Every value is `var(--token)`.**
   Not Tailwind utilities — `p-4` and `text-sm` are Tailwind's values, not the
   project's tokens.
2. **No hex, no `rgb()`, no primitive tokens (`--purple-600`) in a component.**
   This audit must stay empty:
   ```
   grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--(purple|gray|emerald|amber|red|blue|pink|teal|white)-' src/components src/routes src/data
   ```
3. **Figma's literal values live in `tokens.css`, never in a component.**
   A library component uses the **semantic** layer only (`--info-*`, `--track-*`,
   `--border-*`) — a per-screen block is for a screen. The token file carries no
   unused tokens; this audit should stay empty apart from the Tailwind bridge
   (`--color-*`, which exists so the utilities resolve):
   ```
   node -e "const fs=require('fs'),p=require('path');const tok=fs.readFileSync('src/styles/tokens.css','utf8');const names=[...new Set([...tok.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map(m=>m[1]))];const blob=(function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const f=p.join(d,e.name);if(e.isDirectory())return walk(f);return /\.(css|jsx|js)$/.test(e.name)&&!f.endsWith('tokens.css')?[fs.readFileSync(f,'utf8')]:[]})})('src').join('\n');console.log(names.filter(n=>!blob.includes('var('+n)&&!tok.includes('var('+n)&&!n.startsWith('--color-')))"
   ```
   Per-screen blocks already exist: `--pricing-*`, `--signup-*`, `--checkout-*`,
   `--welcome-*`, `--login-*`, `--mail-*`, `--email-*`, `--billing-*` and
   `--cancel-*`, plus the shared `--app-header-*`, `--app-nav-*` and
   `--app-credits-*`. **`--screen-*` is the exception to the per-screen rule**:
   the dashboard and both practice screens are drawn in one surface (light page,
   white cards with a soft edge, outlined glyph tiles, one filled brand pill),
   so it is named for the surface rather than for any one screen. Sizes that
   really do belong to a single screen still sit in their own block —
   `--dash-card-h`, the chart sizes. Each declares a **light value matching Figma exactly and a
   derived dark value**. Add a new block per screen the same way — but check the
   existing blocks first: most of the login sequence resolved onto `--signup-*`
   and `--welcome-*` values that already matched.
   Keep `doc/tokens.css` in sync: `cp src/styles/tokens.css doc/tokens.css`.
4. Light is default; dark is `data-theme="dark"` on `<html>` with **zero markup
   changes**. Check every screen in both.

## The favicon

`public/favicon.png` (64px) and `public/apple-touch-icon.png` (180px), declared
in `index.html`. Both are the app's own mark — `src/assets/signup/logo-mark.png`
— centred on a **white tile**, so the tab shows what the header shows and the
mark keeps its own ground on a dark tab bar rather than sitting on whatever
colour the browser paints. The favicon's tile is a rounded square; the touch
icon's is full-bleed, because iOS masks that one itself.

They were produced by drawing that PNG onto a canvas in the browser
(Playwright + `canvas.toDataURL`), because this repo has no image tooling and
the mark exists only as a 501×585 bitmap. Re-run that if the mark ever changes;
`--app-hero-from` is also stamped as `theme-color`.

**`public/favicon.svg` was deleted**: it was the template's lightning mark
(`#863bff`, the aidnn logo), not PrepViva's, and nothing referenced it.
`public/icons.svg` is template leftovers too — also unreferenced, left in place.

## Content rules

- **Layout from Figma. Everything else from the docs.** The Figma was built on a
  B2B SaaS template — its prices, credits, features and much of its copy belong
  to a different product.
- Plans/prices/features: `src/data/plans.js` (from `PLAN-MODEL-AND-COPY.md`).
- **Every trial-related screen states both the date and the amount.** Dates come
  from `src/data/trial.js` — never hard-code one.
- Apply the copy corrections table in `PLAN-MODEL-AND-COPY.md` §5.
- When Figma's layout assumes content that no longer exists, adapt the layout and
  say so.

## Gotchas — each of these cost real time

- **A zero-height flex item still eats a `gap`.** Settings' focus anchor is an
  empty `<span>` at the top of the content column; as a flex child it pushed the
  section title down by the column's whole 20px gap, which read as a stray gap
  under the page title. It is `position: absolute` now. Anything invisible
  inside a flex or grid container has to leave the flow, not just have no size.
- **`flex: 1 1 200px` is a *height* once the axis flips.** `ChoiceCards`
  stacks its row layout below 880px, and the basis written for the row made
  every stacked card 200px tall — on Settings and on first-run setup both. The
  media query now releases it with `flex: 0 0 auto`. Check any `flex-basis`
  that survives a `flex-direction` change.
- **A `<legend>` renders *on* its fieldset's border**, so on a panel with a
  visible card edge the heading looks like it has escaped the box — which is
  exactly how the Format step's "Duration" read. The fix is a visually-hidden
  legend for the group's name plus a normal `.eyebrow` paragraph for the
  heading, the pattern the focus step already used. **Do not float the legend
  instead**: `float + inline-size: 100%` resolves the percentage against the
  fieldset's *border* box, and it blew the whole step 90px wider than its
  column.
- **Paint over a native input has to be `pointer-events: none`.** `Switch`
  drew its track over the input without it, so a click on the visible control
  was swallowed — a real user still hit the wrapping `<label>`, but a test
  targeting the input times out with "track intercepts pointer events", and any
  future full-cover input would have been dead. Checkbox and Radio already had
  the rule; Switch does now.
- **`a && b && c` returns `c`, not `true`.** Performance's `showCompare` was
  `compare && canCompare && aId && bId`, so in the compare view it held a *track
  id*; `showCompare === view.value` was then false for both view buttons at
  once, and the one actually on screen announced `aria-pressed="false"`. It is
  `Boolean(...)` now. Anything compared with `===` has to be a real boolean.
- **A rule drawn on the page tint needs `--border-default`, not
  `--screen-card-bd`.** The card-edge colour is set against white; on the light
  screens' own ground (`#eff1f7`) it is within a couple of percent of the
  background and the line simply does not appear — it computes correctly and
  photographs as nothing. The report header's divider is `--border-default`.
- **A full-page screenshot is not evidence about a page with fixed chrome.**
  Chromium stitches it, so the app header can appear a second time halfway down
  and heights can be distorted. Measure with `getBoundingClientRect()`, or
  screenshot the viewport only.

- **Tailwind preflight sets `img { max-width: 100% }`**, which silently squashes
  any SVG drawn larger than its box. Set `max-width: none` on oversized leaves.
- **Figma exports bake in their colours.** A white notch or a blue icon will not
  follow the theme. Inline the SVG with `stroke/fill="currentColor"` and colour
  it from a token.
- **Blurred Figma ellipses export as a bleed box.** The file is bigger than the
  shape; drawing it at the shape's size turns a soft glow into a hard disc.
  Preserve the outer box and the inner leaf separately.
- **A CSS `padding` shorthand after a `padding-top` longhand wins.** Fold offsets
  into the shorthand.
- **Screenshots go stale.** Verify by measuring the live DOM (`getComputedStyle`,
  `getBoundingClientRect`) rather than by looking at a PNG.
- **Never scaffold with `npm create vite --overwrite`** in a populated directory.
  It deletes everything.
- **A `display: flex` paragraph puts every text fragment on its own row.** Inline
  spans inside a sentence need a normal block box, not a flex container.
- **`get_design_context` returns the artboard as it is now, not as the PNG shows
  it.** Artboards 11 and 13 render the banner as a flat purple gradient because
  the artwork was never placed on them; `doc/figma-screens/11 …png` shows the
  real banner. Cross-check the PNG before trusting a bare shape.
- **Measuring with raw `page.mouse.click(x, y)` silently misses** anything below
  the fold — `getBoundingClientRect()` is viewport-relative. Scroll first, or
  use a locator click. Two "failures" this session were the test, not the app.
- **A visually-hidden element with no positioned ancestor escapes its scroll
  container** and parks at its static x — which, inside a horizontally-scrolled
  table, is far off-screen. It then widens the *document*, and the whole page
  scrolls sideways. `Table`'s `.scroll` is now `position: relative` to contain
  it; do the same for any new scroll box. The tell is a page `scrollWidth` that
  stays **constant** as the viewport shrinks.
- **`overflow-x: auto` on a wrapper is not enough on its own.** The flex/grid
  ancestors also need `min-width: 0`, or they refuse to shrink below their
  content and push the page wide.
- **`npm run build` does not catch every JSX syntax error** — a `{/* … */}`
  comment placed inside a ternary compiled clean but 500'd in dev. The browser
  check is the real gate; `curl -o /dev/null -w '%{http_code}' <module url>`
  against the dev server names the failing file fast.
- **A `width` on a `<th>` is only a suggestion** under the default `table-layout:
  auto`. Set `table-layout: fixed` when the artboard specifies column widths.
- **An `inline-flex` child sits on the text baseline** and adds descender space,
  so a tag or icon button silently makes a table row several px taller than its
  padding says. `vertical-align: middle` removes it.
- **Moving focus inside the handler does not survive a keyboard activation.**
  The Revert buttons delete themselves; focusing the replacement from the click
  handler works for a mouse and lands on `<body>` for Enter, because the
  browser's own fixup for the removed button runs afterwards. Both screens move
  focus from an effect once the re-render has happened (`Billing` waits a frame,
  `ManagePlan` focuses the CTA that came back, or the card heading when that
  button is the disabled "Current plan" one).
- **An action that deletes the control it lives on loses focus to `<body>`**,
  which breaks the modal's focus trap *and* its Escape handler. Move focus
  somewhere deliberate after the mutation; `Modal` now also listens for Escape
  on the document as a backstop.

## Verification habit

Playwright is installed in the session scratchpad. For every screen, check in a
real browser: route transitions, data carried between screens, form validation
and announced errors, that no input lacks a label, both themes, and no console
errors. Then `npm run build` and `npm run lint`.

Lint has 7 known benign `only-export-components` fast-refresh warnings
(Icon, Field, Toast, Avatar, ThemeProvider, AccountProvider, PrototypeProvider).
Anything beyond those is new.

## Known gaps / not built

- The dashboard mock also showed a **different left nav** (Mock Interviews, AI
  Coach, Learn, Resources) and a floating action button under it. Neither was
  built: `AppNav` is shared by every signed-in screen and `doc/BRIEF.md` fixes
  the one nav set in `src/data/nav.js`. Changing it is a product decision, not a
  dashboard one.
- **Payment-failed states have no screen.** `account.status` still accepts
  `past_due`, but nothing renders it — artboards 35 (read-only warning banner)
  and 37 (account temporarily disabled) are not built, so the prototype controls
  panel deliberately does not offer it.
- `AppNav` read `billingSummary()` off the module default, so the nav's credits
  panel never followed a plan change; it reads `useAccount()` now. Any new
  chrome that shows account figures must do the same.
- The header's bell and question mark used to be inert; both are panels now.
  `AppHeader` gained `signedIn` (default true) which hides them on checkout,
  where the header runs before there is an account for them to talk about.
- **The filter button, "Download invoice" and the row kebab are inert.** They are
  on the artboard with no target screen behind them. The hero kebab is live —
  it opens the cancel flow, and offers Renew once cancelled.
- Below ~960px the invoice table scrolls horizontally — eight columns cannot fit
  and still hold their content on one line. Above that it never scrolls.
- Nothing in the Manage-cards drawer reaches Stripe — the panel's own copy says
  payment methods are handled there, and this prototype has no Stripe. "Set as
  default" and remove mutate component state only, so they reset on reload.
- `/welcome/setup` stays reachable by URL after it has been through, which is how
  it is demonstrated a second time without a reload. It does not redirect an
  already-onboarded account away, deliberately.
- Links to `/terms` and `/login/password` currently land on the "not built"
  placeholder. It keeps the
  signed-in shell (header, left nav, credits panel) for the paths the nav owns —
  `isSignedInPath()` in `src/data/nav.js`, which is also where the one nav set
  now lives — and stays a bare card for the rest. The dashboard's "Open
  performance" and "See all" go there, and its session rows link to `/sessions`
  rather than to a report screen, which the reference prototype has and this one
  does not.
- **The interview room is not built** — there is no model behind this prototype
  to ask the questions and nothing to record. Starting spends the credits and
  lands on `/practice/:trackId/room` (`SessionRoom.jsx`), which says plainly
  that the room is where the session *will* run and repeats the configuration
  that was just paid for. It replaced a bounce back to the dashboard with an
  apology in a toast, which read as the flow failing rather than ending. The
  configuration travels in router state, and `navigate` **replaces** the entry,
  so Back returns to the track picker rather than to a configurator whose
  credits have already been taken.
- **Signup's terms error does not clear until the next submit.** `Login` clears
  its error as soon as you type; `Signup` recalculates only on submit, so a
  stale "Accept the terms to continue" sits next to an already-ticked box.
  Pre-existing, cosmetic, worth aligning with `Login` when Signup is next open.
- The email screen drops the artboard's four social icons — PrepViva has no
  social accounts in the docs, and inventing links is content invention.

## Decisions already made (don't re-litigate)

- One font family, per `tokens.css` §7 — Figma mixes Inter and FK Grotesk Neue;
  sizes and weights match Figma, family does not.
- The whole product is **monthly only**; every annual toggle was removed on
  request — first the pricing page's, then Manage plan's. `plan.price.annual` is
  still in `plans.js`, unused by any screen. See the plan-change decisions below.
- Plan card icons are microphone / users / trophy, not Figma's briefcase /
  users / office-block. **Which glyph a plan gets is `plan.icon` in
  `plans.js`** — every surface that shows a plan reads that field, so the
  pricing card and the billing card can never disagree. Two drawings of the same
  three concepts exist on purpose: `PlanIcon` carries the marketing page's
  Untitled UI originals inside Figma's 34px ring, and the shared `Icon` set
  carries house-style versions for the app chrome. Both are keyed by
  `plan.icon`.
- Checkout's Stripe panel is **built as a real form**. In Figma it is a flat
  screenshot; Apple Pay and Link were dropped.
- Checkout's button says "Start 14-day trial", not "Pay" — nothing is charged
  that day.
- **Avatars are initials by default, and the account holder can upload a
  photograph** (2026-08-20, on request). The original decision ruled out a
  *stock* face — a photograph of someone who never agreed to be in this product
  — not a picture the user chose. `Avatar` takes `src`; without one it falls
  back to initials, which is still what every account starts with.
  `data/photo.js` squares and shrinks the upload to 256px and keeps it as a
  data URL, so it is small enough to store and survives a refresh. Uploading
  lives in two places, both reading the same account field: the profile menu
  and Settings → Profile.
- **All four out-of-app screens share one banner image.** Artboards 11 and 13
  draw a flat gradient there; artboard 11's own PNG shows the signup banner, so
  `AuthShell` uses it on all of them.
- The login sequence's Figma values mostly land on tokens the `--signup-*` and
  `--welcome-*` blocks already declare; only the genuinely new ones are in
  `--login-*`. The simulated mail client is `--mail-*`, the email `--email-*`.
- **The mail client's chrome glyphs are redrawn inline** (`MailIcon.jsx`) rather
  than using the Figma exports, which bake in their colours and would not
  follow the theme. They are third-party client chrome, so they sit beside the
  route rather than in the design-system `Icon`.
- The email's hero keeps the artboard's gradient panel but drops the template's
  isometric artwork and `aidnn` logo; a low-opacity arc motif and the PrepViva
  wordmark stand in.
- Screen 12's spinner is stranded in the artboard's top-left corner. It sits
  with the message instead — a loading screen with no moving part reads as
  stalled.
- **The magic link goes through a "Signing you in" loader**, which Figma has no
  artboard for: the email links straight into the app, and landing instantly
  reads as a page swap rather than a sign-in. `SigningIn` borrows artboard 12's
  treatment — the same moment on the way out — and reuses its stylesheet.
  `SIGNING_MS` and `LANDING` at the top of the file are the two things to
  change; `LANDING` is `/dashboard` now that the screen exists.
- **The billing artboard is the Admin variant.** Its nav (Connectors, People,
  an "Admin" header chip) is deleted per the brief; `AppNav` ships the one set —
  Dashboard, Practice, My Sessions, Performance, Billing, Settings — which
  artboard `39` (`1:10366`) already shows as the user nav.
- Figma's `currency-dollar-circle` is a **pound** circle here; the product
  prices in GBP.
- **The app header's shadow is deliberately heavier than Figma's.** The artboard
  specifies `0 2px 1.5px rgb(0 0 0 / 0.05)`, which reads against the grey content
  column but disappears where a white surface butts straight up under it.
  Raised on request.
- **Stacking is a named scale in `tokens.css`**, not a number picked per file:
  `--z-nav: 20` → `--z-drawer: 30` → `--z-header: 40` → `--z-modal: 100` →
  `--z-toast: 200`. The header sits above both the nav and any side drawer, so
  it stays whole and casts its shadow over them. A **drawer deliberately sits
  under the header** (Figma's scrim starts at y=40 with the header undimmed); a
  **centred modal stays above it** and dims the whole viewport. `Modal` reads
  `var(--modal-z, var(--z-modal))`, so a page opts a panel into the lower layer
  by setting `--modal-z` on the scrim — see `.drawerScrim` in `Billing.module.css`.
- The Visa bitmap in the payment card is set in **type**, not shipped as an
  image — a baked-in logo would not follow the theme.
- The two credit bars measure **opposite things on purpose**: the nav's is
  headed "Credits left" and fills with what remains; the billing card's is
  headed "used" and fills with what is spent. Each bar matches its own heading.
- Billing's table keeps the artboard's cell padding and column *proportions* but
  uses the shared `Table` for `scope`, `aria-sort` and the sort buttons. Spacing
  is matched to `1:13303`: cards fixed at 148px with a 41px head and 32px gap,
  header row 34px, data rows 62px, tab frame at y=278.
- **Column widths are percentages, not the artboard's pixels.** Figma's
  250/200/150×4/219/44 total 1313 in a 1310 block, so as pixels they overflowed
  into a scrollbar the moment the viewport narrowed, and the long date wrapped
  the row to 107px. Held as proportions of the same ratios they scale instead;
  `--billing-table-min` (780px) is the floor below which scrolling takes over.
- **Dates are `dd mmm yyyy`** (`13 Aug 2026`) on request — one change in
  `formatDate`, so every screen follows. The artboard's `November 16, 2024` is
  US long form and too wide for the column.
- **The Transactions tab has no artboard.** It borrows the invoice table's
  anatomy — same widths scale, same status pill, same toolbar. Its rows are
  derived from `invoices()` and reconcile with them: every paid invoice has one
  successful charge on its issue date, the £0 trial invoice has none, the newest
  invoice is unpaid so no charge exists yet, and one older charge was declined
  and retried the next day (which is why a Failed and a Succeeded row share a
  month while the invoice still reads Paid). Change `RETRY_INDEX` in
  `account.js` to move that, or drop it for an all-clean history.
- The transactions empty state only appears on a **trial**, where nothing has
  been charged; it names the trial credits and the first charge date.
- **Credits are stated twice on the credits card's sub-line**, where the other
  two cards put their link. That keeps Figma's 148px card height while still
  meeting the brief — an earlier version added a fourth line and ran 21px tall.
- The **table caption was removed** on request; the table keeps its accessible
  name via `aria-label`.
- **Payment-scheme logos keep their own colours** and ship as assets in
  `src/assets/` — a card brand is not a themeable surface, so the
  inline-in-`currentColor` rule does not apply to them.
- **The cancel flow's four modal artboards (27-30, 31) are one component's
  states**, not four screens: `CancelSubscription` runs form → working → tick →
  confirmation dialog on prototype timers (`WORKING_MS`, `SETTLE_MS`). The
  cancellation lands as the confirmation dialog opens, so the screen behind it
  is already cancelled — which is what artboard 32 draws.
- **The banner (33) waits for that dialog to be dismissed.** Showing both at once
  says the same thing twice; the artboards are two separate moments.
- **Confirming disables the button that was clicked**, which would drop focus to
  `<body>` and out of the dialog. Focus moves to the modal heading first — the
  same fix `ManageCards` uses.
- **Cancelling is uninterruptible once under way**: Escape, the scrim and the
  close button are inert between "Cancel subscription" and the confirmation.
- **The cancelled plan card is 159px, not Figma's 148.** The artboard keeps the
  frame at 148 and lets its own strip overflow. `--billing-card-h-cancel` raises
  the whole row instead, so all three cards keep one bottom edge; every other
  state still measures exactly 148.
- **Renew is a toast, not a screen** — Figma has no artboard for the result, so
  it borrows the pattern artboard 43 uses for the upgrade, and states the date
  and the amount like every other billing message.
- **Purple CTAs use `--brand`, not Figma's purple-900.** The artboards' Renew,
  "Got it" and banner buttons are `graph/purple/purple-900`; the token layer
  already decided that shade for primary actions.
- **Figma's cancel reasons are two ("Not using it enough", "Other").**
  `CANCEL_REASONS` in `account.js` has the seven a candidate actually leaves for
  — interviews sat, price, credits, missing feature — not the template's B2B list.
- **The mail client and the email card are components now** (`MailClient`,
  `EmailCard`), lifted out of `EmailMagicLink` so artboard 34 could reuse them.
  Artboard 34's purple hero is `tone="brand"`; the blue one is the default.
- **The cancellation email is reached from the confirmation dialog** through a
  clearly-marked "Prototype only" link, the same affordance the magic-link flow
  uses — no email is sent, and the brief requires every state to be reachable.
  Its "Back to billing" link carries `{ canceled: true }` in router state, so the
  cancelled screen survives the round trip without storage.
- **Upgrades are charged today, downgrades are scheduled.** Moving up a tier
  restarts the period now and credits the unused part of the old one —
  `prorate()`. Moving down waits for the period end, charges nothing today, and
  shows as a notice on Manage plan and a strip on Billing, each with a Revert.
  Figma's "54 days (includes 24 days converted…)" is the template's.
- **Manage plan is one screen, not six artboards.** 40/44/45/48/50/51 differ
  only by which card is current; the CTA per card comes from `changeKind()`.
- **There is no billing-period toggle anywhere.** The product sells monthly
  only, so Manage plan's Annual/Monthly control, `PlanCard`'s `period` prop and
  the switch-to-annual / switch-to-monthly change kinds were all removed on
  request. `plan.price.annual` stays in `plans.js` and `account.period` still
  reads `'monthly'` — the data layer can still express a year, nothing in the UI
  offers one. Artboards 45/48/50/51 (the annual column) collapse into the one
  set of cards.
- **The scheduled downgrade is stated inside the card it lands in** —
  artboard 54 (`1:14777`) puts a clock, "Downgrade scheduled", the date and a
  "Revert Downgrade" pill where that card's button would be. `PlanCard` takes a
  `footer` that replaces the CTA outright, so the card is not forked.
- **The confirmation dialog is artboard 53 (`1:15085`)** — the same dialog the
  upgrade uses, with "Downgrade scheduled: Core Prep → Starter", the revert
  sentence, and "Got it" rather than "Done".
- **A downgrade does not navigate; an upgrade does.** An upgrade has been
  charged and its credits are live, so "Done" goes to Billing for artboard 43's
  toast. "Got it" on a downgrade stays put — artboard 54 is this same screen
  with the notice now in the card.
- **Billing's strip says "Revert", not Figma's "Renew"** (`1:15251`). Nothing
  has lapsed on a scheduled downgrade; Renew is the cancel strip's word. The
  hero kebab carries the same action, which is what artboard 55 opens it for.
- **Figma's third tier is "Custom pricing / Contact Sales".** Deleted per the
  brief: the buyer is an individual doctor. Intensive has a real price.
- **`PlanChange` takes `onClose` and `onDone` separately.** Dismissing the modal
  must not do what finishing it does — wiring both to one callback navigated
  away as though the plan had changed.
- **The controls setup needed are library components, not screen parts.**
  `StepProgress`, `ChoiceCards`, `ChipGroup` and `FileDrop` started inside
  `Onboarding.jsx`; they are generic, so they moved to `src/components/ui/` and
  are shown in every state at `/kitchen-sink`. The screen kept only what is
  genuinely its own — the shell card height, the worry preview, the question
  block and the footer.
- **The track colours were already in the token layer.** `--track-nhs`,
  `--track-uni` and `--track-pg` sat unused; the track cards now take them
  through `ChoiceCards`' per-option `accent`, which is why NHS, University and
  Postgraduate read blue, pink and teal. `src/data/onboarding.js` names the
  accent per track, so nothing colours a track by hand.
- **First-run setup is a page, not the onboarding modal.** Artboards 15-17 are a
  three-card product tour whose copy `doc/BRIEF.md` deletes outright, and six
  steps of form do not belong in a 594px dialog. `/welcome/setup` is a route in
  `AuthShell` — the same banner-and-card composition signup, welcome and login
  use — so setup looks like the rest of this app.
- **Its flow is `../interview-prototype`'s onboarding, restyled.** Steps, copy
  intent, the worry→focus preview, the "one real question" give before the CV
  ask, and the deferred-required CV all come from
  `src/features/onboarding/` there. The tracks, roles, worries, experience levels
  and the worry map live in `src/data/onboarding.js` here, so a screen never
  hard-codes one.
- **Step 0 is different on purpose.** The reference creates the account in
  onboarding; PrepViva's signup already has name, email and card, so its step 0
  becomes "about you" — confirm the name, add a mobile number.
- **The phone is asked here against the reference's advice.** Its `PhonePrompt`
  deliberately waits until after a first session, on the grounds that asking
  before someone has seen the product costs signups. It is in setup because that
  is what was asked for; the field is optional, and the reasoning is in that file
  if it ever needs revisiting.
- **Only the name blocks progress.** Everything else is skippable — per-step
  Skip on the date and worries steps, "Continue without a CV" on the last one,
  and "Set up later" throughout, which marks the account onboarded and keeps
  nothing. Asking again on the next screen would make that a lie. `ONBOARDED` at
  the top of `account.js` seeds the flag, next to `DAYS_ELAPSED`, so the
  Prototype controls panel can drive it.
- **`--ftu-*` is down to one value.** Once the controls moved to the library and
  onto semantic tokens, the block's colours were dead; `--ftu-card-h` (the fixed
  card height) is all that remains, because it is a fact about that screen only.
- **The CV is not stored, only described.** No backend and no storage: the file's
  name and size go on `account.profile.resume` so the toast can state what was
  attached, and the bytes are dropped. Type and size are still validated
  (`.pdf`/`.doc`/`.docx`, 5MB) — a form that accepts anything teaches nothing.
- **The name setup collects is the account's name**, not a second copy of it.
  That is why `AppLayout` passes the header the live account rather than
  `ACCOUNT` — the same fix `AppNav` needed.
- **The profile menu's second link is Settings, not Figma's "Admin".**
  `doc/BRIEF.md` deletes the Admin variant outright; the gear glyph and the
  destination both already exist in the left nav.
- **`ThemeProvider` has three settings now** — `theme` is what was chosen
  (`system` | `light` | `dark`), `resolved` is what is on `<html>`. `system`
  follows `prefers-color-scheme` and keeps listening; the other two pin it.
  **The default stays `light`**, not `system`: the brief makes light the
  default, and starting from the OS would make that depend on the machine.
- The menu's email is `ACCOUNT.email`, not the artboard's
  `oliver.davies@prepviva.com` — one source for the address.
- The Manage-cards drawer lists **the cards on the account**, not Figma's
  twelve-brand catalogue (Discover, Amex, Apple Pay, GPay, PayPal, UnionPay,
  JCB, Cartes Bancaires, eftpos, with an `okaxis` UPI handle). Two cards are
  seeded so both row states on the artboard — the default one, and one you can
  promote or remove — are reachable.
