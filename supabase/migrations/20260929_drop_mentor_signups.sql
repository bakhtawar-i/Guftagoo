-- Retire the Phase 1 table. Run only after the Phase 2 forms are live
-- (they save to public.mentors instead). It holds test rows only.
drop table if exists public.mentor_signups;
