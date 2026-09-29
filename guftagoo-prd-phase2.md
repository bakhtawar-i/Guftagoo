# Guftagoo — PRD Phase 2

## Instructions for the agent — read this first

1. **Section 1 below ("Phase 1 — completed") is a condensed summary from
   planning conversations, not a direct read of the current codebase.**
   Before starting any Phase 2 work, read through the actual codebase and
   update Section 1 to accurately reflect what's really been built —
   correct anything that's changed, add anything missing, remove anything
   that no longer applies.
2. Specifically confirm: does the mentor form currently have a LinkedIn URL
   field? This is required for Phase 2 (manual verification depends on it).
   Add it if missing.
3. Only once Section 1 accurately reflects reality, proceed to Section 2
   (Phase 2 — build this now).

## 1. Phase 1 — completed

*Verified against the codebase on 2026-09-29.*

Guftagoo (Urdu for "conversation") is a Pakistani professional referral and
mentorship platform. It connects experienced Pakistani professionals with
people trying to break into their field — for referrals, mentorship, coffee
chats, mock interviews, and CV review. The core insight behind it:
meaningful career introductions rarely happen through cold outreach on
LinkedIn; they happen through people willing to make space for someone else.

### Brand direction (carry forward into Phase 2)

- **Palette (final — keep as is):**
  - Cream `#f9f5eb` — dominant page background (panels and inputs `#fffdf8`)
  - Deep navy `#1c214a` — text, buttons, dark sections and footer
  - Cyan `#1d9fb6` — accent for highlights, focus states, checked options
    (lighter `#55c8cb` on navy; hero logo card `#27b0c7`)
  - Warm amber `#f5ba52` — closing CTA section and small highlights
  - Mint `#e7f5f2` / `#bfe9e7` — "How it works" section, soft shapes
  - Muted grey `#52536a` — secondary body text

  Avoid introducing colors outside this set.
- **Logo:** a text wordmark, `گفتگو | GUFTAGOO` — the Urdu in Aref Ruqaa,
  a thin cyan divider, then "GUFTAGOO" in Space Mono small caps. No circle
  or badge. Navy on light backgrounds, cream on navy. The hero card still
  shows the original PNG logo.
- **Fonts:** Instrument Serif (headlines), DM Sans (body), Space Mono
  (small uppercase labels), Aref Ruqaa (Urdu wordmark). All load from
  Google Fonts.
- **Tone:** warm, human, editorial — not generic tech/SaaS. No mascot.
- **One CTA per audience, repeated** — avoid competing buttons.

### What's built and live

