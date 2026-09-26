import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  MISSING_SIGNUP_DETAILS_ERROR,
  SAVE_SIGNUP_ERROR,
  submitMentorSignup,
} from './mentor-signup-form';
import type { MentorSignupInput } from '@workspace/api-client-react';

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