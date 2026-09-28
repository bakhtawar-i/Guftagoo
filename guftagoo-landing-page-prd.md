# Guftagoo — Mentor Landing Page PRD

## Instructions for the agent — read this first

Before doing anything else:

1. **Read through the actual codebase first.** Section 2 below ("What was
   already built") was written from screenshots taken partway through
   development and may be out of date — the page has been iterated on
   further since then.
2. **Update Section 2 to match what the code actually shows** — sections
   present, their content/copy, the current form fields, and the current
   state of any backend/persistence logic. Correct or remove anything in
   Section 2 that no longer matches reality, and add anything present in
   the code that isn't mentioned.
3. **Re-check the two "should be fixed" notes in Section 2** (the redundant
   three-card section, and the nav logo sizing) against the actual code —
   they may already be resolved. Don't redo work that's already done.
4. Only once Section 2 accurately reflects the current codebase, proceed to
   Section 3 (Immediate next steps).

## 1. What this project is

Guftagoo (Urdu for "conversation") is a Pakistani professional referral and
mentorship platform. It connects experienced Pakistani professionals with
people trying to break into their field — for referrals, career advice, and
mock interviews. The core insight behind it: meaningful career introductions
rarely happen through cold outreach on LinkedIn; they happen through people
who are willing to make space for someone else.

This specific project is **not the full platform yet** — it is a single
landing page whose only job is to recruit mentors for a founding cohort and
capture their signup information. Mentor/mentee matching, accounts, and the
rest of the platform are future work, out of scope here.

### Brand direction (carry this forward)

- **Palette (final — matches the live code, keep as is):**
  - Cream `#f9f5eb` — the dominant page background (lighter panels and
    form inputs use `#fffdf8`)
  - Deep navy `#1c214a` — text, buttons, and the dark "Why this exists"
    section and footer
  - Cyan `#1d9fb6` — the accent for highlights, focus states and checked
    options (a lighter `#55c8cb` is used on navy; the hero logo card is
    `#27b0c7`)
  - Warm amber `#f5ba52` — the closing call-to-action section and small
    highlights (button arrow circles, the "make room" badge)
  - Mint `#e7f5f2` / `#bfe9e7` — the "How it works" section and soft
    background shapes
  - Muted grey `#52536a` — secondary body text

  Avoid introducing new colors outside this set.
- **Logo:** the word "گفتگو" (Guftagoo) set in the Aref Ruqaa Urdu typeface,
  paired with "GUFTAGOO" in Latin small caps. In the nav, this appears as a
  circular badge — cyan circle background with the navy Urdu wordmark inside
  — sized large enough to actually be legible (at least ~44–48px), not a
  tiny illegible smudge. *Deferred until after the Vercel launch* — see
  Section 2 for the current state.
- **Fonts (current):** Instrument Serif (headlines), DM Sans (body text),
  Space Mono (small uppercase labels). Aref Ruqaa is **not** loaded yet — the
  Urdu wordmark currently exists only inside the PNG logo image. Font work is
  deferred until after the Vercel launch, together with the logo.
- **Tone:** warm, human, editorial — not generic tech/SaaS. No mascot or
  cartoon character; personality comes from copy voice and the Urdu wordmark
  itself, not an illustrated character.
- **One CTA, repeated:** "Sign up as a Mentor" — avoid multiple competing
  buttons on the page.

## 2. What was already built (on Replit)

*Verified against the codebase on 2026-09-26. The page lives in
`artifacts/guftagoo/src/App.tsx`.*

An AI-agent-built version of this landing page exists and was exported from
Replit. The page, top to bottom:

- **Header / nav** — logo on the left; "Why Guftagoo", "How it works" and a
  "Sign up as a Mentor" button on the right (collapses into a menu on
  mobile).
- **Hero section** — a small pill label ("A community built on
  generosity"), the headline "Your next *conversation* could change a
  life.", and the subhead "Guftagoo connects experienced Pakistanis with
  people finding their way into the careers they've been dreaming about."
  Primary "Sign up as a Mentor" button, plus a secondary "See how it works"
  text link. On the right, a tilted cyan card showing the logo image, with
  a "Give what you know" tag, an amber "make room" circle badge, and the
  location line "Lahore · Karachi · Islamabad · everywhere".
- **"Why this exists" section** — navy full-bleed section. Side note:
  "Because a closed door is often just a missing introduction." Quote:
  "Someone once made space for me at the table. *Guftagoo is how we pass
  the chair on.*"
- **Three-card "What a little time can do" section** — ✅ **already
  removed.** No further work needed.
- **"How it works" section** (mint background) — "Four steps. *One
  ripple.*" with four numbered steps: Sign up → Get verified → Get matched
  → Give back, each with a one-line description, followed by a "Sign up as
  a Mentor" button.
- **Closing CTA section** (amber background) — "Your seat is waiting" /
  "Have a little *guftagoo.*" with "The best thing you can give someone at
  the beginning is proof that they belong in the room." and the "Sign up as
  a Mentor" button.
- **Footer** (navy) — logo, "Conversations that make room for what's next.",
  "Back to top" link, "Made for Pakistanis, everywhere".
- **Signup form** — ✅ **field split already done.** It opens as a pop-up
  window from any "Sign up as a Mentor" button. Heading "Bring what you
  know." Fields (all required):
  - Name
  - Email
  - Field — Technology & engineering / Product & design / Finance &
    consulting / Medicine & healthcare / Law & policy / Marketing &
    communications / Education & research / Other
  - Years of experience — 0–2 / 3–5 / 6–10 / 10+ years
  - How would you like to help? — checkboxes, pick at least one: Referrals /
    Career advice / Mock interviews

  On success it shows "You're on the list." with a thank-you message. If
  saving fails it shows an error and lets the person try again.
- **Nav logo sizing** — ⏳ **still open, deferred until after the Vercel
  launch.** The nav and footer currently show the whole square logo image
  (`public/guftagoo-mark.png`) at 64px. It isn't a circle, and the Urdu text
  is only a small part of the image, so it shows up tiny. The image already
  contains "GUFTAGOO", and the same word is repeated as text beside it. In
  the footer that text is navy on navy and effectively invisible.
- **Backend (current state)** — a separate Express API server
  (`artifacts/api-server`) with one endpoint, `POST /api/mentor-signups`,
  which validates the form and saves it to a Postgres database through
  Drizzle, connecting via a `DATABASE_URL` environment variable
  (`lib/db`). The table `mentor_signups` stores: id, name, email, field,
  years_experience, help_options (list), created_at. Automated tests exist
  for this endpoint and for the form logic.
  **Not built yet:** a private way for the team to review signups, and
  signup counts. The Replit-managed database did not travel with the export,
  so any signups collected on Replit are not here.

The project code was exported from Replit and is now on GitHub.

## 3. Immediate next steps (this task)

Move the project off Replit entirely and onto a self-owned stack:

1. ✅ **Remove Replit-specific setup** — done. Replit config, plugins and
   the Postgres/`DATABASE_URL` code are gone; the site runs with a plain
   `pnpm dev` (see `README.md`).
2. ✅ **Git and GitHub** — done; the project is on GitHub.
3. ✅ **Supabase replaces Replit's database** — done. The
   `mentor_signups` table (id, created_at, name, email, field,
   years_experience, help_options) has `check` constraints that reject
   invalid values, and row-level security lets website visitors *insert*
   only — never read, edit or delete. The form saves directly from the
   browser with `@supabase/supabase-js`; the separate Express API server
   (the "middleman") was removed. Signups are reviewed in the Supabase
   dashboard's Table Editor.
4. ✅ **Environment variables** — done. `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_PUBLISHABLE_KEY` live in `artifacts/guftagoo/.env`, which
   is git-ignored; `.env.example` is the committed template.
5. **Deploy via Vercel** — connect the GitHub repo, add the same Supabase
   environment variables in Vercel's project settings, and deploy to get a
   production URL.
6. **Right after launch: logo and fonts.** The three-card section is already
   removed. What's left is fixing the nav logo (the circular badge described
   in Section 1, and footer contrast) and loading Aref Ruqaa for the Urdu
   wordmark.

## 4. Explicitly out of scope for now

- Mentor/mentee matching logic
- User accounts, authentication, or login
- Any admin dashboard beyond a simple way to view captured signups
- Analytics/metrics beyond basic signup counts
- Mobile app or anything beyond a responsive web landing page
