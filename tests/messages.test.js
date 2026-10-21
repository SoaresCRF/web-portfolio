import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_LANGUAGE, MESSAGES, getMessages } from '../assets/js/messages.js';

test('every language defines the same messages with the same kind of value', () => {
  const reference = MESSAGES[DEFAULT_LANGUAGE];

  for (const [language, messages] of Object.entries(MESSAGES)) {
    assert.deepEqual(Object.keys(messages).sort(), Object.keys(reference).sort(), language);
    for (const key of Object.keys(reference)) {
      assert.equal(typeof messages[key], typeof reference[key], `${language}.${key}`);
    }
    assert.equal(messages.sortLabels.length, reference.sortLabels.length, `${language}.sortLabels`);
  }
});

test('getMessages falls back to Portuguese for an unknown language', () => {
  assert.equal(getMessages('fr'), MESSAGES[DEFAULT_LANGUAGE]);
  assert.equal(getMessages('en'), MESSAGES.en);
});
