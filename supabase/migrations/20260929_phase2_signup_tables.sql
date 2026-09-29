-- Phase 2: mentor and mentee signups, plus the intro_requests table the
-- matching engine will use. Run once in Supabase → SQL Editor.
--
-- Access model: the website (anon role) may only INSERT signups, and only
-- the columns listed below — it can never read, edit or delete rows, and
-- can't set status fields. Matching and status changes run server-side with
-- the service role key. The option lists must match
-- artifacts/guftagoo/src/signup/taxonomy.ts.

-- Seniority bands in order, lowest first. A mentor's band must rank
-- strictly higher than the mentee's.
create function public.seniority_rank(band text) returns int
  language sql immutable
  set search_path = ''
  as $$ select array_position(array['entry', 'early', 'mid', 'senior'], band) $$;

-- ---------------------------------------------------------------------------
-- mentors
-- ---------------------------------------------------------------------------
create table public.mentors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) <= 320 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  linkedin_url text not null check (
    char_length(linkedin_url) <= 300
    and linkedin_url ~* '^https://([a-z0-9-]+\.)?linkedin\.com/(in|pub)/[^\s/?#]+/?$'),
  field text not null check (field in (
    'Software/Tech', 'Finance', 'Consulting', 'Medicine/Healthcare', 'Law',
    'Engineering (non-software)', 'Marketing/Sales', 'Academia/Research',
    'Design', 'Other')),
  seniority_band text not null check (seniority_band in ('entry', 'early', 'mid', 'senior')),
  offers text[] not null check (
    cardinality(offers) between 1 and 4
    and offers <@ array['Referral', 'Career advice', 'Mock interview', 'CV review']),
  email_consent boolean not null check (email_consent),
  -- Set by hand in the Table Editor: pending → verified / rejected / needs_more_info
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected', 'needs_more_info'))
);

-- ---------------------------------------------------------------------------
-- mentees
-- ---------------------------------------------------------------------------
create table public.mentees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) <= 320 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  linkedin_url text not null check (
    char_length(linkedin_url) <= 300
    and linkedin_url ~* '^https://([a-z0-9-]+\.)?linkedin\.com/(in|pub)/[^\s/?#]+/?$'),
  field text not null check (field in (
    'Software/Tech', 'Finance', 'Consulting', 'Medicine/Healthcare', 'Law',
    'Engineering (non-software)', 'Marketing/Sales', 'Academia/Research',
    'Design', 'Other')),
  adjacent_field text check (
    adjacent_field in (
      'Software/Tech', 'Finance', 'Consulting', 'Medicine/Healthcare', 'Law',
      'Engineering (non-software)', 'Marketing/Sales', 'Academia/Research',
      'Design', 'Other')
    and adjacent_field <> field),
  seniority_band text not null check (seniority_band in ('entry', 'early', 'mid', 'senior')),
  need text not null check (need in ('Referral', 'Career advice', 'Mock interview', 'CV review')),
  context text check (char_length(context) <= 500),
  email_consent boolean not null check (email_consent),
  status text not null default 'queued'
    check (status in ('queued', 'matched', 'declined_all'))
);

-- ---------------------------------------------------------------------------
-- intro_requests (written only by the matching engine, never by the website)
-- ---------------------------------------------------------------------------
create table public.intro_requests (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentors (id) on delete cascade,
  mentee_id uuid not null references public.mentees (id) on delete cascade,
  status text not null default 'sent'
    check (status in ('sent', 'accepted', 'declined', 'expired', 'already_matched', 'cancelled')),
  token_hash text not null unique,
  sent_at timestamptz not null default now(),
  expires_at timestamptz not null,
  reminder_sent_at timestamptz,
  responded_at timestamptz,
  -- A mentor/mentee pair is only ever proposed once (no rematching).
  unique (mentor_id, mentee_id)
);

create index intro_requests_open_by_mentor on public.intro_requests (mentor_id) where status = 'sent';
create index mentors_verified_by_field on public.mentors (field) where status = 'verified';

-- ---------------------------------------------------------------------------
-- Access control
-- ---------------------------------------------------------------------------
alter table public.mentors enable row level security;
alter table public.mentees enable row level security;
alter table public.intro_requests enable row level security;

-- Start from nothing, then grant back exactly what the website needs.
revoke all on public.mentors, public.mentees, public.intro_requests from anon, authenticated;

grant insert (name, email, linkedin_url, field, seniority_band, offers, email_consent)
  on public.mentors to anon;
grant insert (name, email, linkedin_url, field, adjacent_field, seniority_band, need, context, email_consent)
  on public.mentees to anon;

create policy "Anyone can sign up as a mentor"
  on public.mentors for insert to anon
  with check (status = 'pending');
create policy "Anyone can sign up as a mentee"
  on public.mentees for insert to anon
  with check (status = 'queued');

-- ---------------------------------------------------------------------------
-- Cold-start check for the mentee form: is there at least one verified mentor
-- with spare capacity who could match? Returns only true/false — never any
-- mentor details — so it's safe to expose to the website.
-- ---------------------------------------------------------------------------
create function public.mentee_match_available(
  p_field text,
  p_adjacent_field text,
  p_seniority_band text,
  p_need text
) returns boolean
  language sql stable
  security definer
  set search_path = ''
  as $$
    select exists (
      select 1
      from public.mentors m
      where m.status = 'verified'
        and m.field in (p_field, p_adjacent_field)
        and public.seniority_rank(m.seniority_band) > public.seniority_rank(p_seniority_band)
        and p_need = any (m.offers)
        and (
          select count(*) from public.intro_requests r
          where r.mentor_id = m.id and r.status = 'sent'
        ) < 2
    )
  $$;

revoke all on function public.mentee_match_available(text, text, text, text) from public, anon, authenticated;
grant execute on function public.mentee_match_available(text, text, text, text) to anon;
revoke all on function public.seniority_rank(text) from public, anon, authenticated;