- **Stack:** a single-page React + Vite + Tailwind site in
  `artifacts/guftagoo` (pnpm workspace). Code on GitHub
  (`bakhtawar-i/Guftagoo`); deployed on Vercel from `main` using
  `vercel.json` (Vercel's Root Directory must stay at the repo root). Every
  merge to `main` redeploys automatically. Originally built on Replit; all
  Replit-specific code has been removed.
- **No server code.** The browser inserts signups directly into Supabase
  using the public URL and publishable key (`VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`, set in Vercel and in a git-ignored
  `.env` locally).
- **Landing page:** nav (Why Guftagoo / How it works / "Sign up as a
  Mentor"), hero, navy "Why this exists" quote section, "How it works" (4
  steps: Sign up → Get verified → Get matched → Give back), amber closing
  CTA, footer. Only one audience today: every CTA opens the mentor form.
- **Mentor form** (pop-up, all fields required):
  - Name, email
  - Field — 8 options: Technology & engineering / Product & design /
    Finance & consulting / Medicine & healthcare / Law & policy /
    Marketing & communications / Education & research / Other
  - Years of experience — 0–2 / 3–5 / 6–10 / 10+ years
  - How would you like to help? (multi-select, ≥1) — Referrals / Career
    advice / Mock interviews
  - **No LinkedIn URL field and no consent checkbox yet.**
- **Database:** one Supabase table, `mentor_signups` (id uuid, created_at,
  name, email, field, years_experience, help_options text[]). `check`
  constraints only accept the form's exact option values. Row-level
  security: the public key can insert only — never read, edit or delete.
  Signups are reviewed in Supabase's Table Editor. There is no `status`
  column and no verification workflow yet.
- **Email:** none. No email provider, no sending domain, and no
  confirmation email is sent on signup.
- **Tests:** 4 unit tests for the form logic and the Supabase insert
  (`pnpm test`).
- No admin UI, no accounts or login.

### Gaps to close in Phase 2

- **LinkedIn URL and consent** — missing from the mentor form (see 2.2).
- **Taxonomy differs from 2.1.** Fields (8 → 10), help options (3 → 5)
  and experience ranges (→ seniority bands) all change. The database
  `check` constraints must be migrated together with the form, and existing
  rows mapped:
  - Seniority maps directly: 0–2 → Student/entry, 3–5 → Early career,
    6–10 → Mid career, 10+ → Senior.
  - Help options: Referrals → Referral, Career advice → Mentorship (to
    confirm), Mock interviews → Mock interview.
  - Fields with a clear match: Medicine & healthcare → Medicine/Healthcare,
    Law & policy → Law, Marketing & communications → Marketing/Sales,
    Education & research → Academia/Research, Product & design → Design,
    Other → Other.
  - **Ambiguous, needs a decision:** Technology & engineering (Software/Tech
    or Engineering (non-software)?) and Finance & consulting (Finance or
    Consulting?).
- **Existing mentor signups** have no LinkedIn URL, consent or status —
  decide whether to ask them to re-submit or keep them out of matching
  until verified.
- **Table naming:** 2.9 refers to a `mentors` table; the live table is
  `mentor_signups`. Rename during the Phase 2 migration, or keep the
  current name.
- **Email infrastructure doesn't exist** — build-order step 5 means setting
  it up from scratch, which first needs a domain Guftagoo owns (for
  SPF/DKIM/DMARC) and a provider such as Resend.
- **Server-side code doesn't exist** — Phase 2 needs it for sending email,
  the cold-start check, accept/decline pages and the scheduled matching
  job. Vercel's free (Hobby) plan limits scheduled jobs to once a day, so
  scheduling runs in Supabase instead (see "Decisions" below).

### Decisions made while starting Phase 2 (2026-09-29)

- **Needs/offers reduced to four:** Referral · Career advice · Mock
  interview · CV review. "Mentorship" and "Coffee chat" are dropped.
  Section 2.1 is updated to match.
- **Fields:** the 2.1 list stands as written. Software/Tech and Engineering
  (non-software) stay separate, and so do Finance and Consulting.
- **No existing signups** to migrate. The Phase 1 `mentor_signups` table is
  replaced by a fresh `mentors` table.
- **Scheduling runs in Supabase** (`pg_cron`), not Vercel Cron: Vercel is on
  the free Hobby plan, which limits scheduled jobs to once a day.
- **No domain yet.** Email (build-order steps 5, 6, 9) waits until one is
  bought. Steps 1–4 don't need email.
- **Mentee CTA wording:** "Find a mentor".

## 2. Phase 2 — build this now

This is the active build: a mentee signup form plus an automated matching
engine connecting mentees to mentors by email. Everything below has been
decided — build against these specifics rather than re-opening the
decisions.

### 2.1 Taxonomy (shared by both forms and the matching engine)

**Fields (single-select on both forms):**
Software/Tech · Finance · Consulting · Medicine/Healthcare · Law ·
Engineering (non-software) · Marketing/Sales · Academia/Research · Design ·
Other

**Mentee need (single-select, mentee form only):**
Referral · Career advice · Mock interview · CV review

**Mentor offers (multi-select, mentor form only):**
Same four options as mentee need, so the matcher can check direct overlap.

**Seniority bands (single-select on both forms), always displayed with the
year range in parentheses so there's no ambiguity:**
- Student/entry (0–2)
- Early career (3–5)
- Mid career (6–10)
- Senior (10+)

### 2.2 Mentor form — updates needed

- **Confirm/add LinkedIn URL field (required).** Required for manual
  verification.
- Add **seniority band** if not already present (years-of-experience field
  from Phase 1 should map to/be replaced by these bands).
- Add a **consent checkbox**: "I agree to have my email shared with a
  matched mentee." Required to be checked before submission.

### 2.3 Landing page — add a mentee entry point

The current live page is built around a single "Sign up as a Mentor" CTA.
Once the mentee form exists, add a second, equally clear path to it —
e.g. a "Sign up as a Mentee" (or similar wording) button in the nav and/or
hero, alongside the existing mentor CTA, so both audiences have a direct
way in. Keep to the existing one-CTA-per-audience principle — don't turn
this into a page with many competing buttons, just one clear CTA for each
of the two audiences.

### 2.4 Mentee form — new, build this

Fields:
- Name
- Email
- **LinkedIn URL** (required — same verification rationale as mentor form)
- Field (single-select, from taxonomy)
- Seniority band (single-select, from taxonomy) — this is the mentee's
  *own* current level, used to enforce the seniority-gap rule against
  mentor bands
- Need (single-select, from taxonomy: Referral / Mentorship / Coffee chat /
  Mock interview / CV review)
- **"Also open to an adjacent field" checkbox** — when checked, reveals a
  second dropdown (same field list) letting them pick exactly one
  additional field they're willing to be matched into. Always shown at
  submission time regardless of whether their primary field currently has
  mentors.
- Consent checkbox: "I agree to have my email shared with a matched
  mentor."
- Short free-text field (optional, character-limited) for context — not
  used by the matching logic, just shown to the mentor after a match for
  color.

On submission, if the mentee's field (and adjacent field, if selected) has
**zero eligible mentors right now**, show an honest message: "You're in the
queue — we'll email you as soon as we find a match." Do not block
submission or treat this as an error state.

### 2.5 Matching rules

- **Field matching:** exact match on primary field by default. If the
  mentee checked the adjacent-field box, mentors in that second field are
  also eligible. No fuzzy/semantic field matching — exact string match
  against the fixed taxonomy only.
- **Seniority gap:** the mentor's band must be strictly higher than the
  mentee's band (no same-band matching). No upper limit — a Student/entry
  mentee can be matched with a Senior mentor.
- **Need/offer overlap:** the mentee's single selected need must be present
  in the mentor's multi-select offers list.
- **Capacity:** every mentor is capped at **2 open/active intro requests at
  a time** (fixed for all mentors at launch, not user-configurable yet).
  A mentor at capacity is excluded from candidate selection until one of
  their current requests resolves (accepted, declined, or expired).
- **Candidate selection:** when a mentee is ready to be matched, select up
  to **2 eligible mentors in parallel** and send both an intro request
  simultaneously. First to accept wins the match.
  - **When both accept:** the first accept (by timestamp) wins. The second
    mentor's request is automatically marked "already matched" and they
    receive a short polite email — no scramble, no manual intervention
    needed.
- **Response window:** each mentor has **5–7 days** to accept or decline.
  Send **one reminder email around day 3–4** if no response yet. If the
  window expires with no response, mark the request expired and select the
  next eligible candidate (if any remain).
- **Rematching:** a declined or expired mentor/mentee pair should never be
  proposed again.

### 2.6 Verification & rejection (manual, no dashboard needed yet)

Mentor status field: `pending` → `verified` / `rejected` / `needs_more_info`.
Editable directly in Supabase's table view for now — no admin UI needed at
this stage.

- **Obvious scam/spam/fake submission:** mark `rejected`, no email sent at
  all. Sending a response just confirms the address is monitored.
- **Genuine person, can't confirm details:** mark `needs_more_info`, send a
  short polite email asking them to reply with more detail or a working
  LinkedIn link. Keep it simple — no resubmission flow needed, they can
  just fill the form again later, which is allowed.
- Only `verified` mentors are eligible for matching.

### 2.7 Post-match flow — email-intro only (no messaging, no Meet integration)

Decided explicitly: **no in-platform messaging and no Google Meet/calendar
integration for this phase.** Both are real, separately-scoped features
with meaningful cost (moderation, spam handling for messaging; OAuth and
scheduling logic for Meet) that aren't justified at current volume. Revisit
only if there's clear evidence people want to stay on-platform.

- **Accept/decline links** sent to the mentor must be signed, single-use,
  expiring tokens (store hashed, not plaintext). Critically: **email
  scanners pre-fetch links**, so clicking must never trigger the action via
  a plain GET request. The link opens a page with explicit Accept / Decline
  buttons that POST — nothing happens until the mentor actively clicks a
  button on that page.
- **On accept:** send one intro email to both mentor and mentee, sharing
  each other's name and email. From there, scheduling (a call, a coffee
  chat, whatever the need was) is entirely up to them — be explicit in this
  email that Guftagoo does not provide a scheduling tool, and they should
  arrange timing directly based on mutual availability (email, WhatsApp,
  their own Meet/Calendly link, etc.).
