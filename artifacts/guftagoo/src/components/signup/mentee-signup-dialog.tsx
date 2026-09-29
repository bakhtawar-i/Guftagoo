import { type FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { saveMenteeSignup, validateMenteeForm, type MenteeFormValues, type MenteeSignup } from '@/signup/mentee';
import { CONTEXT_MAX_LENGTH, FIELDS, NEEDS, SAVE_SIGNUP_ERROR, SENIORITY_BANDS, type Field } from '@/signup/taxonomy';
import { ChoiceGroup, DialogHeading, FormError, SelectField, SignupDialog, SignupSuccess, SubmitButton, TextAreaField, TextField, TickBox } from './form-controls';

const FIELD_OPTIONS = FIELDS.map((field) => ({ value: field, label: field }));

export function MenteeSignupDialog({ onClose }: { onClose: () => void }) {
  const [values, setValues] = useState<MenteeFormValues>({
    name: '',
    email: '',
    linkedinUrl: '',
    field: '',
    openToAdjacentField: false,
    adjacentField: '',
    seniorityBand: '',
    need: '',
    context: '',
    emailConsent: false,
  });
  const [error, setError] = useState('');
  const signup = useMutation({ mutationFn: (data: MenteeSignup) => saveMenteeSignup(supabase, data) });
  const set = <K extends keyof MenteeFormValues>(key: K, value: MenteeFormValues[K]) => setValues((current) => ({ ...current, [key]: value }));

  function setField(field: Field) {
    // The adjacent field must differ from the main one.
    setValues((current) => ({ ...current, field, adjacentField: current.adjacentField === field ? '' : current.adjacentField }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateMenteeForm(values);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    signup.mutate(result.value, { onError: () => setError(SAVE_SIGNUP_ERROR) });
  }

  const name = values.name.trim() || 'friend';

  return (
    <SignupDialog titleId="mentee-signup-title" onClose={onClose}>
      {signup.isSuccess ? (
        signup.data.matchAvailable ? (
          <SignupSuccess title="You’re on the list." onClose={onClose}>
            Thank you, {name}. We’re finding the right mentor for you and will email you as soon as someone says yes.
          </SignupSuccess>
        ) : (
          <SignupSuccess title="You’re in the queue." onClose={onClose}>
            Thank you, {name}. We’ll email you as soon as we find a match.
          </SignupSuccess>
        )
      ) : (
        <>
          <DialogHeading eyebrow="Find a mentor" title="Tell us where you’re headed." titleId="mentee-signup-title">
            We’ll match you with someone a few steps ahead in your field, for a referral, advice, a mock interview or a CV review.
          </DialogHeading>
          <form onSubmit={submit} className="space-y-4">
            <TextField label="Your name" value={values.name} onChange={(value) => set('name', value)} placeholder="What should we call you?" autoComplete="name" testId="input-mentee-name" />
            <TextField label="Email address" type="email" value={values.email} onChange={(value) => set('email', value)} placeholder="you@example.com" autoComplete="email" testId="input-mentee-email" />
            <TextField label="LinkedIn profile" value={values.linkedinUrl} onChange={(value) => set('linkedinUrl', value)} placeholder="linkedin.com/in/your-name" autoComplete="url" hint="We use it to keep every match genuine. It’s never shown publicly." testId="input-mentee-linkedin" />
            <SelectField label="Your field" value={values.field} onChange={setField} options={FIELD_OPTIONS} placeholder="Choose your field" testId="select-mentee-field" />
            <TickBox checked={values.openToAdjacentField} onChange={(checked) => set('openToAdjacentField', checked)} testId="checkbox-mentee-adjacent">
              I’m also open to a mentor from one other field.
            </TickBox>
            {values.openToAdjacentField && (
              <SelectField
                label="The other field"
                value={values.adjacentField}
                onChange={(value) => set('adjacentField', value)}
                options={FIELD_OPTIONS.filter((option) => option.value !== values.field)}
                placeholder="Choose one more field"
                testId="select-mentee-adjacent-field"
              />
            )}
            <SelectField label="Where you are now" value={values.seniorityBand} onChange={(value) => set('seniorityBand', value)} options={SENIORITY_BANDS} placeholder="Choose your stage" testId="select-mentee-seniority" />
            <ChoiceGroup
              legend="What are you looking for?"
              name="need"
              options={NEEDS}
              selected={values.need ? [values.need] : []}
              onToggle={(option) => set('need', option)}
              multiple={false}
              testIdPrefix="radio-need"
            />
            <TextAreaField
              label="Anything your mentor should know? (optional)"
              value={values.context}
              onChange={(value) => set('context', value)}
              maxLength={CONTEXT_MAX_LENGTH}
              placeholder="e.g. I’m applying for product roles in Karachi and would love a CV check."
              testId="textarea-mentee-context"
            />
            <TickBox checked={values.emailConsent} onChange={(checked) => set('emailConsent', checked)} testId="checkbox-mentee-consent">
              I agree to have my email shared with a matched mentor.
            </TickBox>
            <FormError message={error} />
            <SubmitButton pending={signup.isPending} label="Find me a mentor" />
          </form>
        </>
      )}
    </SignupDialog>
  );
}
