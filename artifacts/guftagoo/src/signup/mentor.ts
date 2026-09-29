import type { SignupClient, Validation } from './client';
import {
  CONSENT_ERROR,
  LINKEDIN_ERROR,
  normalizeLinkedInUrl,
  type Field,
  type Need,
  type SeniorityBand,
} from './taxonomy';

export type MentorFormValues = {
  name: string;
  email: string;
  linkedinUrl: string;
  field: Field | '';
  seniorityBand: SeniorityBand | '';
  offers: Need[];
  emailConsent: boolean;
};

export type MentorSignup = {
  name: string;
  email: string;
  linkedinUrl: string;
  field: Field;
  seniorityBand: SeniorityBand;
  offers: Need[];
};

export const MENTOR_MISSING_DETAILS_ERROR =
  'Choose your field, your career stage, and at least one way to help.';

export function validateMentorForm(values: MentorFormValues): Validation<MentorSignup> {
  const { field, seniorityBand } = values;
  if (!field || !seniorityBand || values.offers.length === 0) {
    return { ok: false, error: MENTOR_MISSING_DETAILS_ERROR };
  }
  const linkedinUrl = normalizeLinkedInUrl(values.linkedinUrl);
  if (!linkedinUrl) return { ok: false, error: LINKEDIN_ERROR };
  if (!values.emailConsent) return { ok: false, error: CONSENT_ERROR };

  return {
    ok: true,
    value: {
      name: values.name.trim(),
      email: values.email.trim(),
      linkedinUrl,
      field,
      seniorityBand,
      offers: values.offers,
    },
  };
}

export async function saveMentorSignup(client: SignupClient, signup: MentorSignup): Promise<void> {
  // No `.select()` after the insert: visitors may add a row but can't read any back.
  const { error } = await client.from('mentors').insert({
    name: signup.name,
    email: signup.email,
    linkedin_url: signup.linkedinUrl,
    field: signup.field,
    seniority_band: signup.seniorityBand,
    offers: signup.offers,
    email_consent: true,
  });
  if (error) throw error;
}
