// Shared by the mentor form, the mentee form and (later) the matching engine.
// These values must match the `check` constraints in
// supabase/migrations/20260929_phase2_signup_tables.sql — the database
// rejects anything else.

export const FIELDS = [
  'Software/Tech',
  'Finance',
  'Consulting',
  'Medicine/Healthcare',
  'Law',
  'Engineering (non-software)',
  'Marketing/Sales',
  'Academia/Research',
  'Design',
  'Other',
] as const;
export type Field = (typeof FIELDS)[number];

// Stored as the key; always shown with the year range so there's no ambiguity.
export const SENIORITY_BANDS = [
  { value: 'entry', label: 'Student/entry (0–2 years)' },
  { value: 'early', label: 'Early career (3–5 years)' },
  { value: 'mid', label: 'Mid career (6–10 years)' },
  { value: 'senior', label: 'Senior (10+ years)' },
] as const;
export type SeniorityBand = (typeof SENIORITY_BANDS)[number]['value'];

// What a mentee needs (pick one) and what a mentor offers (pick any).
export const NEEDS = ['Referral', 'Career advice', 'Mock interview', 'CV review'] as const;
export type Need = (typeof NEEDS)[number];

export const CONTEXT_MAX_LENGTH = 500;

export const isField = (value: string): value is Field => (FIELDS as readonly string[]).includes(value);
export const isSeniorityBand = (value: string): value is SeniorityBand =>
  SENIORITY_BANDS.some((band) => band.value === value);
export const isNeed = (value: string): value is Need => (NEEDS as readonly string[]).includes(value);

const LINKEDIN_PROFILE = /^(?:https?:\/\/)?((?:[a-z0-9-]+\.)?linkedin\.com)\/(in|pub)\/([^\s/?#]+)\/?(?:[?#].*)?$/i;

/**
 * Accepts the ways people paste a LinkedIn profile link ("linkedin.com/in/x",
 * "http://www.linkedin.com/in/x/?utm=..") and returns the clean
 * "https://…/in/x" form the database requires, or null if it isn't one.
 */
export function normalizeLinkedInUrl(raw: string): string | null {
  const match = raw.trim().match(LINKEDIN_PROFILE);
  if (!match) return null;
  const [, host, kind, handle] = match;
  return `https://${host.toLowerCase()}/${kind.toLowerCase()}/${handle}`;
}

export const LINKEDIN_ERROR = 'Enter your LinkedIn profile link, like linkedin.com/in/your-name.';
export const CONSENT_ERROR = 'Please tick the box to agree to your email being shared with your match.';
export const SAVE_SIGNUP_ERROR = 'We couldn’t save your signup. Please try again.';
