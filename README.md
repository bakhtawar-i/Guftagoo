# Guftagoo

Landing page that recruits mentors for Guftagoo's founding cohort. Mentor
signups are saved to a Supabase database. See
`guftagoo-landing-page-prd.md` for the product brief.

## Run it on your computer

You need [Node.js](https://nodejs.org) 22 or newer and
[pnpm](https://pnpm.io/installation) (`npm install -g pnpm`).

1. Install dependencies (from the project folder):
   ```sh
   pnpm install
   ```
2. Create the settings file: copy `artifacts/guftagoo/.env.example` to
   `artifacts/guftagoo/.env` and fill in your Supabase project URL and
   publishable key (Supabase → Project Settings → API).
3. Start the site:
   ```sh
   pnpm --filter @workspace/guftagoo run dev
   ```
   and open the address it prints (usually http://localhost:5173).

## Other commands

- `pnpm test` — run the automated tests
- `pnpm run typecheck` — check the code for type errors
- `pnpm run build` — typecheck and build the production site into
  `artifacts/guftagoo/dist/public`

## Where things live

- `artifacts/guftagoo/src/App.tsx` — the landing page
- `artifacts/guftagoo/src/components/signup/` — the mentor and mentee signup
  forms
- `artifacts/guftagoo/src/signup/taxonomy.ts` — the field, career-stage and
  need options (must match the database's `check` constraints)
- `artifacts/guftagoo/src/signup/mentor.ts`, `mentee.ts` — form checks and
  saving to Supabase
- `artifacts/guftagoo/src/lib/supabase.ts` — Supabase connection
- `artifacts/guftagoo/src/index.css` — theme and animations
- `supabase/migrations/` — the SQL that sets up the database, run in order in
  Supabase → SQL Editor

## Viewing signups

Open your Supabase project → **Table Editor** → `mentors` or `mentees`. The
website can only add rows; it cannot read them. To verify a mentor, change
their `status` from `pending` to `verified` — only verified mentors can be
matched.
