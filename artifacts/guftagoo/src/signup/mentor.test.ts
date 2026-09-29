import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { MENTOR_MISSING_DETAILS_ERROR, saveMentorSignup, validateMentorForm, type MentorFormValues } from './mentor';
import { CONSENT_ERROR, LINKEDIN_ERROR } from './taxonomy';
import { createFakeClient } from './test-helpers';

const validValues: MentorFormValues = {
  name: ' Sara Khan ',
  email: ' sara@example.com ',
  linkedinUrl: 'linkedin.com/in/sara-khan',
  field: 'Software/Tech',
  seniorityBand: 'senior',
  offers: ['Referral', 'CV review'],
  emailConsent: true,
};

test('a complete mentor form is cleaned up and accepted', () => {
  assert.deepEqual(validateMentorForm(validValues), {
    ok: true,
    value: {
      name: 'Sara Khan',
      email: 'sara@example.com',
      linkedinUrl: 'https://linkedin.com/in/sara-khan',
      field: 'Software/Tech',
      seniorityBand: 'senior',
      offers: ['Referral', 'CV review'],
    },
  });
});

test('mentor form explains what is missing or wrong', () => {
  assert.deepEqual(validateMentorForm({ ...validValues, field: '' }), { ok: false, error: MENTOR_MISSING_DETAILS_ERROR });
  assert.deepEqual(validateMentorForm({ ...validValues, seniorityBand: '' }), { ok: false, error: MENTOR_MISSING_DETAILS_ERROR });
  assert.deepEqual(validateMentorForm({ ...validValues, offers: [] }), { ok: false, error: MENTOR_MISSING_DETAILS_ERROR });
  assert.deepEqual(validateMentorForm({ ...validValues, linkedinUrl: 'twitter.com/sara' }), { ok: false, error: LINKEDIN_ERROR });
  assert.deepEqual(validateMentorForm({ ...validValues, emailConsent: false }), { ok: false, error: CONSENT_ERROR });
});

test('saves the mentor to the mentors table using its column names', async () => {
  const fake = createFakeClient();
  const result = validateMentorForm(validValues);
  assert.ok(result.ok);

  await saveMentorSignup(fake.client, result.value);

  assert.deepEqual(fake.inserts, [
    {
      table: 'mentors',
      row: {
        name: 'Sara Khan',
        email: 'sara@example.com',
        linkedin_url: 'https://linkedin.com/in/sara-khan',
        field: 'Software/Tech',
        seniority_band: 'senior',
        offers: ['Referral', 'CV review'],
        email_consent: true,
      },
    },
  ]);
});

test('fails when the database rejects the mentor signup', async () => {
  const fake = createFakeClient({ insertError: { message: 'violates check constraint' } });
  const result = validateMentorForm(validValues);
  assert.ok(result.ok);

  await assert.rejects(saveMentorSignup(fake.client, result.value));
});
