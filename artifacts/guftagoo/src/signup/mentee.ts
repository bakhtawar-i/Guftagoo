import type { SignupClient, Validation } from './client';
import {
  CONSENT_ERROR,
  CONTEXT_MAX_LENGTH,
  LINKEDIN_ERROR,
  normalizeLinkedInUrl,
  type Field,
  type Need,
  type SeniorityBand,
} from './taxonomy';

export type MenteeFormValues = {
  name: string;
  email: string;
  linkedinUrl: string;
  field: Field | '';
  openToAdjacentField: boolean;
  adjacentField: Field | '';
  seniorityBand: SeniorityBand | '';
  need: Need | '';
  context: string;
  emailConsent: boolean;
};

export type MenteeSignup = {
  name: string;
  email: string;
  linkedinUrl: string;
  field: Field;
  adjacentField: Field | null;
  seniorityBand: SeniorityBand;
  need: Need;
  context: string | null;
};

export const MENTEE_MISSING_DETAILS_ERROR = 'Choose your field, your career stage, and what you’re looking for.';
export const ADJACENT_FIELD_ERROR = 'Choose the other field you’re open to, different from your main one.';
export const CONTEXT_TOO_LONG_ERROR = `Keep the note to ${CONTEXT_MAX_LENGTH} characters or fewer.`;

export function validateMenteeForm(values: MenteeFormValues): Validation<MenteeSignup> {
  const { field, seniorityBand, need } = values;
  if (!field || !seniorityBand || !need) {
    return { ok: false, error: MENTEE_MISSING_DETAILS_ERROR };
  }
  const adjacentField = values.openToAdjacentField ? values.adjacentField : '';
  if (values.openToAdjacentField && (!adjacentField || adjacentField === field)) {
    return { ok: false, error: ADJACENT_FIELD_ERROR };
  }
  const linkedinUrl = normalizeLinkedInUrl(values.linkedinUrl);
  if (!linkedinUrl) return { ok: false, error: LINKEDIN_ERROR };
  const context = values.context.trim();
  if (context.length > CONTEXT_MAX_LENGTH) return { ok: false, error: CONTEXT_TOO_LONG_ERROR };
  if (!values.emailConsent) return { ok: false, error: CONSENT_ERROR };

  return {
    ok: true,
    value: {
      name: values.name.trim(),
      email: values.email.trim(),
      linkedinUrl,
      field,
      adjacentField: adjacentField || null,
      seniorityBand,
      need,
      context: context || null,
    },
  };
}

/**
 * Saves the signup, then asks whether any mentor could match right now.
 * Returns false (show "you're in the queue") when none can — or when the
 * check itself fails, since the signup is already safely saved.
 */
export async function saveMenteeSignup(client: SignupClient, signup: MenteeSignup): Promise<{ matchAvailable: boolean }> {
  const { error } = await client.from('mentees').insert({
    name: signup.name,
    email: signup.email,
    linkedin_url: signup.linkedinUrl,
    field: signup.field,
    adjacent_field: signup.adjacentField,
    seniority_band: signup.seniorityBand,
    need: signup.need,
    context: signup.context,
    email_consent: true,
  });
  if (error) throw error;

  try {
    const result = await client.rpc('mentee_match_available', {
      p_field: signup.field,
      p_adjacent_field: signup.adjacentField,
      p_seniority_band: signup.seniorityBand,
      p_need: signup.need,
    });
    return { matchAvailable: !result.error && result.data === true };
  } catch {
    return { matchAvailable: false };
  }
}
