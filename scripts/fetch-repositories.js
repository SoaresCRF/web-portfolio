// Gera public/repositories.json antes do build (ver deploy.yml): a lista sai do mesmo servidor do site,
// sem esperar uma API intermediária acordar
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { normalizeRepositories } from '../assets/js/repository-utils.js';

const GITHUB_USER = 'SoaresCRF';
// ponytail: só a primeira página (máx. 100 repositórios); paginar via header Link se a conta passar disso
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`;
const OUTPUT_FILE = new URL('../public/repositories.json', import.meta.url);

/**
 * Converte a resposta da API do GitHub no formato usado pelo site (mesmos campos de normalizeRepositories)
 * @param {unknown} data
 */
export function toSiteRepositories(data) {
  // Resposta que não é array (ex.: erro de rate limit) lança TypeError no .map
  return normalizeRepositories(data.map(repository => ({
    ...repository,
    zip_url: `https://github.com/${GITHUB_USER}/${repository?.name}/archive/refs/heads/${repository?.default_branch || 'main'}.zip`,
  })));
}

async function main() {
  const headers = { Accept: 'application/vnd.github+json' };
  // No Actions, o token evita o limite de 60 req/h sem autenticação (compartilhado entre runners do mesmo IP);
  // o endpoint /users/{user}/repos só retorna repositórios públicos, com ou sem token
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const response = await fetch(GITHUB_REPOS_URL, { headers });
  if (!response.ok) throw new Error(`Erro na API do GitHub: HTTP ${response.status}`);

  const repositories = toSiteRepositories(await response.json());
  await writeFile(OUTPUT_FILE, JSON.stringify(repositories));
  console.info(`${repositories.length} repositórios salvos em public/repositories.json`);
}

// Executa só quando chamado direto (npm run fetch-repos), não quando importado pelos testes
if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
