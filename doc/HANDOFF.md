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

That makes the **Prototype controls panel** the brief asks for (force trial day,
plan, payment status, credits, theme) the natural thing to build alongside —
`account.js` is already shaped for it, but nothing writes to it yet.

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
No backend, no localStorage/sessionStorage. `npm run dev` → http://localhost:5173

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
**`/billing`** (the dashboard is not built, so signing in lands on the one
signed-in screen that is). The loader replaces its own history entry, so Back
from Billing returns to the email rather than signing you in again.

**First run gates the app**: `AppLayout` sends an account with
`onboarded: false` to `/welcome/setup`, so the first signed-in screen anyone
reaches is setup. Finishing it, or "Set up later", lands on `/billing`.

Plan travels in the query string; name/email travel in React Router `state`
(the brief rules out storage). Each login screen falls back to
`oliver.davies@example.com` on a direct visit, the same fallback checkout and
welcome use, so every screen stays reachable by URL.

## Shared components — `src/components/`

| Component | What it owns |
|---|---|
| `Logo` | The mark + wordmark lockup. Used by `AppHeader`, `AuthShell` and the email. |
| `AppHeader` | The fixed app header from `1:2121`. Pages clear it with `--app-header-h`. |
| `AuthShell` | Banner + card page shell for the out-of-app screens (`1:2167`, `1:2230`, `1:3169`, `1:5516`). Props: `tone` (`welcome`/`signup`), `gap` (`lg`/`apart`). |
| `AppNav` | The left navigation, its credits panel, and the collapse toggle. |
| `AppLayout` | Shell for every **signed-in** screen: `AppHeader` + `AppNav` + content column. Wrap new signed-in screens in this. |
| `BrandMark` | Payment-scheme logos (Visa, Mastercard) at Figma's 49×16. |
| `PlanCard` | One plan card — Figma draws the same one on the public pricing page (`14:11391`) and on Manage plan. Takes `badge`, `cta`, `note` and `footer` (which replaces the CTA — artboard 54's scheduled-downgrade notice); exports `PlanIcon` and `Tick`. |
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
schedule, keepPlan, onboard, skipOnboarding, updateCards, notice, setNotice }`. **Signed-in screens read
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

## Component library — `src/components/ui/`

Avatar, Badge, Banner, Button, Card, Checkbox, EmptyState, Field, Icon, Input,
Modal, Radio/RadioGroup, SegmentedControl, Select, Skeleton, Spinner, Table,
Tabs, Toast, VisuallyHidden. All exported from `index.js`.

Every one is shown in every state at `/kitchen-sink`.

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
   Per-screen blocks already exist: `--pricing-*`, `--signup-*`, `--checkout-*`,
   `--welcome-*`, `--login-*`, `--mail-*`, `--email-*`, `--billing-*` and
   `--cancel-*`, plus the shared `--app-header-*`, `--app-nav-*` and
   `--app-credits-*`. Each declares a **light value matching Figma exactly and a
   derived dark value**. Add a new block per screen the same way — but check the
   existing blocks first: most of the login sequence resolved onto `--signup-*`
   and `--welcome-*` values that already matched.
   Keep `doc/tokens.css` in sync: `cp src/styles/tokens.css doc/tokens.css`.
4. Light is default; dark is `data-theme="dark"` on `<html>` with **zero markup
   changes**. Check every screen in both.

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

Lint has 6 known benign `only-export-components` fast-refresh warnings
(Icon, Field, Toast, Avatar, ThemeProvider, AccountProvider). Anything beyond
those is new.

## Known gaps / not built

- **Prototype controls panel** the brief asks for (force trial day, plan, payment
  status, credits, theme) — not built. `src/data/account.js` is shaped for it.
- `AppNav` read `billingSummary()` off the module default, so the nav's credits
  panel never followed a plan change; it reads `useAccount()` now. Any new
  chrome that shows account figures must do the same.
- **The filter button, "Download invoice" and the row kebab are inert.** They are
  on the artboard with no target screen behind them. The hero kebab is live —
  it opens the cancel flow, and offers Renew once cancelled.
- Below ~960px the invoice table scrolls horizontally — eight columns cannot fit
  and still hold their content on one line. Above that it never scrolls.
- Nothing in the Manage-cards drawer reaches Stripe — the panel's own copy says
  payment methods are handled there, and this prototype has no Stripe. "Set as
  default" and remove mutate component state only, so they reset on reload.
- Setup's answers have nowhere to be edited afterwards — its copy says Settings,
  which is not built. Whatever builds Settings should read `account.profile`
  (phone, track, role, date, experience, worries, CV).
- `/welcome/setup` stays reachable by URL after it has been through, which is how
  it is demonstrated a second time without a reload. It does not redirect an
  already-onboarded account away, deliberately.
- **Settings itself is not built** — the profile menu's Settings link and the
  nav's both land on the "not built" placeholder. The theme control the brief
  wanted there lives in the profile menu, which is where artboard 18 puts it.
- Links to `/terms`, `/dashboard`, `/practice`, `/sessions`, `/performance`,
  `/settings` and `/login/password` currently land on the "not built"
  placeholder. It keeps the signed-in shell (header, left nav, credits panel)
  for the paths the nav owns — `isSignedInPath()` in `src/data/nav.js`, which is
  also where the one nav set now lives — and stays a bare card for the rest.
  `/dashboard` is where the magic link signs you in, so it is the next one worth
  building.
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
- Avatars are initials, not a stock photo.
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
  change; `LANDING` becomes `/dashboard` when that screen exists.
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
