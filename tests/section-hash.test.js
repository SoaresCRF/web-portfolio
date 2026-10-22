import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SECTION, SECTION_HASHES, getHashForSection, getSectionFromHash } from '../assets/js/section-hash.js';

const PT = 'pt-BR';

test('getSectionFromHash maps each Portuguese anchor to its section', () => {
  assert.equal(getSectionFromHash('#sobre', PT), 'about');
  assert.equal(getSectionFromHash('#formacao', PT), 'education');
  assert.equal(getSectionFromHash('#experiencia', PT), 'experience');
  assert.equal(getSectionFromHash('#projetos', PT), 'projects');
});

test('getSectionFromHash accepts anchors without # and in any case', () => {
  assert.equal(getSectionFromHash('projetos', PT), 'projects');
  assert.equal(getSectionFromHash('#Projetos', PT), 'projects');
});

test('getSectionFromHash falls back to the default section for empty or unknown anchors', () => {
  assert.equal(getSectionFromHash('', PT), DEFAULT_SECTION);
  assert.equal(getSectionFromHash('#', PT), DEFAULT_SECTION);
  assert.equal(getSectionFromHash('#inexistente', PT), DEFAULT_SECTION);
  assert.equal(getSectionFromHash('#about', PT), DEFAULT_SECTION);
  assert.equal(getSectionFromHash('#%E0', PT), DEFAULT_SECTION);
});

test('getHashForSection round-trips with getSectionFromHash', () => {
  for (const section of ['about', 'education', 'experience', 'projects']) {
    assert.equal(getSectionFromHash(getHashForSection(section, PT), PT), section);
  }
});

test('English pages use English anchors and keep sections in sync with Portuguese', () => {
  assert.equal(getSectionFromHash('#projects', 'en'), 'projects');
  assert.equal(getSectionFromHash('#projetos', 'en'), DEFAULT_SECTION);
  assert.equal(getHashForSection('education', 'en'), '#education');
  assert.deepEqual(Object.keys(SECTION_HASHES.en), Object.keys(SECTION_HASHES[PT]));
});