- **Day 5–7 check-in email** sent automatically to both people after a
  match, asking whether they connected yet. Reply-to should route to the
  founder's inbox. This is the main safety net against missed emails (in
  place of building delivery-tracking or in-platform messaging) and also
  doubles as the data source for tracking whether matches are actually
  landing.

### 2.8 Email templates needed (build all of these)

1. Mentor signup confirmation (immediate, on form submit)
2. **Mentor welcome / how-it-works email** — explains: you'll get an intro
   request by email when matched, ~1 week to respond, capped at 2 active
   intros at a time, and scheduling after a match is entirely on them (no
   platform tool for it).
3. Mentor "couldn't verify" polite follow-up (needs_more_info case)
4. Mentee signup confirmation (immediate, on form submit)
5. **Mentee welcome / how-it-works email** — explains: how matching works
   (exact field by default, optional adjacent field, seniority rule), that
   it may take time if their field is thin on mentors, and scheduling after
   a match is on them.
6. "You're in the queue" email (cold start / no eligible mentor yet)
7. Intro request to mentor (contains the signed accept/decline link)
8. "Already matched" polite email (to the losing side of a parallel pair)
9. Match/intro email to both mentor and mentee (contact info shared)
10. Declined/expired notice — mentee side ("we're trying the next mentor" /
    "back in queue" as appropriate)
