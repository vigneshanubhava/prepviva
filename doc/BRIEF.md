# PrepViva — build brief

> NOTE: the original file was an RTF-wrapped `.md`. This is the same text, restored
> as plain markdown after an accidental overwrite. Content is unchanged.

Product: AI mock-interview practice for UK medical candidates.
Three tracks: NHS, University, Postgraduate.
Building now: signup, trial, login, onboarding, billing, cancel, upgrade, downgrade.

## SOURCE OF TRUTH — read this first, it is the most important section

Three sources. They do NOT have equal authority. When they disagree, this order wins:

1. `docs/tokens.css`           — ALL styling. Colour, type, spacing, radius, shadow.
2. `docs/PLAN-MODEL-AND-COPY.md` — ALL content. Prices, credits, features, copy, trial rules.
3. Figma / `docs/figma-screens/` — ONLY layout, composition and screen inventory.

**The Figma contains content from a different product.** It was built on a B2B SaaS
template. Do NOT copy any of the following from it — all of it is wrong:

- Prices ($39/$359 and $49/$499 — three inconsistent sets across screens)
- Credit amounts (50,000 / 500,000 / "1,000 credits per analysis")
- Features: "Editors", "viewers", "concurrent sessions", "ZDR", "SAML SSO", "MFA",
  "admin controls", "User roles & permissions", "Onboarding Services"
- "Custom pricing / Contact Sales" tier
- The "Admin" navigation (Connectors, People)
- The onboarding modal copy about highlighting text and "Ask Prep Viva"
- Any typo: "Hace", "Pervious", "Currenly", "Trail", "Starterduct", "Expire on 06/32"

Take LAYOUT from Figma. Take EVERYTHING ELSE from the two docs.

If a screen's layout assumes content that no longer exists (e.g. a features list with
six enterprise bullets), adapt the layout to the real content rather than inventing
filler to fill the space. Tell me when you do this.

## STYLING RULES — non-negotiable

- Every colour, size, radius and shadow comes from a token in `tokens.css`.
- NEVER write a hex value, an rgb(), or a raw px font-size in a component.
- NEVER reference a primitive token (`--purple-600`, `--gray-400`) in a component.
  Components use semantic tokens only (`--brand`, `--text-muted`, `--surface-raised`).
- Breaking this breaks dark mode silently. It is the single easiest thing to get wrong.
- Light theme is the default. Dark works via `data-theme="dark"` on `<html>` and must
  need zero markup changes. Build a theme toggle in Settings and verify every screen
  in both.

## STACK

Vite + React + Tailwind v4 + React Router. JavaScript, not TypeScript.
No backend. All data mocked in memory. No localStorage or sessionStorage.

## MOCK BEHAVIOUR

This is a clickable design prototype, not a real app.
- No real emails. The magic-link flow is simulated end to end: enter email →
  "generating secure link" → "check your inbox" → a clearly-marked mock affordance
  ("View the email — prototype only") → email screen → click → logged in.
- No real Stripe. The checkout screen collects card details visually and always succeeds.
- Password login exists as a secondary path alongside magic link.
- Every state must be reachable. Add a small, clearly-labelled "Prototype controls"
  panel (trial day, plan, payment status, credits, theme) so any state can be forced
  without a backend.

## TRIAL RULES

14 days. 3 free credits. Card collected at signup but NOT charged during the trial.
Top-ups allowed if the 3 credits run out before day 14. First charge on day 15.
Every trial-related screen must state both the date and the amount.

## NAVIGATION — one set only

Dashboard · Practice · My Sessions · Performance · Billing · Settings

## ACCESSIBILITY

Keyboard navigable, visible focus states, labelled inputs, errors announced,
modals trap focus and close on Escape, tables have proper headers.

## WHEN YOU FINISH A PHASE

Run `npm run build`, confirm it compiles, then list every route you added and
anything you adapted or had to decide yourself.
