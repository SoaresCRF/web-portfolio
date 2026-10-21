import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SECTION, SECTION_HASHES, getHashForSection, getSectionFromHash } from '../assets/js/section-hash.js';

test('getSectionFromHash maps each Portuguese anchor to its section', () => {
  assert.equal(getSectionFromHash('#sobre'), 'about');
  assert.equal(getSectionFromHash('#formacao'), 'education');
  assert.equal(getSectionFromHash('#experiencia'), 'experience');
  assert.equal(getSectionFromHash('#projetos'), 'projects');
});

test('getSectionFromHash accepts anchors without # and in any case', () => {
  assert.equal(getSectionFromHash('projetos'), 'projects');
  assert.equal(getSectionFromHash('#Projetos'), 'projects');
});

test('getSectionFromHash falls back to the default section for empty or unknown anchors', () => {
  assert.equal(getSectionFromHash(''), DEFAULT_SECTION);
  assert.equal(getSectionFromHash('#'), DEFAULT_SECTION);
  assert.equal(getSectionFromHash('#inexistente'), DEFAULT_SECTION);
  assert.equal(getSectionFromHash('#about'), DEFAULT_SECTION);
  assert.equal(getSectionFromHash('#%E0'), DEFAULT_SECTION);
});

test('getHashForSection round-trips with getSectionFromHash', () => {
  for (const section of ['about', 'education', 'experience', 'projects']) {
    assert.equal(getSectionFromHash(getHashForSection(section)), section);
  }
  assert.equal(getHashForSection('unknown'), '#sobre');
});

test('English pages use English anchors and keep sections in sync with Portuguese', () => {
  assert.equal(getSectionFromHash('#projects', 'en'), 'projects');
  assert.equal(getSectionFromHash('#projetos', 'en'), DEFAULT_SECTION);
  assert.equal(getHashForSection('education', 'en'), '#education');
  assert.deepEqual(Object.keys(SECTION_HASHES.en), Object.keys(SECTION_HASHES['pt-BR']));
});

test('an unknown page language falls back to the Portuguese anchors', () => {
  assert.equal(getSectionFromHash('#projetos', 'fr'), 'projects');
  assert.equal(getHashForSection('projects', 'fr'), '#projetos');
});
