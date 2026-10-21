import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_LANGUAGE_COLOR,
  LANGUAGE_COLORS,
  formatDate,
  getCountLabel,
  getSafeGitHubUrl,
  normalizeRepositories,
} from '../assets/js/repository-utils.js';

const CARD_BACKGROUND = '#f8f9fa';
const BADGE_ALPHA = 0x20 / 0xff;
const WCAG_AA_NORMAL_TEXT = 4.5;

const toRgb = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

function relativeLuminance(rgb) {
  const [r, g, b] = rgb.map(value => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(rgbA, rgbB) {
  const [light, dark] = [relativeLuminance(rgbA), relativeLuminance(rgbB)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

test('normalizeRepositories rejects a response that is not an array', () => {
  assert.throws(() => normalizeRepositories({ message: 'Not Found' }), TypeError);
  assert.throws(() => normalizeRepositories(null), TypeError);
});

test('normalizeRepositories drops entries without a name and fills missing fields', () => {
  const result = normalizeRepositories([
    null,
    { description: 'sem nome' },
    { name: 'web-portfolio', description: null, language: null, html_url: 'https://github.com/SoaresCRF/web-portfolio' },
  ]);

  assert.deepEqual(result, [{
    name: 'web-portfolio',
    description: '',
    language: '',
    pushed_at: '',
    html_url: 'https://github.com/SoaresCRF/web-portfolio',
    zip_url: null,
  }]);
});

test('getSafeGitHubUrl only accepts github.com over https', () => {
  assert.equal(getSafeGitHubUrl('https://github.com/SoaresCRF/x/archive/refs/heads/main.zip'),
    'https://github.com/SoaresCRF/x/archive/refs/heads/main.zip');
  assert.equal(getSafeGitHubUrl('javascript:alert(1)'), null);
  assert.equal(getSafeGitHubUrl('http://github.com/SoaresCRF'), null);
  assert.equal(getSafeGitHubUrl('https://github.com.evil.example/'), null);
  assert.equal(getSafeGitHubUrl('not a url'), null);
  assert.equal(getSafeGitHubUrl(undefined), null);
});

test('getCountLabel reports an empty result instead of an inverted range', () => {
  const label = getCountLabel({ page: 1, perPage: 10, visibleCount: 0, filteredCount: 0, totalCount: 18 });
  assert.equal(label, '📂 Nenhum projeto encontrado de 18 no total');
});

test('getCountLabel shows the range of the current page', () => {
  assert.equal(
    getCountLabel({ page: 2, perPage: 10, visibleCount: 8, filteredCount: 18, totalCount: 18 }),
    '📂 Exibindo 11–18 projetos de 18 no total',
  );
});

test('formatDate uses pt-BR and tolerates invalid dates', () => {
  assert.match(formatDate('2026-10-21T12:00:00Z'), /^\d{2}\/\d{2}\/2026$/);
  assert.equal(formatDate(''), 'data desconhecida');
});

test('language colors meet WCAG AA on the card and on their own badge', () => {
  const card = toRgb(CARD_BACKGROUND);

  for (const [language, hex] of Object.entries({ ...LANGUAGE_COLORS, default: DEFAULT_LANGUAGE_COLOR })) {
    const color = toRgb(hex);
    const badge = color.map((channel, i) => Math.round(channel * BADGE_ALPHA + card[i] * (1 - BADGE_ALPHA)));

    assert.ok(contrastRatio(color, card) >= WCAG_AA_NORMAL_TEXT, `${language} on card`);
    assert.ok(contrastRatio(color, badge) >= WCAG_AA_NORMAL_TEXT, `${language} on badge`);
  }
});

test('getCountLabel and formatDate follow the page language', () => {
  assert.equal(
    getCountLabel({ page: 1, perPage: 10, visibleCount: 10, filteredCount: 19, totalCount: 19 }, 'en'),
    '📂 Showing projects 1–10 of 19',
  );
  assert.equal(getCountLabel({ page: 1, perPage: 10, visibleCount: 0, filteredCount: 0, totalCount: 19 }, 'en'),
    '📂 No projects found out of 19');
  assert.equal(formatDate('2026-10-21T12:00:00Z', 'en'), '10/21/2026');
  assert.equal(formatDate('', 'en'), 'unknown date');
});