11. Day 5–7 check-in email (to both sides of a completed match)

All emails need a consistent footer with a way to pause/unsubscribe.
Confirm whether transactional email infrastructure (custom domain, SPF/
DKIM/DMARC, a provider like Resend/Postmark) is already set up from Phase
1's signup-confirmation emails — if not, this needs to be stood up before
any of the above templates can reliably send.

### 2.9 Data model additions (Supabase)

- **`mentors` table:** add `linkedin_url`, `seniority_band`, `status`
  (`pending`/`verified`/`rejected`/`needs_more_info`), `offers` (array/
  multi-select), `active_request_count` (or compute from `intro_requests`),
  `email_consent` (boolean).
- **`mentees` table (new):** `name`, `email`, `linkedin_url`, `field`,
  `adjacent_field` (nullable), `seniority_band`, `need`, `status`
  (`queued`/`matched`/`declined_all`), `email_consent` (boolean), optional
  free-text context field.
- **`intro_requests` table (new):** `mentor_id`, `mentee_id`, `status`
  (`sent`/`accepted`/`declined`/`expired`/`already_matched`/`cancelled`),
  `token_hash`, `sent_at`, `expires_at`, `responded_at`.
- RLS on every new table: public/anon key can insert only, never read.
  Matching logic and any status changes run server-side with the service
  key.
- One request per mentor/mentee pair ever (no rematching a declined pair)
  — enforce with a constraint or a check in the matching query.

### 2.10 Build order for this phase

1. ✅ Confirm/add LinkedIn URL field on the mentor form; add consent checkbox.
2. ✅ Build the mentee form (all fields from 2.4), with the adjacent-field
   prompt and cold-start messaging.
3. ✅ Add the mentee entry point to the landing page (2.3).
4. ✅ Data model migrations for the additions in 2.9
   (`supabase/migrations/`). `active_request_count` is computed from
   `intro_requests` rather than stored. The cold-start check is a database
   function, `mentee_match_available`, that returns only true/false.
5. Confirm/stand up transactional email infrastructure if not already
   solid from Phase 1.
6. Build all templates from 2.8.
7. Build the accept/decline token pages (POST-based, per 2.7).
8. Build the matching engine as a scheduled job: select eligible mentees,
   apply filters (2.5), send parallel requests, handle expiry/reminders,
   handle the both-accept race condition.
9. Build the day 5–7 check-in job.
10. Test the full flow end to end with fake data before any real mentee
    traffic hits the form — specifically test: zero-mentor cold start,
    both-mentors-accept race, expiry-then-next-candidate, and a rejected
    mentor never appearing in matching.

## 3. Explicitly out of scope (this phase and beyond, until revisited)

- In-platform messaging between matched mentor/mentee
- Google Meet / calendar integration or any scheduling tool
- Automated verification (work-email domain checks, etc.) — manual only
- Full admin dashboard UI — Supabase's own table editor is sufficient at
  current volume
- User accounts / login for mentors or mentees
- Mobile app
- Mentor-configurable capacity (fixed at 2 for everyone at launch)
