import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { normalizeLinkedInUrl } from './taxonomy';

test('accepts the usual ways people paste a LinkedIn profile link', () => {
  assert.equal(normalizeLinkedInUrl('linkedin.com/in/sara-khan'), 'https://linkedin.com/in/sara-khan');
  assert.equal(normalizeLinkedInUrl('  https://www.linkedin.com/in/sara-khan/  '), 'https://www.linkedin.com/in/sara-khan');
  assert.equal(normalizeLinkedInUrl('http://pk.LinkedIn.com/in/sara-khan?utm_source=share#top'), 'https://pk.linkedin.com/in/sara-khan');
  assert.equal(normalizeLinkedInUrl('www.linkedin.com/pub/ali'), 'https://www.linkedin.com/pub/ali');
});

test('rejects links that are not a LinkedIn profile', () => {
  assert.equal(normalizeLinkedInUrl(''), null);
  assert.equal(normalizeLinkedInUrl('sara-khan'), null);
  assert.equal(normalizeLinkedInUrl('https://linkedin.com/company/guftagoo'), null);
  assert.equal(normalizeLinkedInUrl('https://linkedin.com.evil.example/in/sara'), null);
  assert.equal(normalizeLinkedInUrl('https://notlinkedin.com/in/sara'), null);
  assert.equal(normalizeLinkedInUrl('https://linkedin.com/in/'), null);
});
