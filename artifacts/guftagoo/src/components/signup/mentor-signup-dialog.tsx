import { type FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { saveMentorSignup, validateMentorForm, type MentorFormValues, type MentorSignup } from '@/signup/mentor';
import { FIELDS, NEEDS, SAVE_SIGNUP_ERROR, SENIORITY_BANDS } from '@/signup/taxonomy';
import { ChoiceGroup, DialogHeading, FormError, SelectField, SignupDialog, SignupSuccess, SubmitButton, TextField, TickBox } from './form-controls';

const FIELD_OPTIONS = FIELDS.map((field) => ({ value: field, label: field }));

export function MentorSignupDialog({ onClose }: { onClose: () => void }) {
  const [values, setValues] = useState<MentorFormValues>({
    name: '',
    email: '',
    linkedinUrl: '',
    field: '',
    seniorityBand: '',
    offers: [],
    emailConsent: false,
  });
  const [error, setError] = useState('');
  const signup = useMutation({ mutationFn: (data: MentorSignup) => saveMentorSignup(supabase, data) });
  const set = <K extends keyof MentorFormValues>(key: K, value: MentorFormValues[K]) => setValues((current) => ({ ...current, [key]: value }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateMentorForm(values);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    signup.mutate(result.value, { onError: () => setError(SAVE_SIGNUP_ERROR) });
  }

  return (
    <SignupDialog titleId="mentor-signup-title" onClose={onClose}>
      {signup.isSuccess ? (
        <SignupSuccess title="You’re on the list." onClose={onClose}>
          Thank you, {values.name.trim() || 'friend'}. The best conversations start with showing up.
        </SignupSuccess>
      ) : (
        <>
          <DialogHeading eyebrow="A small first step" title="Bring what you know." titleId="mentor-signup-title">
            Tell us a little about yourself. We’ll be in touch when we’re ready to make a thoughtful match.
          </DialogHeading>
          <form onSubmit={submit} className="space-y-4">
            <TextField label="Your name" value={values.name} onChange={(value) => set('name', value)} placeholder="What should we call you?" autoComplete="name" testId="input-mentor-name" />
            <TextField label="Email address" type="email" value={values.email} onChange={(value) => set('email', value)} placeholder="you@example.com" autoComplete="email" testId="input-mentor-email" />
            <TextField label="LinkedIn profile" value={values.linkedinUrl} onChange={(value) => set('linkedinUrl', value)} placeholder="linkedin.com/in/your-name" autoComplete="url" hint="We use it to verify every mentor. It’s never shown publicly." testId="input-mentor-linkedin" />
            <SelectField label="Your field" value={values.field} onChange={(value) => set('field', value)} options={FIELD_OPTIONS} placeholder="Choose your field" testId="select-mentor-field" />
            <SelectField label="Your career stage" value={values.seniorityBand} onChange={(value) => set('seniorityBand', value)} options={SENIORITY_BANDS} placeholder="Choose your stage" testId="select-mentor-seniority" />
            <ChoiceGroup
              legend="How would you like to help?"
              name="offers"
              options={NEEDS}
              selected={values.offers}
              onToggle={(option, checked) => set('offers', checked ? [...values.offers, option] : values.offers.filter((item) => item !== option))}
              multiple
              testIdPrefix="checkbox-offer"
            />
            <TickBox checked={values.emailConsent} onChange={(checked) => set('emailConsent', checked)} testId="checkbox-mentor-consent">
              I agree to have my email shared with a matched mentee.
            </TickBox>
            <FormError message={error} />
            <SubmitButton pending={signup.isPending} label="Join the mentor list" />
          </form>
          <p className="mt-5 text-center text-xs leading-5 text-[#777487]">No sales pitch. Just a real conversation when the time is right.</p>
        </>
      )}
    </SignupDialog>
  );
}
