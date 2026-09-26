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

- **Palette:** butter-yellow background (~`#FDE47F`) as the dominant tone,
  deep navy (~`#14304A`) for text and grounding sections, a single bright
  cyan accent (~`#1FB6D8`) used sparingly for buttons/highlights. Avoid
  introducing new colors outside this set.
- **Logo:** the word "گفتگو" (Guftagoo) set in the Aref Ruqaa Urdu typeface,
  paired with "GUFTAGOO" in Latin small caps. In the nav, this appears as a
  circular badge — cyan circle background with the navy Urdu wordmark inside
  — sized large enough to actually be legible (at least ~44–48px), not a
  tiny illegible smudge.
- **Tone:** warm, human, editorial — not generic tech/SaaS. No mascot or
  cartoon character; personality comes from copy voice and the Urdu wordmark
  itself, not an illustrated character.
- **One CTA, repeated:** "Sign up as a Mentor" — avoid multiple competing
  buttons on the page.

## 2. What was already built (on Replit)

An AI-agent-built version of this landing page already exists on Replit
(free/Starter plan). It included:

- **Hero section** — headline, subhead, primary CTA, a tilted phone-style
  mockup graphic showing the Urdu wordmark on a cyan card, and a location
  line ("Lahore · Karachi · Islamabad · Everywhere").
- **"Why this exists" section** — a navy full-bleed section with a strong
  founder's-note-style quote about referrals and opportunity.
- **A three-card supporting section** ("What a little time can do") that
  was judged redundant with the quote section above it — **this should be
  cut or merged into a single short line, not rebuilt as-is.**
- **"How it works" section** — four numbered steps: Sign up → Get verified →
  Get matched → Give back, each with a one-line description.
- **Closing CTA section** on a warm/orange background repeating the
  "Sign up as a Mentor" button.
- **A signup form** ("Bring what you know") collecting: name, email, and a
  single "Where can you help?" dropdown. This field was identified as
  ambiguous and should be **split into two fields** in the rebuild:
  - Field/industry (e.g. Tech, Finance, Medicine, Law, Marketing, etc.)
  - How they'd like to help (multi-select: Referrals / Career advice / Mock
    interviews)
  A **years-of-experience field** should also be added (simple number input
  or a range like 0–2 / 3–5 / 6–10 / 10+), since mentor seniority will
  eventually matter for matching.
- **Backend/persistence work in progress on Replit**, including tasks to
  save mentor signups reliably (so submissions aren't lost on refresh),
  give the team a private way to review captured signups, and measure
  completed signups without storing unnecessary personal data. This work
  was **not finished** before moving off Replit — the underlying
  Replit-managed database does not travel with the exported code and will
  need to be rebuilt against the new backend (see below).

The full project code was exported from Replit as a ZIP (not via Git, due
to a plan limitation) and is the starting point for this handoff.

## 3. Immediate next steps (this task)

Move the project off Replit entirely and onto a self-owned stack:

1. **Set up the project in Cursor** using the exported code as the base.
   Audit it for anything tied specifically to Replit's managed database or
   environment (e.g. `DATABASE_URL` references, Replit-specific config) —
   this logic needs to be replaced, not just copied over.
2. **Initialize Git and push to GitHub** (the export did not include Git
   history), so the project has proper version control going forward.
3. **Stand up a Supabase project** to replace Replit's database:
   - Recreate the mentor-signup table with fields: name, email, field/
     industry, years of experience, how they'd like to help (multi-select).
   - Rebuild the form-submission logic against Supabase's client library
     instead of whatever Replit's managed Postgres integration was doing.
4. **Environment variables** — store the Supabase URL and API key as env
   vars (not committed to Git). Add `.env` to `.gitignore` before the first
   commit if not already present.
5. **Deploy via Vercel** — connect the GitHub repo, add the same Supabase
   environment variables in Vercel's project settings, and deploy to get a
   production URL.
6. **Apply the two outstanding design fixes** while rebuilding (see section
   2): cut/merge the redundant three-card section, and fix the nav logo
   sizing.

## 4. Explicitly out of scope for now

- Mentor/mentee matching logic
- User accounts, authentication, or login
- Any admin dashboard beyond a simple way to view captured signups
- Analytics/metrics beyond basic signup counts
- Mobile app or anything beyond a responsive web landing page
