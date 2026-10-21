// Funções puras da seção de projetos, separadas para poderem ser testadas sem DOM (ver tests/)

const GITHUB_ORIGIN = 'https://github.com';

// Cores das linguagens (base: GitHub linguist), escurecidas quando necessário para atingir
// contraste WCAG AA (4,5:1) sobre o fundo do card (#f8f9fa) e sobre o fundo do selo da linguagem
export const LANGUAGE_COLORS = {
  Java: '#8f5c14', Python: '#326b9b', JavaScript: '#71692a', TypeScript: '#2b68ac',
  HTML: '#b33c1e', CSS: '#563d7c', C: '#555555', 'C++': '#b4385c',
  'C#': '#147700', PHP: '#4f5d95', Swift: '#8a5d25', Kotlin: '#7656b2',
  Go: '#00708c', Ruby: '#701516', Shell: '#467229',
};
export const DEFAULT_LANGUAGE_COLOR = '#616970';

/**
 * Aceita apenas URLs do GitHub; qualquer outro valor (inclusive javascript:) vira null
 * @param {unknown} value
 * @returns {string | null}
 */
export function getSafeGitHubUrl(value) {
  if (typeof value !== 'string') return null;

  try {
    const url = new URL(value);
    return url.origin === GITHUB_ORIGIN ? url.href : null;
  } catch {
    // URL malformada vinda da API: tratada como ausente (o link não é exibido)
    return null;
  }
}

/**
 * Valida a resposta da API e mantém só os campos usados pela interface
 * @param {unknown} data
 * @returns {Array<{name: string, description: string, language: string, pushed_at: string, html_url: string | null, zip_url: string | null}>}
 */
export function normalizeRepositories(data) {
  if (!Array.isArray(data)) {
    throw new TypeError('Resposta inesperada da API de repositórios: era esperado um array');
  }

  return data
    .filter(repository => typeof repository?.name === 'string' && repository.name !== '')
    .map(repository => ({
      name: repository.name,
      description: typeof repository.description === 'string' ? repository.description : '',
      language: typeof repository.language === 'string' ? repository.language : '',
      pushed_at: typeof repository.pushed_at === 'string' ? repository.pushed_at : '',
      html_url: getSafeGitHubUrl(repository.html_url),
      zip_url: getSafeGitHubUrl(repository.zip_url),
    }));
}

/**
 * Data no formato do site (pt-BR), no fuso do visitante, independente do idioma do navegador
 * @param {string} isoDate
 * @returns {string}
 */
export function formatDate(isoDate) {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? 'data desconhecida' : date.toLocaleDateString('pt-BR');
}

/**
 * Texto do contador de projetos
 * @param {{page: number, perPage: number, visibleCount: number, filteredCount: number, totalCount: number}} counts
 * @returns {string}
 */
export function getCountLabel({ page, perPage, visibleCount, filteredCount, totalCount }) {
  if (filteredCount === 0) {
    return `📂 Nenhum projeto encontrado de ${totalCount} no total`;
  }

  const start = (page - 1) * perPage + 1;
  const end = Math.min(start + visibleCount - 1, filteredCount);
  return `📂 Exibindo ${start}–${end} projetos de ${totalCount} no total`;
}
