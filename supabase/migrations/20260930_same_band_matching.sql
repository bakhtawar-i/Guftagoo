-- Allow same-stage matches (e.g. Senior mentor ↔ Senior mentee), except at
-- Student/entry: a student is always matched with someone more experienced.
-- Run once in Supabase → SQL Editor.

-- The one place the seniority rule lives; the matching engine reuses it.
create function public.seniority_compatible(mentor_band text, mentee_band text) returns boolean
  language sql immutable
  set search_path = ''
  as $$
    select public.seniority_rank(mentor_band) > public.seniority_rank(mentee_band)
        or (mentor_band = mentee_band and mentee_band <> 'entry')
  $$;

revoke all on function public.seniority_compatible(text, text) from public, anon, authenticated;

-- Same as before, but with the new seniority rule. Replacing the function
-- keeps its existing permissions (the website may still call it).
create or replace function public.mentee_match_available(
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
        and public.seniority_compatible(m.seniority_band, p_seniority_band)
        and p_need = any (m.offers)
        and (
          select count(*) from public.intro_requests r
          where r.mentor_id = m.id and r.status = 'sent'
        ) < 2
    )
  $$;
