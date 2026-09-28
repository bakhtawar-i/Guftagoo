import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  MISSING_SIGNUP_DETAILS_ERROR,
  SAVE_SIGNUP_ERROR,
  saveMentorSignup,
  submitMentorSignup,
  type MentorSignupInput,
} from './mentor-signup-form';

const validValues: MentorSignupInput = {
  name: 'Test Mentor',
  email: 'test-mentor@example.com',
  field: 'Technology & engineering',
  yearsExperience: '6–10 years',
  helpOptions: ['Referrals'],
};

function createEvent() {
  let prevented = false;
  return {
    event: {
      preventDefault: () => {
        prevented = true;
      },
    } as never,
    wasPrevented: () => prevented,
  };
}

test('shows success only when the signup request succeeds', () => {
  const event = createEvent();
  let submitted = false;
  let error = 'old error';
  let callbacks: { onSuccess: () => void; onError: () => void } | undefined;

  submitMentorSignup({
    event: event.event,
    values: validValues,
    mutation: {
      mutate: (_variables, nextCallbacks) => {
        callbacks = nextCallbacks;
      },
    },
    setError: (message) => {
      error = message;
    },
    setSubmitted: (value) => {
      submitted = value;
    },
  });

  assert.equal(event.wasPrevented(), true);
  assert.equal(submitted, false);
  assert.equal(error, '');
  assert.ok(callbacks);

  callbacks.onError();
  assert.equal(submitted, false);
  assert.equal(error, SAVE_SIGNUP_ERROR);

  callbacks.onSuccess();
  assert.equal(submitted, true);
});

test('shows a validation error without sending incomplete signup details', () => {
  const event = createEvent();
  let submitted = false;
  let error = '';
  let mutationCalled = false;

  submitMentorSignup({
    event: event.event,
    values: { ...validValues, field: '' },
    mutation: {
      mutate: () => {
        mutationCalled = true;
      },
    },
    setError: (message) => {
      error = message;
    },
    setSubmitted: (value) => {
      submitted = value;
    },
  });

  assert.equal(event.wasPrevented(), true);
  assert.equal(mutationCalled, false);
  assert.equal(submitted, false);
  assert.equal(error, MISSING_SIGNUP_DETAILS_ERROR);
});
function createFakeClient(result: { error: unknown }) {
  const calls: { table: string; row: Record<string, unknown> }[] = [];
  return {
    calls,
    client: {
      from: (table: 'mentor_signups') => ({
        insert: async (row: Record<string, unknown>) => {
          calls.push({ table, row });
          return result;
        },
      }),
    },
  };
}

test('saves the signup to the mentor_signups table using its column names', async () => {
  const fake = createFakeClient({ error: null });

  await saveMentorSignup(fake.client, { ...validValues, name: '  Test Mentor ', email: ' test-mentor@example.com ' });

  assert.deepEqual(fake.calls, [
    {
      table: 'mentor_signups',
      row: {
        name: 'Test Mentor',
        email: 'test-mentor@example.com',
        field: 'Technology & engineering',
        years_experience: '6–10 years',
        help_options: ['Referrals'],
      },
    },
  ]);
});

test('fails when the database rejects the signup', async () => {
  const fake = createFakeClient({ error: { message: 'new row violates check constraint' } });

  await assert.rejects(saveMentorSignup(fake.client, validValues));
});
