import type { FormEvent } from 'react';

// These lists must match the `check` constraints on the Supabase
// `mentor_signups` table — the database rejects any other value.
export const MENTOR_FIELDS = [
  'Technology & engineering',
  'Product & design',
  'Finance & consulting',
  'Medicine & healthcare',
  'Law & policy',
  'Marketing & communications',
  'Education & research',
  'Other',
] as const;
export const MENTOR_EXPERIENCE_RANGES = ['0–2 years', '3–5 years', '6–10 years', '10+ years'] as const;
export const MENTOR_HELP_OPTIONS = ['Referrals', 'Career advice', 'Mock interviews'] as const;

export type MentorSignupInput = {
  name: string;
  email: string;
  field: (typeof MENTOR_FIELDS)[number];
  yearsExperience: (typeof MENTOR_EXPERIENCE_RANGES)[number];
  helpOptions: (typeof MENTOR_HELP_OPTIONS)[number][];
};

export const MISSING_SIGNUP_DETAILS_ERROR =
  'Choose a field, an experience range, and at least one way to help.';
export const SAVE_SIGNUP_ERROR =
  'We couldn’t save your signup. Please try again.';

// The slice of the Supabase client that saving a signup needs, so tests can
// pass a stand-in instead of talking to a real database.
type SignupTableClient = {
  from: (table: 'mentor_signups') => {
    insert: (row: Record<string, unknown>) => PromiseLike<{ error: unknown }>;
  };
};

export async function saveMentorSignup(client: SignupTableClient, input: MentorSignupInput): Promise<void> {
  // No `.select()` after the insert: visitors may add a row but are not
  // allowed to read any back.
  const { error } = await client.from('mentor_signups').insert({
    name: input.name.trim(),
    email: input.email.trim(),
    field: input.field,
    years_experience: input.yearsExperience,
    help_options: input.helpOptions,
  });
  if (error) throw error;
}

type SignupMutation = {
  mutate: (
    variables: { data: MentorSignupInput },
    callbacks: { onSuccess: () => void; onError: () => void },
  ) => void;
};

type SignupFormValues = {
  name: string;
  email: string;
  field: MentorSignupInput['field'] | '';
  yearsExperience: MentorSignupInput['yearsExperience'] | '';
  helpOptions: MentorSignupInput['helpOptions'];
};

type SubmitMentorSignupArgs = {
  event: FormEvent<HTMLFormElement>;
  values: SignupFormValues;
  mutation: SignupMutation;
  setError: (message: string) => void;
  setSubmitted: (submitted: boolean) => void;
};

export function submitMentorSignup({
  event,
  values,
  mutation,
  setError,
  setSubmitted,
}: SubmitMentorSignupArgs): void {
  event.preventDefault();
  setError('');

  const { field, yearsExperience } = values;
  if (!field || !yearsExperience || values.helpOptions.length === 0) {
    setError(MISSING_SIGNUP_DETAILS_ERROR);
    return;
  }

  mutation.mutate(
    {
      data: {
        ...values,
        field,
        yearsExperience,
      },
    },
    {
      onSuccess: () => setSubmitted(true),
      onError: () => setError(SAVE_SIGNUP_ERROR),
    },
  );
}
