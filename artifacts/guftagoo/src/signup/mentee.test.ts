import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  ADJACENT_FIELD_ERROR,
  CONTEXT_TOO_LONG_ERROR,
  MENTEE_MISSING_DETAILS_ERROR,
  saveMenteeSignup,
  validateMenteeForm,
  type MenteeFormValues,
} from './mentee';
import { CONSENT_ERROR, LINKEDIN_ERROR } from './taxonomy';
import { createFakeClient } from './test-helpers';

const validValues: MenteeFormValues = {
  name: ' Ali Raza ',
  email: 'ali@example.com',
  linkedinUrl: 'https://www.linkedin.com/in/ali-raza/',
  field: 'Finance',
  openToAdjacentField: false,
  adjacentField: '',
  seniorityBand: 'entry',
  need: 'Mock interview',
  context: '  ',
  emailConsent: true,
};

function validSignup(values: Partial<MenteeFormValues> = {}) {
  const result = validateMenteeForm({ ...validValues, ...values });
  assert.ok(result.ok);
  return result.value;
}

test('a complete mentee form is cleaned up and accepted', () => {
  assert.deepEqual(validSignup(), {
    name: 'Ali Raza',
    email: 'ali@example.com',
    linkedinUrl: 'https://www.linkedin.com/in/ali-raza',
    field: 'Finance',
    adjacentField: null,
    seniorityBand: 'entry',
    need: 'Mock interview',
    context: null,
  });
});

test('the adjacent field only counts when the box is ticked', () => {
  assert.equal(validSignup({ openToAdjacentField: false, adjacentField: 'Consulting' }).adjacentField, null);
  assert.equal(validSignup({ openToAdjacentField: true, adjacentField: 'Consulting' }).adjacentField, 'Consulting');
});

test('mentee form explains what is missing or wrong', () => {
  const invalid = (values: Partial<MenteeFormValues>) => validateMenteeForm({ ...validValues, ...values });
  assert.deepEqual(invalid({ need: '' }), { ok: false, error: MENTEE_MISSING_DETAILS_ERROR });
  assert.deepEqual(invalid({ seniorityBand: '' }), { ok: false, error: MENTEE_MISSING_DETAILS_ERROR });
  assert.deepEqual(invalid({ openToAdjacentField: true, adjacentField: '' }), { ok: false, error: ADJACENT_FIELD_ERROR });
  assert.deepEqual(invalid({ openToAdjacentField: true, adjacentField: 'Finance' }), { ok: false, error: ADJACENT_FIELD_ERROR });
  assert.deepEqual(invalid({ linkedinUrl: 'ali' }), { ok: false, error: LINKEDIN_ERROR });
  assert.deepEqual(invalid({ context: 'x'.repeat(501) }), { ok: false, error: CONTEXT_TOO_LONG_ERROR });
  assert.deepEqual(invalid({ emailConsent: false }), { ok: false, error: CONSENT_ERROR });
});

test('saves the mentee, then checks for an available mentor', async () => {
  const fake = createFakeClient({ rpcResult: { data: true, error: null } });

  const result = await saveMenteeSignup(fake.client, validSignup({ openToAdjacentField: true, adjacentField: 'Consulting', context: 'CV help please' }));

  assert.deepEqual(result, { matchAvailable: true });
  assert.deepEqual(fake.inserts, [
    {
      table: 'mentees',
      row: {
        name: 'Ali Raza',
        email: 'ali@example.com',
        linkedin_url: 'https://www.linkedin.com/in/ali-raza',
        field: 'Finance',
        adjacent_field: 'Consulting',
        seniority_band: 'entry',
        need: 'Mock interview',
        context: 'CV help please',
        email_consent: true,
      },
    },
  ]);
  assert.deepEqual(fake.rpcCalls, [
    {
      fn: 'mentee_match_available',
      args: { p_field: 'Finance', p_adjacent_field: 'Consulting', p_seniority_band: 'entry', p_need: 'Mock interview' },
    },
  ]);
});

test('shows the queue message when no mentor is available, or the check fails', async () => {
  assert.deepEqual(await saveMenteeSignup(createFakeClient({ rpcResult: { data: false, error: null } }).client, validSignup()), { matchAvailable: false });
  assert.deepEqual(await saveMenteeSignup(createFakeClient({ rpcResult: { data: null, error: { message: 'boom' } } }).client, validSignup()), { matchAvailable: false });
  assert.deepEqual(await saveMenteeSignup(createFakeClient({ rpcThrows: true }).client, validSignup()), { matchAvailable: false });
});

test('does not check for mentors when saving the mentee fails', async () => {
  const fake = createFakeClient({ insertError: { message: 'violates check constraint' } });

  await assert.rejects(saveMenteeSignup(fake.client, validSignup()));
  assert.equal(fake.rpcCalls.length, 0);
});
