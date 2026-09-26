import type { FormEvent } from 'react';
import type { MentorSignupInput } from '@workspace/api-client-react';

export const MISSING_SIGNUP_DETAILS_ERROR =
  'Choose a field, an experience range, and at least one way to help.';
export const SAVE_SIGNUP_ERROR =
  'We couldn’t save your signup. Please try again.';

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