import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toSiteRepositories } from '../scripts/fetch-repositories.js';

test('toSiteRepositories rejects a response that is not an array', () => {
  assert.throws(() => toSiteRepositories({ message: 'API rate limit exceeded' }), TypeError);
});

test('toSiteRepositories keeps only the fields the site uses and builds the zip link from the default branch', () => {
  const [repository] = toSiteRepositories([{
    name: 'web-portfolio',
    description: 'Portfólio',
    language: 'JavaScript',
    pushed_at: '2026-10-21T20:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    html_url: 'https://github.com/SoaresCRF/web-portfolio',
    default_branch: 'master',
    private: false,
  }]);

  assert.deepEqual(repository, {
    name: 'web-portfolio',
    description: 'Portfólio',
    language: 'JavaScript',
    pushed_at: '2026-10-21T20:00:00Z',
    html_url: 'https://github.com/SoaresCRF/web-portfolio',
    zip_url: 'https://github.com/SoaresCRF/web-portfolio/archive/refs/heads/master.zip',
  });
});

test('toSiteRepositories falls back to main when the default branch is missing', () => {
  const [repository] = toSiteRepositories([{ name: 'repo' }]);
  assert.equal(repository.zip_url, 'https://github.com/SoaresCRF/repo/archive/refs/heads/main.zip');
});

test('toSiteRepositories drops entries without a name', () => {
  assert.deepEqual(toSiteRepositories([null, { description: 'sem nome' }]), []);
});
