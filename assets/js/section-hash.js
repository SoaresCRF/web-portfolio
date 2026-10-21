// Âncoras da URL (no idioma da página, como aparecem para o visitante) ↔ nome do arquivo da seção
import { DEFAULT_LANGUAGE } from './messages.js';

export const DEFAULT_SECTION = 'about';

export const SECTION_HASHES = {
  'pt-BR': {
    about: 'sobre',
    education: 'formacao',
    experience: 'experiencia',
    projects: 'projetos',
  },
  en: {
    about: 'about',
    education: 'education',
    experience: 'experience',
    projects: 'projects',
  },
};

const getHashes = language => SECTION_HASHES[language] ?? SECTION_HASHES[DEFAULT_LANGUAGE];

/**
 * Converte a âncora da URL na seção correspondente; âncora vazia ou desconhecida vira a seção padrão
 * @param {string} hash Valor de location.hash (com ou sem '#')
 * @param {string} [language] Valor de <html lang>
 * @returns {string}
 */
export function getSectionFromHash(hash, language = DEFAULT_LANGUAGE) {
  // Slugs são ASCII: não é preciso decodificar (e %-sequências inválidas simplesmente não casam)
  const slug = hash.replace(/^#/, '').toLowerCase();
  const hashes = getHashes(language);
  const section = Object.keys(hashes).find(key => hashes[key] === slug);
  return section ?? DEFAULT_SECTION;
}

/**
 * @param {string} section Nome da seção
 * @param {string} [language] Valor de <html lang>
 * @returns {string} Âncora com '#'
 */
export function getHashForSection(section, language = DEFAULT_LANGUAGE) {
  const hashes = getHashes(language);
  return `#${hashes[section] ?? hashes[DEFAULT_SECTION]}`;
}
