// Funções puras da seção de projetos, separadas para poderem ser testadas sem DOM (ver tests/)
import { MESSAGES } from './messages.js';

const GITHUB_ORIGIN = 'https://github.com';

// Por linguagem: cor (base: GitHub linguist), escurecida quando necessário para atingir contraste WCAG AA
// (4,5:1) sobre o fundo do card (#f8f9fa) e sobre o fundo do selo da linguagem; e nome do ícone no Devicon
export const LANGUAGES = {
  Java: { color: '#8f5c14', icon: 'java' }, Python: { color: '#326b9b', icon: 'python' },
  JavaScript: { color: '#71692a', icon: 'javascript' }, TypeScript: { color: '#2b68ac', icon: 'typescript' },
  HTML: { color: '#b33c1e', icon: 'html5' }, CSS: { color: '#563d7c', icon: 'css3' },
  C: { color: '#555555', icon: 'c' }, 'C++': { color: '#b4385c', icon: 'cplusplus' },
  'C#': { color: '#147700', icon: 'csharp' }, PHP: { color: '#4f5d95', icon: 'php' },
  Swift: { color: '#8a5d25', icon: 'swift' }, Kotlin: { color: '#7656b2', icon: 'kotlin' },
  Go: { color: '#00708c', icon: 'go' }, Ruby: { color: '#701516', icon: 'ruby' },
  Shell: { color: '#467229', icon: 'bash' },
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
 * Valida os itens da API e mantém só os campos usados pela interface
 * @param {unknown[]} data
 * @returns {Array<{name: string, description: string, language: string, pushed_at: string, html_url: string | null, zip_url: string | null}>}
 */
export function normalizeRepositories(data) {
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
 * Data no formato do idioma da página, no fuso do visitante, independente do idioma do navegador
 * @param {string} isoDate
 * @param {string} language Valor de <html lang>
 * @returns {string}
 */
export function formatDate(isoDate, language) {
  const messages = MESSAGES[language];
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? messages.unknownDate : date.toLocaleDateString(messages.dateLocale);
}

/**
 * Texto do contador de projetos
 * @param {{page: number, perPage: number, visibleCount: number, filteredCount: number, totalCount: number}} counts
 * @param {string} language Valor de <html lang>
 * @returns {string}
 */
export function getCountLabel({ page, perPage, visibleCount, filteredCount, totalCount }, language) {
  const messages = MESSAGES[language];
  if (filteredCount === 0) {
    return messages.countEmpty(totalCount);
  }

  const start = (page - 1) * perPage + 1;
  return messages.countRange(start, start + visibleCount - 1, totalCount);
}
