# Plan model, trial rules & copy fixes

Companion to `tokens.css`. Everything here supersedes what's in the Figma.

---

## 1. Plans — GBP placeholders

Prices are placeholders you'll replace. The **structure** is the part to keep: credits
in your own currency (1 credit ≈ 10 minutes), and features a candidate cares about.

| | Starter | Core Prep | Intensive |
|---|---|---|---|
| Monthly | **£29** | **£59** | **£99** |
| Annual (save 20%) | £278 | £566 | £950 |
| Credits / month | 12 | 30 | 60 |
| In plain terms | ≈ 2 full panels | ≈ 5 full panels | ≈ 10 full panels |
| Tracks | All three | All three | All three |
| Feedback | Scores + summary | Detailed + model answers | Detailed + model answers |
| Recording retention | 30 days | 90 days | 12 months |
| Processing | Standard | Standard | Priority |
| Badge | — | **Recommended** | — |

**Always show credits twice** — the number and what it buys. "30 credits ≈ 5 full panel
interviews". Nobody reasons in credits.

### Removed from the Figma, and why

| Removed | Reason |
|---|---|
| Editors / viewers | One candidate, practising alone |
| Concurrent sessions | You can't sit two interviews at once |
| ZDR, SAML SSO, MFA, admin controls | Enterprise procurement language |
| "Custom pricing / Contact Sales" | The buyer is an individual doctor, not a procurement team |
| 50,000 / 500,000 credits | Wrong currency — conflicts with 1 credit ≈ 10 min |
| "1,000 credits per analysis" | There are no analyses in this product |

---

## 2. Trial

- **14 days**, starting at signup
- **3 free credits** included
- Card **is collected** at signup but **not charged** during the trial
- If the 3 credits run out before day 14, the user can **top up** without ending the trial
- First charge lands on day 15 unless cancelled

### Copy

| Where | Text |
|---|---|
| Pricing CTA | Start 14-day trial |
| Under CTA | 3 credits included. No charge for 14 days. |
| Signup header | You're starting a 14-day trial of **[Plan]**. |
| Card step | You won't be charged until [date]. Cancel any time before then. |
| Welcome | Your 14-day trial is live — 3 credits ready to use. |
| Nav badge | 9 days left in your trial |
| Credits gone, trial live | Trial credits used. Top up to keep practising, or wait for [date]. |
| Day 3 remaining | Your trial ends on [date]. You'll be charged £59. |

**Every trial screen states the date and the amount.** Surprise charges are the number
one billing complaint, and they're entirely avoidable.

---

## 3. Navigation — one set only

```
Dashboard · Practice · My Sessions · Performance · Billing · Settings
```

Delete the "Admin" variant from the Figma. **Connectors** and **People** belong to a
team product; this one has neither.

---

## 4. Login

Magic link is the primary path. For the mock, no email is actually sent — the flow
simulates it end to end:

```
Enter email → "Generating secure link" → "Check your inbox"
  → a visible "Open the email" affordance (mock only, clearly marked)
  → email screen → click → logged in
```

Password login stays available as a secondary option so the design covers both.

---

## 5. Copy corrections

| Figma | Corrected |
|---|---|
| Hace a promo code? | Have a promo code? |
| Pervious invoice | Previous invoices |
| Currenly Plan | Current plan |
| Trail | Trial |
| Starterduct tour | Product tour |
| Expire on 06/32 | Expires 06/28 |
| PrepViva pricing planare design to meet your needs as you grow | Plans that scale with how much you practise |
| What's your email? (This will be you login ID) | Email address — you'll sign in with this |
| Choose the practice rhythm that fits your interview date. | *(keep — this one is good)* |

### Onboarding modals — rewritten

The current copy ("Highlight any text to unlock instant insight… Tap 'Explain' or
'Ask Prep Viva'") describes a document-analysis product. Three cards, replaced:

1. **Pick your track** — NHS, university or postgraduate. Your interviewer adapts to the
   role, band and specialty you're actually applying for.
2. **Practise on camera** — Real questions, timed or guided, with an examiner that probes
   like a real panel.
3. **See what to fix** — Scored on communication, structure, evidence and judgement, with
   the exact moments to work on.

---

## 6. Colour decisions

**Purple is brand only.** Primary buttons, active nav, brand surfaces. Never status,
never a track.

**Tracks sit outside brand and status** so a fourth track can be added without stealing
a colour that already means something:

| Track | Colour | Why |
|---|---|---|
| NHS | Blue | The NHS is blue |
| University | Pink | Distinct from red-as-danger |
| Postgraduate | Teal | Distinct from green-as-success |

Change any of these in one place: `--track-*` in `tokens.css`.

---

## 7. What the tokens replaced

| | Figma | Now |
|---|---|---|
| Fill colours | 103 | ~40 semantic tokens |
| Font families | 8 | 1 |
| Font sizes | 19 (incl. 13.5, 11.1999998) | 8 |
| Corner radii | 31 (incl. 0.5, 6.6666660) | 6 |
| Variables / styles | 0 | Full semantic layer |

---

## 8. Dark mode

Already built. Every semantic token has a dark value; `[data-theme="dark"]` on `<html>`
switches it. **No component markup changes.**

The one rule that keeps this true: components must never reference a primitive
(`--purple-600`) or a raw hex. Only semantic tokens (`--brand`, `--surface-raised`).
Break that rule once and dark mode starts leaking light-theme colours.
