// Âncoras da URL (em português, como aparecem para o visitante) ↔ nome do arquivo da seção

export const DEFAULT_SECTION = 'about';

export const SECTION_HASHES = {
  about: 'sobre',
  education: 'formacao',
  experience: 'experiencia',
  projects: 'projetos',
};

/**
 * Converte a âncora da URL na seção correspondente; âncora vazia ou desconhecida vira a seção padrão
 * @param {string} hash Valor de location.hash (com ou sem '#')
 * @returns {string}
 */
export function getSectionFromHash(hash) {
  // Slugs são ASCII: não é preciso decodificar (e %-sequências inválidas simplesmente não casam)
  const slug = hash.replace(/^#/, '').toLowerCase();
  const section = Object.keys(SECTION_HASHES).find(key => SECTION_HASHES[key] === slug);
  return section ?? DEFAULT_SECTION;
}

/**
 * @param {string} section Nome da seção
 * @returns {string} Âncora com '#'
 */
export function getHashForSection(section) {
  return `#${SECTION_HASHES[section] ?? SECTION_HASHES[DEFAULT_SECTION]}`;
}
